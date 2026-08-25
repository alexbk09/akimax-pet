-- ============================================================
-- akimax pet — Migración 0016: Tabla de razas + especies ampliadas
-- ============================================================

-- 1. TABLA RAZAS
create table if not exists public.breeds (
  id serial primary key,
  species_id integer not null references public.species (id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (species_id, name)
);

create index if not exists idx_breeds_species on public.breeds (species_id, name);

alter table public.breeds enable row level security;

drop policy if exists "Razas visibles" on public.breeds;
create policy "Razas visibles" on public.breeds
  for select to authenticated using (true);

drop policy if exists "Insertar razas" on public.breeds;
create policy "Insertar razas" on public.breeds
  for insert to authenticated
  with check (public.is_cashier() or public.is_vet() or public.is_admin());

drop policy if exists "Actualizar razas" on public.breeds;
create policy "Actualizar razas" on public.breeds
  for update to authenticated
  using (public.is_cashier() or public.is_vet() or public.is_admin())
  with check (public.is_cashier() or public.is_vet() or public.is_admin());

drop policy if exists "Eliminar razas" on public.breeds;
create policy "Eliminar razas" on public.breeds
  for delete to authenticated
  using (public.is_admin());

-- 2. ESPECIES AMPLIADAS
insert into public.species (name, slug, description, icon) values
  ('Perro', 'perro', 'Compañero fiel. Requiere alimento balanceado, vacunas y desparasitación regular.', 'paw-print'),
  ('Gato', 'gato', 'Independiente y curioso. Cuidado con tóxicos comunes y control de peso.', 'cat'),
  ('Ave', 'ave', 'Ave doméstica. Necesita dieta de semillas, frutas y control veterinario aviar.', 'bird'),
  ('Conejo', 'conejo', 'Herbívoro. Dieta a base de heno, verduras frescas y agua limpia.', 'rabbit'),
  ('Roedor', 'roedor', 'Hámster, cobaya, etc. Dieta específica y ambiente cálido y seco.', 'rat'),
  ('Reptil', 'reptil', 'Tortugas, lagartos. Requieren terrario con temperatura y UVB controlados.', 'lizard'),
  ('Pez', 'pez', 'Pez de acuario. Alimentación controlada y mantenimiento del agua.', 'fish'),
  ('Equino', 'equino', 'Caballos y ponis. Cuidado de cascos, vacunas y alimentación de forraje.', 'horse'),
  ('Hurón', 'huron', 'Pequeño carnívoro curioso. Requiere dieta rica en proteína y espacio para jugar.', 'paw-print'),
  ('Cerdo', 'cerdo', 'Cerdo miniatura o granja. Necesita espacio, dieta controlada y chequeos regulares.', 'pig'),
  ('Cabro', 'cabro', 'Caprino doméstico. Dieta de forraje y vigilancia de pezuñas y parásitos.', 'goat'),
  ('Oveja', 'oveja', 'Oveja doméstica. Requiere esquila, dieta de pasto y control de parásitos.', 'sheep'),
  ('Vaca', 'vaca', 'Bovino. Manejo de pezuñas, vacunas y alimentación de forraje.', 'cow'),
  ('Anfibio', 'anfibio', 'Ranas y sapos. Requieren terrario húmedo, temperatura controlada y dieta de insectos.', 'frog'),
  ('Araña', 'arana', 'Tarántulas y arácnidos. Terrario con humedad y alimentación de insectos vivos.', 'spider'),
  ('Escorpión', 'escorpion', 'Escorpiones. Terrario seco con temperatura controlada y dieta de insectos.', 'scorpion'),
  ('Otro', 'otro', 'Otra especie no listada. Consulta con tu veterinario sobre su cuidado.', 'paw-print')
on conflict (name) do nothing;