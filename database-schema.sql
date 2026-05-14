-- Arcana Studio Tarot Website - Supabase SQL
-- Run this in the Supabase SQL editor. It creates scalable public content,
-- booking, review, and reading-history tables with starter RLS policies.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.reader_profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  headline text,
  bio text,
  avatar_url text,
  email text,
  phone text,
  timezone text default 'America/New_York',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  reader_id uuid references public.reader_profiles(id) on delete set null,
  slug text not null unique,
  name text not null,
  description text not null,
  price numeric(10, 2) not null default 0,
  currency text not null default 'USD',
  duration_minutes integer not null check (duration_minutes > 0),
  accent text default 'from-violet-500 to-fuchsia-500',
  active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  reader_id uuid references public.reader_profiles(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  title text not null,
  summary text not null,
  image_url text,
  result_metric text,
  featured boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete set null,
  service_slug text,
  service_name text not null,
  client_name text not null,
  client_email text not null,
  client_phone text,
  requested_date date not null,
  requested_time time not null,
  timezone text default 'America/New_York',
  message text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'declined')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'deposit_paid', 'paid', 'refunded')),
  payment_reference text,
  private_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  service_name text,
  author text not null,
  email text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  verified boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tarot_cards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  arcana text not null check (arcana in ('major', 'minor')),
  suit text,
  card_number integer,
  theme text,
  upright_meaning text,
  reversed_meaning text,
  created_at timestamptz not null default now()
);

create table if not exists public.reading_sessions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  client_email text not null,
  spread_type text not null,
  question text,
  cards_drawn jsonb not null default '[]'::jsonb,
  interpretation text,
  follow_up_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.site_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  page_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.owner_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.app_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid references auth.users(id) on delete cascade,
  recipient_role text check (recipient_role in ('owner')),
  actor_email text,
  type text not null,
  title text not null,
  message text not null,
  action_url text,
  related_table text,
  related_id uuid,
  read_at timestamptz,
  handled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (recipient_user_id is not null or recipient_role is not null)
);

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  sender_user_id uuid references auth.users(id) on delete set null,
  sender_role text not null check (sender_role in ('user', 'owner')),
  sender_email text,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

alter table public.app_notifications add column if not exists updated_at timestamptz not null default now();

create index if not exists services_active_sort_idx on public.services(active, sort_order);
create index if not exists portfolio_featured_sort_idx on public.portfolio_items(featured, sort_order);
create index if not exists bookings_email_idx on public.bookings(client_email);
create index if not exists bookings_date_status_idx on public.bookings(requested_date, status);
create index if not exists reviews_public_idx on public.reviews(verified, featured, created_at desc);
create index if not exists readings_email_idx on public.reading_sessions(client_email);
create index if not exists events_name_created_idx on public.site_events(event_name, created_at desc);
create index if not exists app_profiles_role_idx on public.app_profiles(role);
create index if not exists app_notifications_user_created_idx on public.app_notifications(recipient_user_id, created_at desc);
create index if not exists app_notifications_role_created_idx on public.app_notifications(recipient_role, created_at desc);
create index if not exists chat_threads_user_last_idx on public.chat_threads(user_id, last_message_at desc);
create index if not exists chat_threads_status_last_idx on public.chat_threads(status, last_message_at desc);
create index if not exists chat_messages_thread_created_idx on public.chat_messages(thread_id, created_at);

drop trigger if exists set_reader_profiles_updated_at on public.reader_profiles;
create trigger set_reader_profiles_updated_at before update on public.reader_profiles for each row execute function public.set_updated_at();

drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at before update on public.services for each row execute function public.set_updated_at();

drop trigger if exists set_portfolio_items_updated_at on public.portfolio_items;
create trigger set_portfolio_items_updated_at before update on public.portfolio_items for each row execute function public.set_updated_at();

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at before update on public.bookings for each row execute function public.set_updated_at();

drop trigger if exists set_reviews_updated_at on public.reviews;
create trigger set_reviews_updated_at before update on public.reviews for each row execute function public.set_updated_at();

drop trigger if exists set_reading_sessions_updated_at on public.reading_sessions;
create trigger set_reading_sessions_updated_at before update on public.reading_sessions for each row execute function public.set_updated_at();

drop trigger if exists set_app_profiles_updated_at on public.app_profiles;
create trigger set_app_profiles_updated_at before update on public.app_profiles for each row execute function public.set_updated_at();

