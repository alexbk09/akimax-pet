-- ============================================================
-- akimax pet — Migración 0012: Fix persistencia de sesión
-- 1. Corrige el trigger sync_customer_on_user (evita duplicar clientes)
-- 2. Permite que un usuario autenticado cree su propio perfil
--    si el trigger de auth.users no lo generó (upsert por id).
-- ============================================================

-- ============================================================
-- 1. CORRECCIÓN TRIGGER: vincular cliente sin duplicados
-- ============================================================
create or replace function public.sync_customer_on_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  -- Solo para perfiles con rol Cliente
  if (new.role = 'Cliente') then
    -- Crear el cliente solo si no existe uno vinculado a este user_id
    if not exists (select 1 from public.customers where user_id = new.id) then
      -- Reutilizar un cliente existente por email sin user_id si es posible
      update public.customers
         set user_id = new.id, name = new.full_name, phone = coalesce(new.phone, phone)
       where email = new.email
         and user_id is null;

      -- Si no se actualizó ningún registro, crear uno nuevo
      if not exists (select 1 from public.customers where user_id = new.id) then
        insert into public.customers (user_id, name, email, phone, status)
        values (new.id, new.full_name, new.email, new.phone, 'Activo');
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_customer_on_user on public.profiles;
create trigger trg_sync_customer_on_user
after insert or update of role on public.profiles
for each row execute function public.sync_customer_on_user();

-- ============================================================
-- 2. RLS: usuario puede insertar su propio perfil (auto-crear)
-- ============================================================
drop policy if exists "Insertar perfil propio" on public.profiles;
create policy "Insertar perfil propio" on public.profiles
  for insert to authenticated
  with check (
    auth.uid() = id
    and role = 'Cliente'
  );