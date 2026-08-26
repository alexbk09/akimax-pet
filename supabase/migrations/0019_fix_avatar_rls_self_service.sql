-- ============================================================
-- akimax pet — Migración 0019: Fix RLS imágenes de mascotas
-- y auto-registro de clientes para autoservicio
-- ============================================================

-- ============================================================
-- 1. STORAGE: cualquier usuario autenticado puede subir la foto
--    de su mascota al bucket pet-avatars (sin dependencias externas)
-- ============================================================
drop policy if exists "Staff write pet avatars" on storage.objects;
drop policy if exists "Staff update pet avatars" on storage.objects;
drop policy if exists "Staff delete pet avatars" on storage.objects;

create policy "Auth upload pet avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'pet-avatars');

create policy "Auth update pet avatars"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'pet-avatars');

create policy "Auth delete pet avatars"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'pet-avatars');

-- ============================================================
-- 2. CLIENTES: cualquier usuario autenticado puede crear su
--    propio registro de cliente (user_id = auth.uid()) para
--    registro de mascotas en autoservicio.
-- ============================================================
drop policy if exists "Insertar clientes" on public.customers;
create policy "Insertar clientes"
  on public.customers for insert
  to authenticated
  with check (
    user_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('Administrador', 'Caja', 'Veterinario'))
  );