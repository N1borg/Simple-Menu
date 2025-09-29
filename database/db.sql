-- Establishment table
create table public.establishments (
  id uuid not null default gen_random_uuid (),
  name character varying(255) not null,
  slug character varying(100) not null,
  logo_url text null,
  primary_color character varying(7) null default null::character varying,
  created_at timestamp without time zone null default now(),
  admin_hash text null,
  plan character varying(20) not null default 'essentiel'::character varying,
  address text null,
  phone text null,
  email text null,
  facebook_url text null,
  instagram_url text null,
  opening_hours jsonb null,
  google_maps_url text null,
  is_active boolean not null default true,
  plan_status text null default 'trial'::text,
  stripe_customer_id text null,
  stripe_subscription_id text null,
  subscription_started_at timestamp with time zone null,
  trial_ends_at timestamp with time zone null,
  secondary_color character varying(7) null default null::character varying,
  basket_enabled boolean not null default true,
  constraint establishments_pkey primary key (id),
  constraint establishments_slug_key unique (slug)
) TABLESPACE pg_default;

create index IF not exists idx_establishments_stripe_customer_id on public.establishments using btree (stripe_customer_id) TABLESPACE pg_default;

create index IF not exists idx_establishments_stripe_subscription_id on public.establishments using btree (stripe_subscription_id) TABLESPACE pg_default;

create index IF not exists idx_establishments_plan_status on public.establishments using btree (plan_status) TABLESPACE pg_default;

create index IF not exists idx_establishments_is_active on public.establishments using btree (is_active) TABLESPACE pg_default;

-- Category table
create table public.categories (
  id uuid not null default gen_random_uuid (),
  establishment_id uuid null,
  name character varying(100) not null,
  display_order integer null default 0,
  created_at timestamp without time zone not null default now(),
  display_style text null default 'card'::text,
  is_available boolean null default true,
  alcohol_free boolean null default false,
  vegan boolean null default false,
  constraint categories_pkey primary key (id),
  constraint categories_establishment_id_fkey foreign KEY (establishment_id) references establishments (id) on delete CASCADE
) TABLESPACE pg_default;

-- Menu_Items table
create table public.menu_items (
  id uuid not null default gen_random_uuid (),
  category_id uuid null,
  name character varying(255) not null,
  description text null,
  image_url text null,
  is_available boolean null default true,
  display_order integer null default 0,
  created_at timestamp without time zone null default now(),
  display_style text null,
  alcohol_free boolean null default false,
  vegan boolean null default false,
  price_one numeric(10, 2) null,
  price_two numeric(10, 2) null,
  price_three numeric(10, 2) null,
  price_reduction character varying(16) null,
  constraint menu_items_pkey primary key (id),
  constraint menu_items_category_id_fkey foreign KEY (category_id) references categories (id) on delete CASCADE
) TABLESPACE pg_default;
