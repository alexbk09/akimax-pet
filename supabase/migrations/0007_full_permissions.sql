-- ============================================================
-- akimax pet — Migración 0007: Permisos RLS completos por rol
-- INSERT/UPDATE/DELETE para cada tabla según el rol del usuario.
-- ============================================================

-- Helper: rol del usuario autenticado
create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Helper: es administrador
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'Administrador')
$$;

-- Helper: es caja o administrador
create or replace function public.is_cashier()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('Caja', 'Administrador'))
$$;

-- Helper: es veterinario o administrador
create or replace function public.is_vet()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('Veterinario', 'Administrador'))
$$;

-- ============================================================
-- 1. PRODUCTOS: admins gestionan, todos ven
-- ============================================================
drop policy if exists "Insertar productos" on public.products;
create policy "Insertar productos" on public.products for insert to authenticated with check (public.is_admin());
drop policy if exists "Actualizar productos" on public.products;
create policy "Actualizar productos" on public.products for update to authenticated using (public.is_admin());
drop policy if exists "Eliminar productos" on public.products;
create policy "Eliminar productos" on public.products for delete to authenticated using (public.is_admin());

-- ============================================================
-- 2. SERVICIOS: admins gestionan
-- ============================================================
drop policy if exists "Insertar servicios" on public.services;
create policy "Insertar servicios" on public.services for insert to authenticated with check (public.is_admin());
drop policy if exists "Actualizar servicios" on public.services;
create policy "Actualizar servicios" on public.services for update to authenticated using (public.is_admin());
drop policy if exists "Eliminar servicios" on public.services;
create policy "Eliminar servicios" on public.services for delete to authenticated using (public.is_admin());

drop policy if exists "Insertar tarifas" on public.service_prices;
create policy "Insertar tarifas" on public.service_prices for insert to authenticated with check (public.is_admin());
drop policy if exists "Actualizar tarifas" on public.service_prices;
create policy "Actualizar tarifas" on public.service_prices for update to authenticated using (public.is_admin());
drop policy if exists "Eliminar tarifas" on public.service_prices;
create policy "Eliminar tarifas" on public.service_prices for delete to authenticated using (public.is_admin());

-- ============================================================
-- 3. CATEGORÍAS: admins gestionan
-- ============================================================
drop policy if exists "Insertar categorias" on public.categories;
create policy "Insertar categorias" on public.categories for insert to authenticated with check (public.is_admin());
drop policy if exists "Actualizar categorias" on public.categories;
create policy "Actualizar categorias" on public.categories for update to authenticated using (public.is_admin());
drop policy if exists "Eliminar categorias" on public.categories;
create policy "Eliminar categorias" on public.categories for delete to authenticated using (public.is_admin());

-- ============================================================
-- 4. CLIENTES: caja y admins gestionan
-- ============================================================
drop policy if exists "Insertar clientes" on public.customers;
create policy "Insertar clientes" on public.customers for insert to authenticated with check (public.is_cashier());
drop policy if exists "Actualizar clientes" on public.customers;
create policy "Actualizar clientes" on public.customers for update to authenticated using (public.is_cashier());
drop policy if exists "Eliminar clientes" on public.customers;
create policy "Eliminar clientes" on public.customers for delete to authenticated using (public.is_admin());

-- ============================================================
-- 5. MASCOTAS: caja y admins gestionan
-- ============================================================
drop policy if exists "Insertar mascotas" on public.pets;
create policy "Insertar mascotas" on public.pets for insert to authenticated with check (public.is_cashier() or public.is_vet());
drop policy if exists "Actualizar mascotas" on public.pets;
create policy "Actualizar mascotas" on public.pets for update to authenticated using (public.is_cashier() or public.is_vet());
drop policy if exists "Eliminar mascotas" on public.pets;
create policy "Eliminar mascotas" on public.pets for delete to authenticated using (public.is_admin());

-- ============================================================
-- 6. HISTORIAS CLÍNICAS: veterinarios gestionan
-- ============================================================
drop policy if exists "Insertar historias" on public.medical_records;
create policy "Insertar historias" on public.medical_records for insert to authenticated with check (public.is_vet());
drop policy if exists "Actualizar historias" on public.medical_records;
create policy "Actualizar historias" on public.medical_records for update to authenticated using (public.is_vet());
drop policy if exists "Eliminar historias" on public.medical_records;
create policy "Eliminar historias" on public.medical_records for delete to authenticated using (public.is_vet());

