-- ============================================================
-- akimax pet — Migración 0015: Clientes pueden subir fotos
-- de sus mascotas al bucket pet-avatars
-- ============================================================

-- Permitir que el cliente autenticado suba la foto de su mascota
drop policy if exists "Staff write pet avatars" on storage.objects;
create policy "Staff write pet avatars"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'pet-avatars'
    and (public.is_cashier() or public.is_vet() or public.is_admin() or public.is_customer())
  );

drop policy if exists "Staff update pet avatars" on storage.objects;
create policy "Staff update pet avatars"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'pet-avatars'
    and (public.is_cashier() or public.is_vet() or public.is_admin() or public.is_customer())
  );

drop policy if exists "Staff delete pet avatars" on storage.objects;
create policy "Staff delete pet avatars"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'pet-avatars'
    and (public.is_cashier() or public.is_vet() or public.is_admin() or public.is_customer())
  );