-- PULSE — PostgreSQL Schema & RLS Policies (SRS Section 9)
-- To execute in Supabase SQL Editor

-- 1. Profiles Table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) >= 1 and char_length(display_name) <= 60),
  currency text not null default 'INR',
  theme text not null default 'dark' check (theme in ('dark', 'light', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Categories Table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade, -- NULL for system categories
  name text not null check (char_length(name) >= 1 and char_length(name) <= 30),
  type text not null check (type in ('income', 'expense')),
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists categories_unique_idx
  on public.categories (coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid), type, lower(name));

-- 3. Transactions Table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount > 0 and amount <= 99999999.99),
  category_id uuid not null references public.categories(id) on delete restrict,
  description text check (description is null or char_length(description) <= 140),
  payment_method text not null check (payment_method in ('Cash', 'UPI', 'Card', 'Bank Transfer', 'Other')),
  transaction_date date not null check (transaction_date >= '2000-01-01'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_transactions_user_date on public.transactions (user_id, transaction_date desc);
create index if not exists idx_transactions_user_category on public.transactions (user_id, category_id);
create index if not exists idx_transactions_user_type_date on public.transactions (user_id, type, transaction_date);

-- 4. Budgets Table
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete restrict, -- NULL means overall monthly budget
  monthly_limit numeric(12, 2) not null check (monthly_limit > 0),
  month smallint not null check (month between 1 and 12),
  year smallint not null check (year between 2000 and 2100),
  created_at timestamptz not null default now()
);

create unique index if not exists budgets_unique_idx
  on public.budgets (user_id, coalesce(category_id, '00000000-0000-0000-0000-000000000000'::uuid), month, year);
create index if not exists idx_budgets_user_year_month on public.budgets (user_id, year, month);

-- 5. Row Level Security (RLS) Policies (Section 9.4)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

-- Profiles policies
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- Transactions policies
create policy "own rows" on public.transactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Budgets policies
create policy "own rows" on public.budgets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Categories policies
create policy "read system and own" on public.categories
  for select using (user_id is null or user_id = auth.uid());

create policy "write own" on public.categories
  for all using (user_id = auth.uid() and not is_system)
  with check (user_id = auth.uid() and not is_system);

-- 6. Insert Default System Categories (FR-CAT-001)
insert into public.categories (name, type, is_system) values
  ('Food', 'expense', true),
  ('Transport', 'expense', true),
  ('Rent', 'expense', true),
  ('Utilities', 'expense', true),
  ('Shopping', 'expense', true),
  ('Health', 'expense', true),
  ('Education', 'expense', true),
  ('Entertainment', 'expense', true),
  ('Other', 'expense', true),
  ('Salary', 'income', true),
  ('Allowance', 'income', true),
  ('Freelance', 'income', true),
  ('Gift', 'income', true),
  ('Other', 'income', true)
on conflict do nothing;