drop trigger if exists set_app_notifications_updated_at on public.app_notifications;
create trigger set_app_notifications_updated_at before update on public.app_notifications for each row execute function public.set_updated_at();

drop trigger if exists set_chat_threads_updated_at on public.chat_threads;
create trigger set_chat_threads_updated_at before update on public.chat_threads for each row execute function public.set_updated_at();

create or replace function public.touch_chat_thread()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chat_threads
  set last_message_at = new.created_at,
      updated_at = now(),
      status = 'open'
  where id = new.thread_id;

  return new;
end;
$$;

drop trigger if exists touch_chat_thread_after_message on public.chat_messages;
create trigger touch_chat_thread_after_message after insert on public.chat_messages for each row execute function public.touch_chat_thread();

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.owner_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  or exists (
    select 1
    from public.app_profiles
    where id = auth.uid()
      and role = 'owner'
  );
$$;

create or replace function public.sync_auth_profile(requested_role text default 'user')
returns table (
  id uuid,
  email text,
  full_name text,
  avatar_url text,
  role text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text := coalesce(auth.jwt() ->> 'email', '');
  allowed_role text := 'user';
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if exists (
    select 1
    from public.owner_emails
    where lower(owner_emails.email) = lower(current_email)
  ) then
    allowed_role := 'owner';
  end if;

  insert into public.app_profiles (id, email, full_name, avatar_url, role)
  values (
    current_user_id,
    current_email,
    auth.jwt() -> 'user_metadata' ->> 'full_name',
    auth.jwt() -> 'user_metadata' ->> 'avatar_url',
    allowed_role
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    role = excluded.role,
    updated_at = now();

  return query
  select app_profiles.id, app_profiles.email, app_profiles.full_name, app_profiles.avatar_url, app_profiles.role
  from public.app_profiles
  where app_profiles.id = current_user_id;
end;
$$;

create or replace function public.create_booking_request(
  p_client_name text,
  p_client_email text,
  p_client_phone text,
  p_requested_date date,
  p_requested_time time,
  p_service_slug text,
  p_service_name text,
  p_message text default null,
  p_timezone text default 'America/New_York'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_booking_id uuid;
begin
  if nullif(trim(p_client_name), '') is null then
    raise exception 'Client name is required';
  end if;

  if nullif(trim(p_client_email), '') is null then
    raise exception 'Client email is required';
  end if;

  if p_requested_date is null or p_requested_time is null then
    raise exception 'Requested date and time are required';
  end if;

  if nullif(trim(p_service_name), '') is null then
    raise exception 'Service name is required';
  end if;

  insert into public.bookings (
    client_name,
    client_email,
    client_phone,
    requested_date,
    requested_time,
    timezone,
    service_slug,
    service_name,
    message,
    status,
    payment_status
  )
  values (
    trim(p_client_name),
    lower(trim(p_client_email)),
    nullif(trim(coalesce(p_client_phone, '')), ''),
    p_requested_date,
    p_requested_time,
    coalesce(nullif(trim(p_timezone), ''), 'America/New_York'),
    nullif(trim(coalesce(p_service_slug, '')), ''),
    trim(p_service_name),
    nullif(trim(coalesce(p_message, '')), ''),
    'pending',
    'unpaid'
  )
  returning id into new_booking_id;

  return new_booking_id;
end;
$$;

alter table public.reader_profiles enable row level security;
alter table public.services enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.tarot_cards enable row level security;
alter table public.reading_sessions enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_events enable row level security;
alter table public.owner_emails enable row level security;
alter table public.app_profiles enable row level security;
alter table public.app_notifications enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "reader profiles are public" on public.reader_profiles;
create policy "reader profiles are public" on public.reader_profiles for select using (is_active = true);

drop policy if exists "active services are public" on public.services;
create policy "active services are public" on public.services for select using (active = true);

drop policy if exists "portfolio is public" on public.portfolio_items;
create policy "portfolio is public" on public.portfolio_items for select using (true);

drop policy if exists "verified reviews are public" on public.reviews;
drop policy if exists "reviews are public" on public.reviews;
create policy "reviews are public" on public.reviews for select using (true);

drop policy if exists "anyone can submit reviews" on public.reviews;
create policy "anyone can submit reviews" on public.reviews for insert with check (verified = true);

drop policy if exists "owners can update reviews" on public.reviews;
create policy "owners can update reviews" on public.reviews
for update using (public.is_owner())
with check (public.is_owner());

drop policy if exists "anyone can request bookings" on public.bookings;
create policy "anyone can request bookings" on public.bookings
for insert
to anon, authenticated
with check (
  status = 'pending'
  and payment_status = 'unpaid'
  and client_name is not null
  and client_email is not null
  and requested_date is not null
  and requested_time is not null
  and service_name is not null
);

drop policy if exists "owners can read bookings" on public.bookings;
create policy "owners can read bookings" on public.bookings for select using (public.is_owner());

drop policy if exists "owners can update bookings" on public.bookings;
create policy "owners can update bookings" on public.bookings
for update using (public.is_owner())
with check (public.is_owner());

drop policy if exists "tarot cards are public" on public.tarot_cards;
create policy "tarot cards are public" on public.tarot_cards for select using (true);

drop policy if exists "anyone can send contact messages" on public.contact_messages;
create policy "anyone can send contact messages" on public.contact_messages for insert with check (status = 'new');

drop policy if exists "owners can read contact messages" on public.contact_messages;
create policy "owners can read contact messages" on public.contact_messages for select using (public.is_owner());

drop policy if exists "owners can update contact messages" on public.contact_messages;
create policy "owners can update contact messages" on public.contact_messages
for update using (public.is_owner())
with check (public.is_owner());

drop policy if exists "owners can read reading sessions" on public.reading_sessions;
create policy "owners can read reading sessions" on public.reading_sessions for select using (public.is_owner());

drop policy if exists "anyone can track public events" on public.site_events;
create policy "anyone can track public events" on public.site_events for insert with check (true);

drop policy if exists "users can read own profile" on public.app_profiles;
create policy "users can read own profile" on public.app_profiles for select using (id = auth.uid());

drop policy if exists "owners can read profiles" on public.app_profiles;
create policy "owners can read profiles" on public.app_profiles for select using (public.is_owner());

drop policy if exists "owners can read owner email allowlist" on public.owner_emails;
create policy "owners can read owner email allowlist" on public.owner_emails for select using (public.is_owner());

drop policy if exists "users can read their notifications" on public.app_notifications;
create policy "users can read their notifications" on public.app_notifications for select using (
  recipient_user_id = auth.uid()
  or (recipient_role = 'owner' and public.is_owner())
);

drop policy if exists "users can create notifications" on public.app_notifications;
create policy "users can create notifications" on public.app_notifications for insert with check (
  recipient_user_id = auth.uid()
  or recipient_role = 'owner'
  or public.is_owner()
);

drop policy if exists "users can update their notifications" on public.app_notifications;
create policy "users can update their notifications" on public.app_notifications for update using (
  recipient_user_id = auth.uid()
  or (recipient_role = 'owner' and public.is_owner())
) with check (
  recipient_user_id = auth.uid()
  or (recipient_role = 'owner' and public.is_owner())
);

drop policy if exists "users can read own chat threads" on public.chat_threads;
create policy "users can read own chat threads" on public.chat_threads
for select using (user_id = auth.uid() or public.is_owner());

drop policy if exists "users can create own chat threads" on public.chat_threads;
create policy "users can create own chat threads" on public.chat_threads
for insert with check (user_id = auth.uid());

drop policy if exists "owners can update chat threads" on public.chat_threads;
create policy "owners can update chat threads" on public.chat_threads
for update using (public.is_owner())
with check (public.is_owner());

drop policy if exists "participants can read chat messages" on public.chat_messages;
create policy "participants can read chat messages" on public.chat_messages
for select using (
  public.is_owner()
  or exists (
    select 1
    from public.chat_threads
    where chat_threads.id = chat_messages.thread_id
      and chat_threads.user_id = auth.uid()
  )
);

drop policy if exists "participants can send chat messages" on public.chat_messages;
create policy "participants can send chat messages" on public.chat_messages
for insert with check (
  (
    sender_role = 'owner'
    and sender_user_id = auth.uid()
    and public.is_owner()
  )
  or (
    sender_role = 'user'
    and sender_user_id = auth.uid()
    and exists (
      select 1
      from public.chat_threads
      where chat_threads.id = chat_messages.thread_id
        and chat_threads.user_id = auth.uid()
    )
  )
);

create or replace view public.public_reviews as
select id, author, rating, comment, service_name, featured, created_at
from public.reviews
order by featured desc, created_at desc;

alter table public.reviews replica identity full;
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reviews'
  ) then
    alter publication supabase_realtime add table public.reviews;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'contact_messages'
  ) then
    alter publication supabase_realtime add table public.contact_messages;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reading_sessions'
  ) then
    alter publication supabase_realtime add table public.reading_sessions;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'app_notifications'
  ) then
    alter publication supabase_realtime add table public.app_notifications;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_threads'
  ) then
    alter publication supabase_realtime add table public.chat_threads;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end;
