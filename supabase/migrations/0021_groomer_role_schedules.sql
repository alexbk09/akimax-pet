-- ============================================================
-- akimax pet — Migración 0021: Rol Peluquero + horarios
-- Agrega el rol Peluquero (estética) para que pueda:
--   * Gestionar SU horario de trabajo (professional_schedules)
--   * Ver y gestionar citas del área de peluquería
-- ============================================================

-- ============================================================
-- 1. ROL PELUQUERO
-- ============================================================
insert into public.roles (name, slug, description, permissions) values
  ('Peluquero', 'peluquero', 'Agenda y servicios de estética y peluquería.', array['dashboard:view','appointments:view','appointments:manage','patients:view','catalog:view'])
on conflict (name) do nothing;

-- ============================================================
-- 2. HELPER: es peluquero (o admin)
-- ============================================================
create or replace function public.is_groomer()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('Peluquero', 'Administrador'))
$$;

grant execute on function public.is_groomer() to authenticated;

-- ============================================================
-- 2b. PERFILES VISIBLES:
--     Cualquier cliente autenticado debe poder ver a los
--     veterinarios/peluqueros para seleccionarlos al agendar.
--     (La política anterior solo permitía ver el perfil propio o ser admin.)
-- ============================================================
drop policy if exists "Perfiles de atencion visibles" on public.profiles;
create policy "Perfiles de atencion visibles" on public.profiles
  for select to authenticated
  using (
    role in ('Veterinario', 'Peluquero', 'Administrador')
  );

-- ============================================================
-- 3. RLS — HORARIOS DE PROFESIONALES:
--    peluqueros también pueden gestionar sus horarios
-- ============================================================
drop policy if exists "Insertar horarios" on public.professional_schedules;
create policy "Insertar horarios" on public.professional_schedules
  for insert to authenticated
  with check (
    public.is_vet() or public.is_groomer()
  );

drop policy if exists "Actualizar horarios" on public.professional_schedules;
create policy "Actualizar horarios" on public.professional_schedules
  for update to authenticated
  using (public.is_vet() or public.is_groomer())
  with check (public.is_vet() or public.is_groomer());

drop policy if exists "Eliminar horarios" on public.professional_schedules;
create policy "Eliminar horarios" on public.professional_schedules
  for delete to authenticated
  using (public.is_vet() or public.is_groomer());

-- ============================================================
-- 4. RLS — CITAS:
--    * SELECT: peluqueros ven todas
--    * INSERT/UPDATE: peluqueros y caja pueden gestionar
-- ============================================================
drop policy if exists "Citas visibles" on public.appointments;
create policy "Citas visibles" on public.appointments
  for select to authenticated
  using (
    public.is_cashier() or public.is_vet() or public.is_groomer() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = appointments.customer_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Insertar citas" on public.appointments;
create policy "Insertar citas" on public.appointments
  for insert to authenticated
  with check (
    public.is_vet() or public.is_cashier() or public.is_groomer() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = appointments.customer_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Actualizar citas" on public.appointments;
create policy "Actualizar citas" on public.appointments
  for update to authenticated
  using (
    public.is_vet() or public.is_cashier() or public.is_groomer() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = appointments.customer_id and c.user_id = auth.uid()
    )
  )
  with check (
    public.is_vet() or public.is_cashier() or public.is_groomer() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = appointments.customer_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Eliminar citas" on public.appointments;
create policy "Eliminar citas" on public.appointments
  for delete to authenticated
  using (public.is_vet() or public.is_cashier() or public.is_groomer() or public.is_admin());

-- ============================================================
-- 5. RLS — MASCOTAS: peluqueros ven y gestionan mascotas
-- (necesarias para ver datos del paciente en su agenda)
-- ============================================================
drop policy if exists "Mascotas visibles" on public.pets;
create policy "Mascotas visibles" on public.pets
  for select to authenticated
  using (
    public.is_cashier() or public.is_vet() or public.is_groomer() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = pets.customer_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Insertar mascotas" on public.pets;
create policy "Insertar mascotas" on public.pets
  for insert to authenticated
  with check (
    public.is_cashier() or public.is_vet() or public.is_groomer() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = pets.customer_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Actualizar mascotas" on public.pets;
create policy "Actualizar mascotas" on public.pets
  for update to authenticated
  using (
    public.is_cashier() or public.is_vet() or public.is_groomer() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = pets.customer_id and c.user_id = auth.uid()
    )
  )
  with check (
    public.is_cashier() or public.is_vet() or public.is_groomer() or public.is_admin()
    or exists (
      select 1 from public.customers c
      where c.id = pets.customer_id and c.user_id = auth.uid()
    )
  );