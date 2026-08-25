-- ============================================================
-- akimax pet — Migración 0001: Roles, permisos y perfiles
-- ============================================================
create extension if not exists "pgcrypto";

create table if not exists public.roles (
  id serial primary key,
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  permissions text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role text not null default 'Cliente' references public.roles (name),
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);