-- ============================================================
-- akimax pet — Seed: roles, catálogo, clientes, citas y ventas
-- ============================================================

-- ---- Roles y permisos ----
insert into public.roles (name, slug, description, permissions) values
  ('Administrador', 'administrador', 'Acceso completo al sistema.', array['dashboard:view','catalog:view','catalog:manage','appointments:view','appointments:manage','patients:view','patients:manage','cash:view','cash:manage','sales:view','sales:manage','customers:view','customers:manage','users:manage','roles:manage','reports:view','inventory:manage']),
  ('Veterinario', 'veterinario', 'Agenda, pacientes e historias clínicas.', array['dashboard:view','appointments:view','appointments:manage','patients:view','patients:manage','catalog:view','reports:view']),
  ('Caja', 'caja', 'Ventas, caja y facturación.', array['dashboard:view','cash:view','cash:manage','sales:view','sales:manage','customers:view','customers:manage','catalog:view','reports:view']),
  ('Cliente', 'cliente', 'Panel personal, citas y mascotas.', array['dashboard:view','appointments:view','patients:view'])
on conflict (name) do nothing;