-- ============================================================
-- 7. CITAS: veterinarios y admins gestionan
-- ============================================================
drop policy if exists "Insertar citas" on public.appointments;
create policy "Insertar citas" on public.appointments for insert to authenticated with check (public.is_vet() or public.is_cashier());
drop policy if exists "Actualizar citas" on public.appointments;
create policy "Actualizar citas" on public.appointments for update to authenticated using (public.is_vet() or public.is_cashier());
drop policy if exists "Eliminar citas" on public.appointments;
create policy "Eliminar citas" on public.appointments for delete to authenticated using (public.is_vet() or public.is_cashier());

-- ============================================================
-- 8. VENTAS: caja gestiona
-- ============================================================
drop policy if exists "Insertar ventas" on public.sales;
create policy "Insertar ventas" on public.sales for insert to authenticated with check (public.is_cashier());
drop policy if exists "Actualizar ventas" on public.sales;
create policy "Actualizar ventas" on public.sales for update to authenticated using (public.is_cashier());
drop policy if exists "Eliminar ventas" on public.sales;
create policy "Eliminar ventas" on public.sales for delete to authenticated using (public.is_admin());

drop policy if exists "Insertar lineas" on public.sale_items;
create policy "Insertar lineas" on public.sale_items for insert to authenticated with check (public.is_cashier());
drop policy if exists "Actualizar lineas" on public.sale_items;
create policy "Actualizar lineas" on public.sale_items for update to authenticated using (public.is_cashier());

-- ============================================================
-- 9. CAJA: caja y admins gestionan
-- ============================================================
drop policy if exists "Insertar caja" on public.cash_registers;
create policy "Insertar caja" on public.cash_registers for insert to authenticated with check (public.is_cashier());
drop policy if exists "Actualizar caja" on public.cash_registers;
create policy "Actualizar caja" on public.cash_registers for update to authenticated using (public.is_cashier());
drop policy if exists "Eliminar caja" on public.cash_registers;
create policy "Eliminar caja" on public.cash_registers for delete to authenticated using (public.is_admin());

-- ============================================================
-- 10. INVENTARIO: admins gestionan
-- ============================================================
drop policy if exists "Insertar inventario" on public.inventory_movements;
create policy "Insertar inventario" on public.inventory_movements for insert to authenticated with check (public.is_admin());
drop policy if exists "Actualizar inventario" on public.inventory_movements;
create policy "Actualizar inventario" on public.inventory_movements for update to authenticated using (public.is_admin());
drop policy if exists "Eliminar inventario" on public.inventory_movements;
create policy "Eliminar inventario" on public.inventory_movements for delete to authenticated using (public.is_admin());

-- ============================================================
-- 11. PERFILES: admin gestiona roles, usuario edita su perfil
-- ============================================================
drop policy if exists "Actualizar perfil propio" on public.profiles;
create policy "Actualizar perfil propio" on public.profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "Insertar perfiles" on public.profiles;
create policy "Insertar perfiles" on public.profiles for insert to authenticated with check (public.is_admin());

drop policy if exists "Eliminar perfiles" on public.profiles;
create policy "Eliminar perfiles" on public.profiles for delete to authenticated using (public.is_admin());

-- ============================================================
-- 12. ROLES: solo admins gestionan
-- ============================================================
drop policy if exists "Insertar roles" on public.roles;
create policy "Insertar roles" on public.roles for insert to authenticated with check (public.is_admin());
drop policy if exists "Actualizar roles" on public.roles;
create policy "Actualizar roles" on public.roles for update to authenticated using (public.is_admin());
drop policy if exists "Eliminar roles" on public.roles;
create policy "Eliminar roles" on public.roles for delete to authenticated using (public.is_admin());

-- ============================================================
-- 13. TASA DE CAMBIO: solo admins insertan/actualizan
-- ============================================================
drop policy if exists "Insertar tasa" on public.exchange_rates;
create policy "Insertar tasa" on public.exchange_rates for insert to authenticated with check (public.is_admin());
drop policy if exists "Actualizar tasa" on public.exchange_rates;
create policy "Actualizar tasa" on public.exchange_rates for update to authenticated using (public.is_admin());

-- ============================================================
-- Grants adicionales para las funciones helper
-- ============================================================
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_cashier() to authenticated;
grant execute on function public.is_vet() to authenticated;