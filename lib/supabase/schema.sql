-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  credits integer not null default 5,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email_verified boolean default false,
  role text check (role in ('user', 'admin', 'super_admin')) default 'user',
  status text check (status in ('active', 'banned')) default 'active',
  verified_at timestamp with time zone
);

-- Enable RLS s
alter table public.users enable row level security;

-- First drop existing policies to avoid conflicts
drop policy if exists "Users can view own data" on public.users;
drop policy if exists "Users can update own data" on public.users;
drop policy if exists "Users can update own credits" on public.users;
drop policy if exists "Enable read access for service role" on public.users;
drop policy if exists "Enable update access for service role" on public.users;
drop policy if exists "Admins can view all users" on public.users;

-- Then create new policies
create policy "Users and admins can view users"
on public.users
for select using (
  -- User can see their own data
  auth.uid() = id 
  OR 
  -- Admin check without recursion
  (select role from auth.users where auth.users.id = auth.uid()) in ('admin', 'super_admin')
);

create policy "Users can update own data"
on public.users
for update using (
  auth.uid() = id OR 
  auth.role() = 'service_role'
);

-- Credit transactions table
create table public.credit_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  amount integer not null,
  type text not null check (type in ('purchase', 'usage')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.credit_transactions enable row level security;

-- RLS policies
create policy "Users can view own transactions" on public.credit_transactions
  for select using (auth.uid() = user_id);

-- Check if RLS policies are correct for credit_transactions table
create policy "Users can insert own transactions"
on public.credit_transactions
for insert with check (
  auth.uid() = user_id
);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, credits, email_verified)
  values (new.id, new.email, 5, false);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update credits atomically
create or replace function public.update_user_credits(p_user_id uuid, p_credits integer)
returns json
language plpgsql
security definer
as $$
declare
  v_old_credits integer;
  v_new_credits integer;
begin
  -- Get current credits with lock
  select credits into v_old_credits
  from public.users
  where id = p_user_id
  for update;

  -- Calculate new balance
  v_new_credits := coalesce(v_old_credits, 0) + p_credits;

  -- Update user credits
  update public.users
  set 
    credits = v_new_credits,
    updated_at = now()
  where id = p_user_id;

  -- Record transaction
  insert into public.credit_transactions (
    user_id,
    amount,
    type
  ) values (
    p_user_id,
    p_credits,
    'purchase'
  );

  return json_build_object(
    'old_credits', v_old_credits,
    'new_credits', v_new_credits,
    'added_credits', p_credits
  );
end;
$$;

-- Admin permissions table
create table public.admin_permissions (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.users(id) not null,
  permissions jsonb not null default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Admin action logs table
create table public.admin_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references public.users(id) not null,
  action_type text not null,
  target_user_id uuid references public.users(id),
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for admin tables
alter table public.admin_permissions enable row level security;
alter table public.admin_logs enable row level security;

-- Admin can view all users
create policy "Admins can view all users"
on public.users
for select
using (
  auth.uid() = id OR  -- User can see their own data
  exists (
    select 1 from users
    where id = auth.uid() 
    and role in ('admin', 'super_admin')
  )
);

-- Admin permissions policies
create policy "Admins can view their permissions"
on public.admin_permissions
for select
using (
  auth.uid() = admin_id OR
  auth.jwt() ->> 'role' = 'super_admin'
);

-- Admin logs policies
create policy "Admins can view logs"
on public.admin_logs
for select
using (
  auth.jwt() ->> 'role' in ('admin', 'super_admin')
);

create policy "Admins can insert logs"
on public.admin_logs
for insert
with check (
  auth.jwt() ->> 'role' in ('admin', 'super_admin')
);

-- Function to update user status (ban/unban)
create or replace function public.update_user_status(
  p_user_id uuid,
  p_status text,
  p_admin_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  -- Update user status
  update public.users
  set 
    status = p_status,
    updated_at = now()
  where id = p_user_id;

  -- Log the action
  insert into public.admin_logs (
    admin_id,
    action_type,
    target_user_id,
    details
  ) values (
    p_admin_id,
    case when p_status = 'banned' then 'ban_user' else 'unban_user' end,
    p_user_id,
    jsonb_build_object('status', p_status)
  );
end;
$$;

-- Function to update user credits by admin
create or replace function public.admin_update_credits(
  p_user_id uuid,
  p_credits integer,
  p_admin_id uuid,
  p_notes text default null
)
returns void
language plpgsql
security definer
as $$
begin
  -- Update user credits
  update public.users
  set 
    credits = credits + p_credits,
    updated_at = now()
  where id = p_user_id;

  -- Log the transaction
  insert into public.credit_transactions (
    user_id,
    amount,
    type
  ) values (
    p_user_id,
    p_credits,
    'admin_adjustment'
  );

  -- Log the admin action
  insert into public.admin_logs (
    admin_id,
    action_type,
    target_user_id,
    details
  ) values (
    p_admin_id,
    'adjust_credits',
    p_user_id,
    jsonb_build_object(
      'amount', p_credits,
      'notes', p_notes
    )
  );
end;
$$;