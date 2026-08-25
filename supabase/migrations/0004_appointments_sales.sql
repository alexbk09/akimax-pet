-- ============================================================
-- akimax pet — Migración 0004: Citas, caja, ventas e inventario
-- ============================================================

create table if not exists public.appointments (
  id serial primary key,
  customer_id integer references public.customers (id) on delete set null,
  pet_id integer references public.pets (id) on delete set null,
  service_id integer references public.services (id) on delete set null,
  professional_id uuid references auth.users (id) on delete set null,
  date date not null,
  time time not null,
  status text not null default 'Confirmada' check (status in ('Confirmada', 'En espera', 'Completada', 'Cancelada')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.cash_registers (
  id serial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  opening_amount numeric(12, 2) not null default 0,
  closing_amount numeric(12, 2),
  status text not null default 'Abierta' check (status in ('Abierta', 'Cerrada')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.sales (
  id serial primary key,
  customer_id integer references public.customers (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  subtotal_usd numeric(12, 2) not null default 0,
  total_usd numeric(12, 2) not null default 0,
  total_ves numeric(12, 2) not null default 0,
  payment_method text not null default 'Efectivo USD' check (payment_method in ('Efectivo USD', 'Efectivo VES', 'Tarjeta', 'Pago móvil')),
  status text not null default 'Pagada' check (status in ('Pagada', 'Pendiente', 'Anulada')),
  created_at timestamptz not null default now()
);

create table if not exists public.sale_items (
  id serial primary key,
  sale_id integer not null references public.sales (id) on delete cascade,
  item_id text not null,
  name text not null,
  kind text not null check (kind in ('Producto', 'Servicio')),
  price numeric(12, 2) not null,
  quantity integer not null default 1 check (quantity > 0)
);

create table if not exists public.inventory_movements (
  id serial primary key,
  product_id integer not null references public.products (id) on delete cascade,
  type text not null check (type in ('Entrada', 'Salida', 'Ajuste')),
  quantity integer not null check (quantity <> 0),
  reason text,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_appointments_date on public.appointments (date);
create index if not exists idx_appointments_status on public.appointments (status);
create index if not exists idx_sales_created on public.sales (created_at desc);
create index if not exists idx_sale_items_sale on public.sale_items (sale_id);
create index if not exists idx_inventory_product on public.inventory_movements (product_id);