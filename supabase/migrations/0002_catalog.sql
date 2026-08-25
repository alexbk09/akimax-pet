-- ============================================================
-- akimax pet — Migración 0002: Catálogo (categorías, productos, servicios)
-- ============================================================

create table if not exists public.categories (
  id serial primary key,
  name text not null,
  slug text not null unique,
  type text not null check (type in ('Producto', 'Servicio')),
  status text not null default 'Visible' check (status in ('Visible', 'Oculta')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id serial primary key,
  name text not null,
  slug text not null unique,
  category_id integer references public.categories (id) on delete set null,
  price numeric(12, 2) not null default 0 check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  weight text,
  sku text,
  description text,
  status text not null default 'Activo' check (status in ('Activo', 'Borrador')),
  image_url text,
  tone text not null default 'bg-[#e8f3ef]',
  icon text not null default 'bag',
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id serial primary key,
  name text not null,
  slug text not null unique,
  category_id integer references public.categories (id) on delete set null,
  area text not null check (area in ('Veterinaria', 'Peluquería')),
  duration text not null default '30 min',
  description text not null default '',
  status text not null default 'Activo' check (status in ('Activo', 'Inactivo')),
  tone text not null default 'bg-[#e7f1eb]',
  icon text not null default 'stethoscope',
  created_at timestamptz not null default now()
);

create table if not exists public.service_prices (
  id serial primary key,
  service_id integer not null references public.services (id) on delete cascade,
  label text not null,
  price numeric(12, 2) not null check (price >= 0)
);

create index if not exists idx_products_category on public.products (category_id);
create index if not exists idx_products_name on public.products using gin (to_tsvector('spanish', name));
create index if not exists idx_services_category on public.services (category_id);