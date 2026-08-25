-- ============================================================
-- akimax pet — Migración 0014: Especies, mascotas mejoradas,
-- horarios de profesionales y disponibilidad de citas
-- ============================================================

-- ============================================================
-- 1. ESPECIES: catálogo editable de especies
-- ============================================================
create table if not exists public.species (
  id serial primary key,
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  icon text not null default 'paw-print',
  status text not null default 'Activo' check (status in ('Activo', 'Inactivo')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. MASCOTAS: image_url, species_id y tamaño
-- ============================================================
alter table public.pets
  add column if not exists species_id integer references public.species (id) on delete set null,
  add column if not exists image_url text,
  add column if not exists size text check (size in ('Pequeño', 'Mediano', 'Grande') or size is null);

create index if not exists idx_pets_species on public.pets (species_id);

-- ============================================================
-- 3. SERVICIOS: duración en minutos para calcular slots
-- ============================================================
alter table public.services
  add column if not exists duration_minutes integer not null default 30 check (duration_minutes > 0);

-- Backfill: convertir duración texto a minutos en servicios existentes
update public.services
set duration_minutes = case
  when duration ilike '%15%' then 15
  when duration ilike '%20%' then 20
  when duration ilike '%30%' then 30
  when duration ilike '%45%' then 45
  when duration ilike '%60%' or duration ilike '%1 ho%' or duration ilike '%1h%' then 60
  when duration ilike '%90%' then 90
  when duration ilike '%2 ho%' or duration ilike '%2h%' then 120
  else duration_minutes
end;

-- ============================================================
-- 4. HORARIOS DE PROFESIONALES
-- day_of_week: 1 = Lunes ... 6 = Sábado, 0 = Domingo (JS/ISO)
-- ============================================================
create table if not exists public.professional_schedules (
  id serial primary key,
  professional_id uuid not null references auth.users (id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_working boolean not null default true,
  created_at timestamptz not null default now(),
  unique (professional_id, day_of_week)
);

create index if not exists idx_schedules_professional on public.professional_schedules (professional_id, day_of_week);

-- ============================================================
-- 5. CITAS: end_time para detectar conflictos de agenda
-- ============================================================
alter table public.appointments
  add column if not exists end_time time;

create index if not exists idx_appointments_professional_date on public.appointments (professional_id, date);

-- ============================================================
-- 6. RLS
-- ============================================================
alter table public.species enable row level security;
alter table public.professional_schedules enable row level security;

-- Especies: visibles para todos; gestionadas por staff y admin
drop policy if exists "Especies visibles" on public.species;
create policy "Especies visibles" on public.species
  for select to authenticated using (true);

drop policy if exists "Insertar especies" on public.species;
create policy "Insertar especies" on public.species
  for insert to authenticated
  with check (public.is_cashier() or public.is_vet() or public.is_admin());

drop policy if exists "Actualizar especies" on public.species;
create policy "Actualizar especies" on public.species
  for update to authenticated
  using (public.is_cashier() or public.is_vet() or public.is_admin())
  with check (public.is_cashier() or public.is_vet() or public.is_admin());

drop policy if exists "Eliminar especies" on public.species;
create policy "Eliminar especies" on public.species
  for delete to authenticated
  using (public.is_admin());

-- Horarios: visibles para todos los autenticados; gestionados por vets y admin
drop policy if exists "Horarios visibles" on public.professional_schedules;
create policy "Horarios visibles" on public.professional_schedules
  for select to authenticated using (true);

drop policy if exists "Insertar horarios" on public.professional_schedules;
create policy "Insertar horarios" on public.professional_schedules
  for insert to authenticated
  with check (public.is_vet() or public.is_admin());

drop policy if exists "Actualizar horarios" on public.professional_schedules;
create policy "Actualizar horarios" on public.professional_schedules
  for update to authenticated
  using (public.is_vet() or public.is_admin())
  with check (public.is_vet() or public.is_admin());

drop policy if exists "Eliminar horarios" on public.professional_schedules;
create policy "Eliminar horarios" on public.professional_schedules
  for delete to authenticated
  using (public.is_vet() or public.is_admin());

-- ============================================================
-- 7. SEED: especies comunes
-- ============================================================
insert into public.species (name, slug, description, icon) values
  ('Perro', 'perro', 'Compañero fiel. Requiere alimento balanceado, vacunas y desparasitación regular.', 'paw-print'),
  ('Gato', 'gato', 'Independiente y curioso. Cuidado con tóxicos comunes y control de peso.', 'cat'),
  ('Ave', 'ave', 'Ave doméstica. Necesita dieta de semillas, frutas y control veterinario aviar.', 'bird'),
  ('Conejo', 'conejo', 'Herbívoro. Dieta a base de heno, verduras frescas y agua limpia.', 'rabbit'),
  ('Roedor', 'roedor', 'Hámster, cobaya, etc. Dieta específica y ambiente cálido y seco.', 'rat'),
  ('Reptil', 'reptil', 'Tortugas, lagartos. Requieren terrario con temperatura y UVB controlados.', 'lizard'),
  ('Pez', 'pez', 'Pez de acuario. Alimentación controlada y mantenimiento del agua.', 'fish'),
  ('Equino', 'equino', 'Caballos y ponis. Cuidado de cascos, vacunas y alimentación de forraje.', 'horse'),
  ('Otro', 'otro', 'Otra especie no listada. Consulta con tu veterinario sobre su cuidado.', 'paw-print')
on conflict (name) do nothing;
</｜｜DSML｜｜content>
<task_progress>
- [x] Explorar estructura del proyecto
- [x] Revisar servicios existentes en lib/services
- [x] Revisar types existentes
- [x] Revisar migraciones y tablas Supabase existentes
- [x] Crear migración: especies, pets mejorados, horarios, duración servicios, end_time citas
- [ ] Crear tipos en lib/types.ts (Species, ProfessionalSchedule, actualizar Pet/Service/Appointment)
- [ ] Crear servicios (lib/services): species, schedules, actualizar customers/catalog/appointments
- [ ] Crear componentes UI: modal de registro mascota, formulario de citas
- [ ] Integrar imágenes de mascotas (supabase storage)
- [ ] Calcular horarios disponibles según servicio y profesional
- [ ] Actualizar app-shell y pacientes con el nuevo flujo
- [ ] Probar y verificar
</task_progress>
</write_to_file>