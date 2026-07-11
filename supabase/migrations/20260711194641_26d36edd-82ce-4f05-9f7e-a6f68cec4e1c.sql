create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role public.app_role not null default 'user',
    created_at timestamp with time zone default now(),
    unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

create table public.sites (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    domain text not null,
    provider text,
    currency text default 'USD',
    status text default 'pending_payment',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique (user_id, domain)
);

create table public.payment_connections (
    id uuid primary key default gen_random_uuid(),
    site_id uuid references public.sites(id) on delete cascade not null,
    provider text not null check (provider in ('stripe', 'paddle', 'shopify', 'paypal', 'gumroad', 'lemonsqueezy', 'manual')),
    secret_name text,
    config jsonb default '{}',
    status text default 'pending',
    last_sync_at timestamp with time zone,
    last_error text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique (site_id)
);

create table public.revenue_snapshots (
    id uuid primary key default gen_random_uuid(),
    site_id uuid references public.sites(id) on delete cascade not null,
    snapshot_date date not null,
    gross numeric(12,2) default 0,
    net numeric(12,2) default 0,
    refunds numeric(12,2) default 0,
    currency text default 'USD',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique (site_id, snapshot_date)
);

create table public.lovable_spend (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    year integer not null,
    month integer not null,
    amount numeric(12,2) not null,
    currency text default 'USD',
    notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique (user_id, year, month)
);

create table public.fx_rates (
    id uuid primary key default gen_random_uuid(),
    base_currency text not null,
    target_currency text not null,
    rate numeric(12,6) not null,
    rate_date date not null,
    created_at timestamp with time zone default now(),
    unique (base_currency, target_currency, rate_date)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

grant select, insert, update, delete on public.sites to authenticated;
grant all on public.sites to service_role;

grant select, insert, update, delete on public.payment_connections to authenticated;
grant all on public.payment_connections to service_role;

grant select, insert, update, delete on public.revenue_snapshots to authenticated;
grant all on public.revenue_snapshots to service_role;

grant select, insert, update, delete on public.lovable_spend to authenticated;
grant all on public.lovable_spend to service_role;

grant select on public.fx_rates to authenticated;
grant all on public.fx_rates to service_role;

alter table public.user_roles enable row level security;
alter table public.sites enable row level security;
alter table public.payment_connections enable row level security;
alter table public.revenue_snapshots enable row level security;
alter table public.lovable_spend enable row level security;
alter table public.fx_rates enable row level security;

create policy "Users can manage their own roles"
on public.user_roles
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can manage their own sites"
on public.sites
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can manage their own payment connections"
on public.payment_connections
for all
to authenticated
using (site_id in (select id from public.sites where user_id = auth.uid()))
with check (site_id in (select id from public.sites where user_id = auth.uid()));

create policy "Users can manage their own revenue snapshots"
on public.revenue_snapshots
for all
to authenticated
using (site_id in (select id from public.sites where user_id = auth.uid()))
with check (site_id in (select id from public.sites where user_id = auth.uid()));

create policy "Users can manage their own lovable spend"
on public.lovable_spend
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can read fx rates"
on public.fx_rates
for select
to authenticated
using (true);
