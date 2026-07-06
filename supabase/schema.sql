-- Life on a Canvas — Supabase schema
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).

create extension if not exists pgcrypto;

-- ── Products ─────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,          -- e.g. "Cement Trinket Tray (Pearl Blossom)"
  category text not null,             -- display name, e.g. "Home & Decor"
  category_slug text not null,        -- filter value, e.g. "Home and Decor"
  cat_color text not null,            -- CSS var, e.g. "var(--mint)"
  price numeric not null,
  image_url text,                     -- e.g. "images/tray-pearl-blossom.png" (or a full URL)
  emoji text,                         -- used instead of image_url for a couple of placeholder cards
  emoji_bg text,
  description text not null,
  personalisation text[] not null default '{}',
  care text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

-- Anyone (including the public anon key) can read products.
create policy "Public can read products"
  on products for select
  using (true);

-- No insert/update/delete policies are defined for the anon role,
-- so the public key can never modify the catalog — only you can,
-- via the Supabase table editor or the SQL editor.

-- ── Orders / inquiries ───────────────────────────────────
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null,
  product text,
  personalisation text,
  message text,
  source text not null default 'contact_form',
  created_at timestamptz not null default now()
);

alter table orders enable row level security;

-- Anyone can submit an order (insert only — they cannot read others' orders back).
create policy "Public can submit orders"
  on orders for insert
  with check (true);

-- No select policy for anon: only you, logged into the Supabase dashboard
-- (which uses the privileged service role), can read the orders table.
