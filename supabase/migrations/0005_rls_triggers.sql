-- ============================================================
-- akimax pet — Migración 0005: RLS, triggers y funciones
-- ============================================================

-- Tasa de cambio
create table if not exists public.exchange_rates (
  id serial primary key,
  currency text not null default 'USD',
  rate numeric(12, 4) not null,
  source text not null default 'dolarapi' check (source in ('dolarapi', 'manual')),
  fetched_at timestamptz not null default now()
);
create index if not exists idx_exchange_rates_currency on public.exchange_rates (currency, fetched_at desc);

-- Trigger: actualizar updated_at en profiles
create or replace function public.handle_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

-- Trigger: crear perfil automáticamente al registrarse un usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email, 'Cliente')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================
-- RLS: habilitar en todas las tablas
-- ============================================================
alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.service_prices enable row level security;
alter table public.customers enable row level security;
alter table public.pets enable row level security;
alter table public.medical_records enable row level security;
alter table public.appointments enable row level security;
alter table public.cash_registers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.exchange_rates enable row level security;

-- ============================================================
-- Políticas de acceso por rol
-- ============================================================

-- Catálogo: visible para todos los usuarios autenticados
create policy "Catalogo visible" on public.products for select to authenticated using (true);
create policy "Catalogo visible" on public.services for select to authenticated using (true);
create policy "Categorias visibles" on public.categories for select to authenticated using (true);
create policy "Tarifas visibles" on public.service_prices for select to authenticated using (true);

-- Tasa de cambio: visible para autenticados (gestionada por service/externo)
create policy "Tasa visible" on public.exchange_rates for select to authenticated using (true);

-- Perfiles: cada usuario ve su propio perfil; admins ven todos
create policy "Ver perfil propio" on public.profiles for select to authenticated using (auth.uid() = id or (select role from public.profiles where id = auth.uid()) = 'Administrador');

-- Roles: solo administrador
create policy "Roles solo admin" on public.roles for select to authenticated using ((select role from public.profiles where id = auth.uid()) = 'Administrador');

-- Clientes y mascotas: autenticados pueden leer; admins y caja gestionan
create policy "Clientes visibles" on public.customers for select to authenticated using (true);
create policy "Mascotas visibles" on public.pets for select to authenticated using (true);
create policy "Historias visibles" on public.medical_records for select to authenticated using (true);

-- Citas: autenticados pueden ver; veterinarios y admins gestionan
create policy "Citas visibles" on public.appointments for select to authenticated using (true);

-- Ventas y caja: autenticados ven; caja y admin gestionan
create policy "Ventas visibles" on public.sales for select to authenticated using (true);
create policy "Lineas visibles" on public.sale_items for select to authenticated using (true);
create policy "Caja visible" on public.cash_registers for select to authenticated using (true);

-- Inventario: autenticados ven movimientos
create policy "Inventario visible" on public.inventory_movements for select to authenticated using (true);