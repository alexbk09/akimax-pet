-- ============================================================
-- akimax pet — Migración 0003: Clientes, pacientes e historias
-- ============================================================

create table if not exists public.customers (
  id serial primary key,
  name text not null,
  email text,
  phone text,
  document text,
  address text,
  status text not null default 'Activo' check (status in ('Activo', 'Inactivo')),
  created_at timestamptz not null default now()
);

create table if not exists public.pets (
  id serial primary key,
  customer_id integer not null references public.customers (id) on delete cascade,
  name text not null,
  species text not null,
  breed text,
  birth_date date,
  weight_kg numeric(6, 2),
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.medical_records (
  id serial primary key,
  pet_id integer not null references public.pets (id) on delete cascade,
  date date not null default current_date,
  title text not null,
  detail text not null default '',
  type text not null default 'Control' check (type in ('Control', 'Vacuna', 'Desparasitación', 'Cirugía', 'Otro')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pets_customer on public.pets (customer_id);
create index if not exists idx_medical_records_pet on public.medical_records (pet_id);