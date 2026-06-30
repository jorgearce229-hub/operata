-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES: user settings + plan management
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  trading_focus text default 'forex', -- forex, stocks, crypto, futures, universal
  preferred_currency text default 'USD',
  language text default 'es',
  plan text default 'free', -- free, pro
  trade_count integer default 0,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- TRADES: trade journal
create table if not exists trades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  instrument text not null,
  direction text not null check (direction in ('LONG','SHORT')),
  entry_price numeric(20,8),
  stop_loss numeric(20,8),
  take_profit numeric(20,8),
  close_price numeric(20,8),
  units integer,
  risk_pct numeric(5,2),
  result text check (result in ('TP','SL','BE','MANUAL','OPEN')),
  pnl numeric(12,2) default 0,
  r_multiple numeric(6,2),
  entry_date date,
  close_date date,
  session text, -- london, newyork, tokyo, sydney
  notes text,
  screenshot_url text,
  tags text[],
  created_at timestamp with time zone default timezone('utc', now())
);

-- BACKTEST: backtest records
create table if not exists backtests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  instrument text not null,
  direction text check (direction in ('LONG','SHORT')),
  result text check (result in ('TP','SL','BE')),
  entry_price numeric(20,8),
  stop_loss numeric(20,8),
  take_profit numeric(20,8),
  trade_date date,
  setup_notes text,
  target_sample integer default 30,
  created_at timestamp with time zone default timezone('utc', now())
);

-- SESSIONS CONFIG: user's custom session settings
create table if not exists session_config (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  sessions jsonb default '[
    {"name":"Sydney","start":22,"end":7,"enabled":true,"color":"#8b5cf6"},
    {"name":"Tokyo","start":0,"end":9,"enabled":true,"color":"#f59e0b"},
    {"name":"London","start":8,"end":17,"enabled":true,"color":"#10b981"},
    {"name":"New York","start":13,"end":22,"enabled":true,"color":"#ef4444"}
  ]',
  updated_at timestamp with time zone default timezone('utc', now())
);

-- RLS (Row Level Security)
alter table profiles enable row level security;
alter table trades enable row level security;
alter table backtests enable row level security;
alter table session_config enable row level security;

-- Policies: users can only see/edit their own data
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can view own trades" on trades for select using (auth.uid() = user_id);
create policy "Users can insert own trades" on trades for insert with check (auth.uid() = user_id);
create policy "Users can update own trades" on trades for update using (auth.uid() = user_id);
create policy "Users can delete own trades" on trades for delete using (auth.uid() = user_id);

create policy "Users can view own backtests" on backtests for select using (auth.uid() = user_id);
create policy "Users can insert own backtests" on backtests for insert with check (auth.uid() = user_id);
create policy "Users can update own backtests" on backtests for update using (auth.uid() = user_id);
create policy "Users can delete own backtests" on backtests for delete using (auth.uid() = user_id);

create policy "Users can view own session config" on session_config for select using (auth.uid() = user_id);
create policy "Users can insert own session config" on session_config for insert with check (auth.uid() = user_id);
create policy "Users can update own session config" on session_config for update using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Auto-update trade_count on profile
create or replace function update_trade_count()
returns trigger as $$
begin
  update profiles set trade_count = (
    select count(*) from trades where user_id = new.user_id
  ) where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_trade_change
  after insert or delete on trades
  for each row execute procedure update_trade_count();
