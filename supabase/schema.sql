-- ================================================================
-- KisanConnect — Run this in Supabase Dashboard → SQL Editor
-- ================================================================

create extension if not exists "uuid-ossp";

-- farmers
create table if not exists public.farmers (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  phone      text,
  village    text not null default '',
  taluka     text not null default '',
  district   text not null default '',
  state      text not null default 'Maharashtra',
  birth_date date,
  verified   boolean not null default false,
  avatar_url text,
  bio        text not null default '',
  farm_size_acres numeric(10,2) not null default 0.00,
  experience numeric(5,1) not null default 0.0,
  role       text not null default 'farmer' check (role in ('farmer','buyer','founder')),
  created_at timestamptz not null default now()
);
alter table public.farmers enable row level security;
create policy "Anyone can read farmers"    on public.farmers for select using (true);
create policy "Farmer can insert own row"  on public.farmers for insert with check (auth.uid() = id);
create policy "Farmer can update own row"  on public.farmers for update using (auth.uid() = id);

-- products
create table if not exists public.products (
  id             uuid primary key default uuid_generate_v4(),
  farmer_id      uuid not null references public.farmers(id) on delete cascade,
  name           text not null,
  name_hi        text not null default '',
  category       text not null check (category in ('vegetable','fruit','grain','spice')),
  price          numeric(10,2) not null check (price > 0),
  unit           text not null default 'kg',
  quantity       numeric(12,2) not null check (quantity >= 0),
  description    text not null default '',
  image_url      text,
  organic        boolean not null default false,
  lat            double precision,
  lng            double precision,
  location_label text,
  state          text not null default 'Maharashtra',
  active         boolean not null default true,
  created_at     timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "Anyone can read active products"  on public.products for select using (active = true);
create policy "Farmer can insert own products"   on public.products for insert with check (auth.uid() = farmer_id);
create policy "Farmer can update own products"   on public.products for update using (auth.uid() = farmer_id);
create policy "Farmer can delete own products"   on public.products for delete using (auth.uid() = farmer_id);

-- orders
create table if not exists public.orders (
  id             uuid primary key default uuid_generate_v4(),
  buyer_id       uuid not null references auth.users(id),
  farmer_id      uuid not null references public.farmers(id),
  product_id     uuid not null references public.products(id),
  quantity       numeric(12,2) not null,
  unit_price     numeric(10,2) not null,
  total_amount   numeric(12,2) not null,
  status         text not null default 'pending' check (status in ('pending','confirmed','delivered','cancelled')),
  payment_id     text,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  created_at     timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "Buyer sees own orders"             on public.orders for select using (auth.uid() = buyer_id);
create policy "Farmer sees orders for products"   on public.orders for select using (auth.uid() = farmer_id);
create policy "Buyer can create orders"           on public.orders for insert with check (auth.uid() = buyer_id);
create policy "Farmer can update order status"    on public.orders for update using (auth.uid() = farmer_id);

alter publication supabase_realtime add table public.orders;

-- user_activities
create table if not exists public.user_activities (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references public.farmers(id) on delete cascade,
  activity_type  text not null check (activity_type in ('login', 'logout', 'list_product', 'place_order', 'update_profile')),
  description    text not null,
  metadata       jsonb default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

alter table public.user_activities enable row level security;

create policy "Anyone can read user activities" on public.user_activities for select using (true);
create policy "Anyone can insert user activities" on public.user_activities for insert with check (true);

create index if not exists user_activities_user_id_idx on public.user_activities(user_id);
create index if not exists user_activities_created_at_idx on public.user_activities(created_at desc);

-- buyer_requests: Buyers send purchase/contract requests to farmers
create table if not exists public.buyer_requests (
  id             uuid primary key default uuid_generate_v4(),
  farmer_id      uuid references public.farmers(id) on delete set null,
  buyer_name     text not null,
  buyer_type     text not null default 'trader',
  product_name   text not null,
  qty_needed     numeric(12,2) not null,
  unit           text not null default 'kg',
  offer_price    numeric(10,2),
  message        text,
  phone          text,
  status         text not null default 'new' check (status in ('new','accepted','rejected','negotiating')),
  created_at     timestamptz not null default now()
);

alter table public.buyer_requests enable row level security;
create policy "Anyone can create buyer requests"  on public.buyer_requests for insert with check (true);
create policy "Farmer sees own requests"          on public.buyer_requests for select using (farmer_id is null or auth.uid() = farmer_id);
create policy "Farmer can update request status"  on public.buyer_requests for update using (auth.uid() = farmer_id);

create index if not exists buyer_requests_farmer_id_idx on public.buyer_requests(farmer_id);
create index if not exists buyer_requests_created_at_idx on public.buyer_requests(created_at desc);

-- b2b_listings: FPO/cooperative bulk supply listings
create table if not exists public.b2b_listings (
  id                  uuid primary key default uuid_generate_v4(),
  farmer_id           uuid references public.farmers(id) on delete cascade,
  farmer_name         text not null,
  cooperative         text,
  product             text not null,
  total_qty           numeric(12,2) not null,
  unit                text not null default 'kg',
  price_per_unit      numeric(10,2) not null,
  min_order_qty       numeric(12,2) not null,
  contract_duration   text,
  delivery_frequency  text,
  location            text,
  state               text not null default 'Maharashtra',
  organic             boolean not null default false,
  certifications      text[] default '{}',
  grade_avail         text[] default '{}',
  farmer_count        integer,
  rating              numeric(3,1),
  phone               text,
  active              boolean not null default true,
  created_at          timestamptz not null default now()
);

alter table public.b2b_listings enable row level security;
create policy "Anyone can view active B2B listings" on public.b2b_listings for select using (active = true);
create policy "Farmer can manage own B2B listings"  on public.b2b_listings for all  using (auth.uid() = farmer_id);

create index if not exists b2b_listings_state_idx on public.b2b_listings(state);
create index if not exists b2b_listings_created_at_idx on public.b2b_listings(created_at desc);