$$;

insert into public.owner_emails (email)
values ('admin123@gmail.com')
on conflict do nothing;

create or replace view public.public_services as
select id, slug, name, description, price, currency, duration_minutes, accent, sort_order
from public.services
where active = true
order by sort_order, name;

insert into public.reader_profiles (display_name, headline, bio, email)
values (
  'Arcana Studio',
  'Modern tarot readings for practical clarity',
  'Private tarot sessions for decision-making, reflection, and grounded spiritual guidance.',
  'hello@arcanastudio.com'
)
on conflict do nothing;

insert into public.services (slug, name, description, price, duration_minutes, accent, sort_order)
values
  ('clarity', 'Clarity Reading', 'A focused session for career, love, money, or a decision that needs clean perspective.', 45, 30, 'from-violet-500 to-fuchsia-500', 10),
  ('deep-cross', 'Celtic Cross Session', 'A layered ten-card spread for patterns, hidden influences, next steps, and practical timing.', 85, 60, 'from-cyan-500 to-blue-600', 20),
  ('year-map', 'Soul Map Forecast', 'A seasonal forecast with a written recap, action notes, and rituals for the next chapter.', 140, 90, 'from-amber-400 to-rose-500', 30)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  duration_minutes = excluded.duration_minutes,
  accent = excluded.accent,
  sort_order = excluded.sort_order;

