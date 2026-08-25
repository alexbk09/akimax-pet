-- ============================================================
-- akimax pet — Migración 0013: Fix recursión infinita RLS en profiles
--
-- Causa raíz:
--   La política "Ver perfil propio" (migración 0005) usaba una
--   subquery a la misma tabla profiles dentro de su expresión USING:
--     (select role from public.profiles where id = auth.uid())
--   PostgreSQL detecta la recursión y rechaza TODA consulta SELECT
--   sobre profiles con el error "infinite recursion detected in policy".
--   Resultado: la sesión inicia, pero getCurrentProfile() falla,
--   el perfil queda vacío y la UI muestra "Invitado" sin permisos.
--
-- Solución:
--   Reemplazar las subqueries directas por los helpers SECURITY DEFINER
--   creados en la migración 0007 (public.is_admin, current_user_role),
--   que consultan profiles fuera del contexto de la política y evitan
--   la recursión.
-- ============================================================

-- ============================================================
-- 1. PERFILES: cada usuario ve su propio perfil; admins ven todos
-- ============================================================
drop policy if exists "Ver perfil propio" on public.profiles;
create policy "Ver perfil propio" on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.is_admin());

-- ============================================================
-- 2. ROLES: solo administrador (mismo fix de recursión indirecta)
-- ============================================================
drop policy if exists "Roles solo admin" on public.roles;
create policy "Roles solo admin" on public.roles
  for select to authenticated
  using (public.is_admin());