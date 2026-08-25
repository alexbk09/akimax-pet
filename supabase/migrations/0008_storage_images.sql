-- ============================================================
-- akimax pet — Migración 0008: Storage para imágenes con permisos
-- Buckets: products, services, pet-avatars, receipts
-- ============================================================

-- ---- Buckets ----
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('products', 'products', true, 5242880, array['image/png','image/jpeg','image/webp','image/gif']),
  ('services', 'services', true, 5242880, array['image/png','image/jpeg','image/webp','image/gif']),
  ('pet-avatars', 'pet-avatars', true, 2097152, array['image/png','image/jpeg','image/webp']),
  ('receipts', 'receipts', false, 10485760, array['application/pdf','image/png','image/jpeg'])
on conflict (id) do nothing;

-- ---- Políticas de storage ----

-- Lectura pública (buckets públicos)
drop policy if exists "Public read products" on storage.objects;
create policy "Public read products"
  on storage.objects for select
  to public
  using (bucket_id = 'products');

drop policy if exists "Public read services" on storage.objects;
create policy "Public read services"
  on storage.objects for select
  to public
  using (bucket_id = 'services');

drop policy if exists "Public read pet avatars" on storage.objects;
create policy "Public read pet avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'pet-avatars');

-- Lectura de recibos: solo autenticados
drop policy if exists "Auth read receipts" on storage.objects;
create policy "Auth read receipts"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'receipts');

-- Escritura: administradores en products/services
drop policy if exists "Admin write products" on storage.objects;
create policy "Admin write products"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "Admin update products" on storage.objects;
create policy "Admin update products"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'products' and public.is_admin());

drop policy if exists "Admin delete products" on storage.objects;
create policy "Admin delete products"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products' and public.is_admin());

drop policy if exists "Admin write services" on storage.objects;
create policy "Admin write services"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'services' and public.is_admin());

drop policy if exists "Admin update services" on storage.objects;
create policy "Admin update services"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'services' and public.is_admin());

drop policy if exists "Admin delete services" on storage.objects;
create policy "Admin delete services"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'services' and public.is_admin());

-- Escritura: caja/vet en pet-avatars, autenticados en receipts
drop policy if exists "Staff write pet avatars" on storage.objects;
create policy "Staff write pet avatars"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'pet-avatars' and (public.is_cashier() or public.is_vet()));

drop policy if exists "Auth write receipts" on storage.objects;
create policy "Auth write receipts"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'receipts');