delete from public.reviews
where email in ('maya@example.com', 'jon@example.com', 'ari@example.com')
  and author in ('Maya R.', 'Jon Bell', 'Ari S.');

insert into public.tarot_cards (slug, name, arcana, suit, card_number, theme, upright_meaning, reversed_meaning)
values
  ('the-fool', 'The Fool', 'major', null, 0, 'New beginnings', 'Fresh starts, openness, trust', 'Recklessness, hesitation, poor timing'),
  ('the-magician', 'The Magician', 'major', null, 1, 'Manifestation', 'Skill, willpower, resourcefulness', 'Scattered energy, manipulation, blocked action'),
  ('the-high-priestess', 'The High Priestess', 'major', null, 2, 'Intuition', 'Inner knowing, mystery, quiet truth', 'Secrets, disconnection, ignoring intuition'),
  ('the-empress', 'The Empress', 'major', null, 3, 'Growth', 'Creativity, nurture, abundance', 'Creative block, dependency, overgiving'),
  ('the-chariot', 'The Chariot', 'major', null, 7, 'Direction', 'Discipline, movement, victory', 'Lack of control, conflict, scattered ambition'),
  ('the-star', 'The Star', 'major', null, 17, 'Renewal', 'Hope, healing, spiritual clarity', 'Discouragement, depletion, loss of faith')
on conflict (slug) do update set
  name = excluded.name,
  theme = excluded.theme,
  upright_meaning = excluded.upright_meaning,
  reversed_meaning = excluded.reversed_meaning;

grant usage on schema public to anon, authenticated;
revoke select on public.reviews from anon, authenticated;
grant select on public.reader_profiles, public.services, public.portfolio_items, public.tarot_cards, public.public_reviews, public.public_services to anon, authenticated;
grant select (id, service_name, author, rating, comment, verified, featured, created_at, updated_at) on public.reviews to anon, authenticated;
grant select on public.bookings, public.contact_messages, public.reading_sessions, public.app_profiles, public.app_notifications to authenticated;
grant select, insert on public.chat_threads, public.chat_messages to authenticated;
grant insert on public.bookings, public.reviews, public.contact_messages, public.site_events, public.app_notifications to anon, authenticated;
grant update on public.bookings, public.reviews, public.contact_messages, public.app_notifications, public.chat_threads to authenticated;
grant execute on function public.sync_auth_profile(text) to authenticated;
grant execute on function public.create_booking_request(text, text, text, date, time, text, text, text, text) to anon, authenticated;
grant execute on function public.is_owner() to authenticated;
