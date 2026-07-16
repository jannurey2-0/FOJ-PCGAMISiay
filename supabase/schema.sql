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

-- Create a function to handle new user signup and insert metadata securely
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Securely default all signups to Church Member and approved = false
  insert into public.profiles (id, name, role, approved)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'Church Member',
    false
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger after auth.users signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to prevent self-escalation of roles/approval status
create or replace function public.prevent_profile_escalation()
returns trigger as $$
begin
  -- If the updater is not an Admin, reject any modifications to 'role' or 'approved'
  if not public.is_admin(auth.uid()) then
    new.role := old.role;
    new.approved := old.approved;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to enforce the prevention of privilege escalation
create or replace trigger check_profile_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_profile_escalation();

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

-- Create system_settings table
create table public.system_settings (
  id text primary key default 'general',
  church_name text not null default 'FOJ-PCGAMI Siay',
  banner_title text not null default 'A place to belong, grow, and share God''s warm love.',
  banner_subtitle text not null default '"Let us hold fast the confession of our hope without wavering, for He who promised is faithful..." — Hebrews 10:23-24',
  pinned_event_id uuid,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.system_settings enable row level security;

-- Policies for system_settings
create policy "Allow public read access to system settings"
  on public.system_settings for select using (true);

create policy "Allow admins full access to system settings"
  on public.system_settings for all using (public.is_admin(auth.uid()));

-- Create announcements table
create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  author text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.announcements enable row level security;

-- Policies for announcements
create policy "Allow public read access to announcements"
  on public.announcements for select using (true);

create policy "Allow admins and leaders to manage announcements"
  on public.announcements for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('Admin', 'Pastor', 'Church Leader') and approved = true
    )
  );

-- Create activity_schedules table
create table public.activity_schedules (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  event_date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.activity_schedules enable row level security;

-- Policies for activity_schedules
create policy "Allow public read access to activity schedules"
  on public.activity_schedules for select using (true);

create policy "Allow admins and leaders to manage activity schedules"
  on public.activity_schedules for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('Admin', 'Pastor', 'Church Leader') and approved = true
    )
  );

-- Seed initial data
insert into public.system_settings (id) values ('general') on conflict do nothing;

insert into public.announcements (title, content, author) values
('Thanksgiving Choir Signup', 'Rehearsals start next Tuesday. Sing or play instruments to glorify God!', 'Pastor Thomas'),
('Midweek Bible Study Series', 'We are diving into the Book of Ephesians. Join online or in the main fellowship hall.', 'Pastor Thomas')
on conflict do nothing;

insert into public.activity_schedules (title, description, event_date) values
('Sunday Worship Service', 'Worship, Sermon by Pastor Thomas. Communion service.', '2026-07-12 09:00:00+00'),
('Youth Leaders Bonfire', 'Team gathering and bonfire planning checkup.', '2026-07-16 18:00:00+00'),
('Media & Audio Calibration', 'System testing and setup for winter concert preparations.', '2026-07-23 14:00:00+00')
on conflict do nothing;

alter table public.system_settings
  add constraint fk_system_settings_pinned_event
  foreign key (pinned_event_id)
  references public.activity_schedules(id)
  on delete set null;
