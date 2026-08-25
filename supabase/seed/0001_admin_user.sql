-- ============================================================
-- akimax pet — Seeder 0001: Perfil del usuario administrador
--
-- Este seeder NO crea el usuario en Supabase Auth (eso lo hace
-- supabase/run.mjs via la API REST con service_role).
-- Solo asegura que el perfil del usuario admin exista con
-- rol 'Administrador'.
--
-- El valor {{ADMIN_EMAIL}} es reemplazado por supabase/run.mjs
-- usando la variable de entorno SUPABASE_ADMIN_EMAIL.
-- ============================================================

do $$
declare
  v_admin_email text := '{{ADMIN_EMAIL}}';
begin
  -- 1) Si el usuario ya existe en auth.users, asegurar su perfil
  update public.profiles
  set role = 'Administrador',
      full_name = coalesce(full_name, 'Administrador akimax')
  where email = v_admin_email
    and id in (select id from auth.users where email = v_admin_email);

  -- 2) Si el perfil no existe pero el usuario si en auth.users,
  --    insertarlo (por si el trigger no estaba cuando se creo)
  if exists (select 1 from auth.users where email = v_admin_email)
     and not exists (select 1 from public.profiles where email = v_admin_email) then
    insert into public.profiles (id, email, full_name, role)
    values (
      (select id from auth.users where email = v_admin_email limit 1),
      v_admin_email,
      'Administrador akimax',
      'Administrador'
    )
    on conflict (id) do update
      set role = 'Administrador',
          full_name = coalesce(public.profiles.full_name, excluded.full_name);
  end if;
end $$;