-- ============================================================
-- akimax pet — Migración 0020: Columnas reales de pets para
-- que createPet funcione sin error de columna inexistente
-- ============================================================

-- Añadir columnas que el frontend envía al crear/editar mascotas
alter table public.pets
  add column if not exists species_id integer references public.species (id) on delete set null,
  add column if not exists image_url text,
  add column if not exists size text check (size in ('Pequeño', 'Mediano', 'Grande') or size is null),
  add column if not exists initials text not null default '';

create index if not exists idx_pets_species on public.pets (species_id);