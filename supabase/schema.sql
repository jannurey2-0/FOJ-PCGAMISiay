-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role text not null check (role in ('Admin', 'Pastor', 'Church Leader', 'Youth Leader', 'Church Member', 'Young People')),
  approved boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Helper function to check admin status (runs as SECURITY DEFINER to bypass RLS recursion)
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role = 'Admin' and approved = true
  );
end;
$$ language plpgsql security definer;

-- Policies
-- 1. Anyone can read approved profiles, or their own profile.
create policy "Allow users to read approved profiles or own profile"
  on public.profiles for select
  using (approved = true or auth.uid() = id);

-- 2. Users can insert their own profile during signup.
create policy "Allow users to insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 3. Users can update their own profile name
create policy "Allow users to update own profile name"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Admins have full access.
create policy "Allow admins full control"
  on public.profiles for all
  using (public.is_admin(auth.uid()));

-- Create a function to handle new user signup and insert metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Auto-approve if email matches admin@pcgami.org
  if new.email = 'admin@pcgami.org' then
    insert into public.profiles (id, name, role, approved)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'name', 'System Admin'),
      'Admin',
      true
    );
  else
    insert into public.profiles (id, name, role, approved)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      coalesce(new.raw_user_meta_data->>'role', 'Church Member'),
      false
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger after auth.users signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create hero_photos table
create table public.hero_photos (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  caption text,
  display_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for hero_photos
alter table public.hero_photos enable row level security;

-- Policies for hero_photos
-- 1. Anyone can view hero photos
create policy "Allow public read access to hero photos"
  on public.hero_photos for select
  using (true);

-- 2. Only Admins can modify hero photos
create policy "Allow admins full access to hero photos"
  on public.hero_photos for all
  using (public.is_admin(auth.uid()));
