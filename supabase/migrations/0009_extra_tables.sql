-- ============================================================
-- akimax pet — Migración 0009: Tablas complementarias
-- Vista users, audit_logs, notifications, app_settings
-- ============================================================

-- ============================================================
-- 1. VISTA USERS: unifica auth.users + profiles para gestión
-- Permite a los admins ver todos los usuarios con su rol y estado.
-- ============================================================
create or replace view public.users as
select
  p.id,
  p.full_name,
  coalesce(p.email, u.email) as email,
  p.phone,
  p.role,
  p.avatar_url,
  p.active,
  u.created_at as registered_at,
  u.last_sign_in_at,
  p.updated_at
from public.profiles p
left join auth.users u on u.id = p.id;

create or replace function public.is_view_owner()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'Administrador')
$$;

-- ============================================================
-- 2. AUDIT LOGS: registra acciones sensibles del sistema
-- ============================================================
create table if not exists public.audit_logs (
  id bigserial primary key,
  user_id uuid references auth.users (id) on delete set null,
  action text not null,
  table_name text not null,
  record_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_user on public.audit_logs (user_id);
create index if not exists idx_audit_logs_table on public.audit_logs (table_name, created_at desc);

alter table public.audit_logs enable row level security;

drop policy if exists "Audit visible" on public.audit_logs;
create policy "Audit visible" on public.audit_logs for select to authenticated using (public.is_admin());
drop policy if exists "Audit insert" on public.audit_logs;
create policy "Audit insert" on public.audit_logs for insert to authenticated with check (public.is_admin());

-- ============================================================
-- 3. NOTIFICACIONES: avisos internos por usuario
-- ============================================================
create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid references auth.users (id) on delete cascade,
  title text not null,
  body text not null default '',
  type text not null default 'Info' check (type in ('Info', 'Stock', 'Cita', 'Venta', 'Alerta')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications (user_id, read, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Ver notificaciones propias" on public.notifications;
create policy "Ver notificaciones propias" on public.notifications
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Insertar notificaciones" on public.notifications;
create policy "Insertar notificaciones" on public.notifications
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Actualizar notificaciones propias" on public.notifications;
create policy "Actualizar notificaciones propias" on public.notifications
  for update to authenticated
  using (auth.uid() = user_id);

-- Trigger: notificación de stock bajo al crear un movimiento de salida
create or replace function public.notify_low_stock()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  v_product text;
begin
  if new.type = 'Salida' then
    select name into v_product from public.products where id = new.product_id;
    if v_product is not null and (select stock from public.products where id = new.product_id) < 5 then
      insert into public.notifications (user_id, title, body, type)
      values (
        new.user_id,
        'Stock bajo: ' || v_product,
        'Quedan menos de 5 unidades de ' || v_product || '. Considera reponer.',
        'Stock'
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_low_stock_notification on public.inventory_movements;
create trigger trg_low_stock_notification
after insert on public.inventory_movements
for each row execute function public.notify_low_stock();

-- ============================================================
-- 4. APP SETTINGS: configuración global del sistema
-- ============================================================
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value) values
  ('business_name', jsonb_build_object('value', 'akimax pet')),
  ('currency', jsonb_build_object('value', 'USD')),
  ('low_stock_threshold', jsonb_build_object('value', 5)),
  ('appointment_reminder_hours', jsonb_build_object('value', 24))
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists "Settings visible" on public.app_settings;
create policy "Settings visible" on public.app_settings for select to authenticated using (true);
drop policy if exists "Settings admin update" on public.app_settings;
create policy "Settings admin update" on public.app_settings for update to authenticated using (public.is_admin());

-- ============================================================
-- GRANT en la vista users (solo admins pueden leer)
-- ============================================================
revoke all on public.users from anon, authenticated;
grant select on public.users to authenticated;