-- ============================================================
-- akimax pet — Migración 0011: Espacio del cliente
-- Vincula usuarios autenticados a su registro de cliente y
-- ajusta RLS para que el rol Cliente solo vea/gestiones sus
-- propias mascotas, citas, historias y compras.
-- ============================================================

-- ============================================================
-- 1. VINCULACIÓN: user_id en customers
-- ============================================================
alter table public.customers
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists idx_customers_user on public.customers (user_id);

-- ============================================================
-- 2. HELPER: usuario tiene rol Cliente
-- ============================================================
create or replace function public.is_customer()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'Cliente')
$$;

grant execute on function public.is_customer() to authenticated;

-- ============================================================
-- 3. TRIGGER: al crear perfil de Cliente, crear/actualizar
-- su registro en customers automáticamente (vinculación por email).
-- ============================================================
create or replace function public.sync_customer_on_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  -- Solo para perfiles con rol Cliente
  if (new.role = 'Cliente') then
    insert into public.customers (user_id, name, email, phone, status)
    values (new.id, new.full_name, new.email, new.phone, 'Activo')
    on conflict (id) do nothing;
    -- Si ya existe un cliente con ese email pero sin user_id, lo vinculamos
    update public.customers
       set user_id = new.id, name = new.full_name, phone = coalesce(new.phone, phone)
     where email = new.email
       and user_id is null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_customer_on_user on public.profiles;
create trigger trg_sync_customer_on_user
after insert or update of role on public.profiles
for each row execute function public.sync_customer_on_user();

-- ============================================================
-- 4. RLS — CLIENTES:
--    * Cliente: solo su propio registro (ver y editar)
--    * Empleados: ven todos / caja gestiona / admin borra
-- ============================================================
drop policy if exists "Clientes visibles" on public.customers;
create policy "Clientes visibles" on public.customers
  for select to authenticated
  using (public.is_cashier() or public.is_vet() or public.is_admin() or user_id = auth.uid());

drop policy if exists "Insertar clientes" on public.customers;
create policy "Insertar clientes" on public.customers
  for insert to authenticated
  with check (public.is_cashier() or public.is_admin() or user_id = auth.uid());

drop policy if exists "Actualizar clientes" on public.customers;
create policy "Actualizar clientes" on public.customers
  for update to authenticated
  using (public.is_cashier() or public.is_admin() or user_id = auth.uid())
  with check (public.is_cashier() or public.is_admin() or user_id = auth.uid());

drop policy if exists "Eliminar clientes" on public.customers;
create policy "Eliminar clientes" on public.customers
  for delete to authenticated
  using (public.is_admin());

-- ============================================================
-- 5. RLS — MASCOTAS:
--    * Cliente: solo las de su customer (ver e insertar)
--    * Empleados: ven todas / caja-vet gestionan / admin borra
-- ============================================================
drop policy if exists "Mascotas visibles" on public.pets;
create policy "Mascotas visibles" on public.pets
  for select to authenticated
  using (
    public.is_cashier() or public.is_vet() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = pets.customer_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Insertar mascotas" on public.pets;
create policy "Insertar mascotas" on public.pets
  for insert to authenticated
  with check (
    public.is_cashier() or public.is_vet() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = pets.customer_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Actualizar mascotas" on public.pets;
create policy "Actualizar mascotas" on public.pets
  for update to authenticated
  using (
    public.is_cashier() or public.is_vet() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = pets.customer_id and c.user_id = auth.uid()
    )
  )
  with check (
    public.is_cashier() or public.is_vet() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = pets.customer_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Eliminar mascotas" on public.pets;
create policy "Eliminar mascotas" on public.pets
  for delete to authenticated
  using (public.is_admin());

-- ============================================================
-- 6. RLS — HISTORIAS CLÍNICAS:
--    * Cliente: solo las de sus mascotas
--    * Empleados: ven todas / vets gestionan
-- ============================================================
drop policy if exists "Historias visibles" on public.medical_records;
create policy "Historias visibles" on public.medical_records
  for select to authenticated
  using (
    public.is_cashier() or public.is_vet() or public.is_admin()
    or exists (
      select 1 from public.pets p
      join public.customers c on c.id = p.customer_id
      where p.id = medical_records.pet_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Insertar historias" on public.medical_records;
create policy "Insertar historias" on public.medical_records
  for insert to authenticated
  with check (public.is_vet() or public.is_admin());

drop policy if exists "Actualizar historias" on public.medical_records;
create policy "Actualizar historias" on public.medical_records
  for update to authenticated
  using (public.is_vet() or public.is_admin());

drop policy if exists "Eliminar historias" on public.medical_records;
create policy "Eliminar historias" on public.medical_records
  for delete to authenticated
  using (public.is_vet() or public.is_admin());

-- ============================================================
-- 7. RLS — CITAS:
--    * Cliente: solo las suyas (ver e insertar)
--    * Empleados: ven todas / vets-caja gestionan
-- ============================================================
drop policy if exists "Citas visibles" on public.appointments;
create policy "Citas visibles" on public.appointments
  for select to authenticated
  using (
    public.is_cashier() or public.is_vet() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = appointments.customer_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Insertar citas" on public.appointments;
create policy "Insertar citas" on public.appointments
  for insert to authenticated
  with check (
    public.is_vet() or public.is_cashier() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = appointments.customer_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Actualizar citas" on public.appointments;
create policy "Actualizar citas" on public.appointments
  for update to authenticated
  using (
    public.is_vet() or public.is_cashier() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = appointments.customer_id and c.user_id = auth.uid()
    )
  )
  with check (
    public.is_vet() or public.is_cashier() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = appointments.customer_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Eliminar citas" on public.appointments;
create policy "Eliminar citas" on public.appointments
  for delete to authenticated
  using (public.is_vet() or public.is_cashier() or public.is_admin());

-- ============================================================
-- 8. RLS — VENTAS:
--    * Cliente: solo sus ventas
--    * Empleados: ven todas / caja gestiona
-- ============================================================
drop policy if exists "Ventas visibles" on public.sales;
create policy "Ventas visibles" on public.sales
  for select to authenticated
  using (
    public.is_cashier() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = sales.customer_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Lineas visibles" on public.sale_items;
create policy "Lineas visibles" on public.sale_items
  for select to authenticated
  using (
    public.is_cashier() or public.is_admin()
    or exists (
      select 1 from public.sales s
      join public.customers c on c.id = s.customer_id
      where s.id = sale_items.sale_id and c.user_id = auth.uid()
    )
  );