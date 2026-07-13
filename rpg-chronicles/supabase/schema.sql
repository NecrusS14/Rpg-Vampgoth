-- ============================================================================
-- RPG Chronicles — Schema Fase 0
-- Tabelas fundacionais: users, campaigns, characters
-- As demais tabelas (NPCs, Monsters, Items, Quests, WorldState, etc.)
-- serão adicionadas nas fases seguintes do roadmap.
-- ============================================================================

-- Extensão para UUIDs
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- USERS
-- Espelha auth.users do Supabase Auth com dados de perfil próprios da aplicação.
-- ----------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Viajante Sem Nome',
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cria automaticamente uma linha em public.users quando um novo usuário se registra
-- (Google OAuth ou Login Anônimo) via auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Viajante Sem Nome'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- CAMPAIGNS
-- ----------------------------------------------------------------------------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  description text,
  setting text not null default 'dark_fantasy',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_members (
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null default 'player' check (role in ('owner', 'player', 'spectator')),
  joined_at timestamptz not null default now(),
  primary key (campaign_id, user_id)
);

-- ----------------------------------------------------------------------------
-- CHARACTERS
-- ----------------------------------------------------------------------------
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users (id) on delete cascade,
  campaign_id uuid references public.campaigns (id) on delete set null,

  name text not null,
  race text,
  class text,
  subclass text,
  origin text,
  age integer,
  height_cm integer,
  weight_kg numeric,

  attributes jsonb not null default '{}'::jsonb,   -- força, destreza, etc.
  health integer not null default 100,
  max_health integer not null default 100,
  mana integer not null default 0,
  max_mana integer not null default 0,
  energy integer not null default 100,
  sanity integer not null default 100,
  corruption integer not null default 0,

  experience integer not null default 0,
  level integer not null default 1,

  gold integer not null default 0,
  reputation jsonb not null default '{}'::jsonb,    -- por facção

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_characters_owner on public.characters (owner_id);
create index if not exists idx_characters_campaign on public.characters (campaign_id);
create index if not exists idx_campaign_members_user on public.campaign_members (user_id);

-- ----------------------------------------------------------------------------
-- updated_at automático
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at before update on public.users
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_campaigns_updated_at on public.campaigns;
create trigger trg_campaigns_updated_at before update on public.campaigns
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_characters_updated_at on public.characters;
create trigger trg_characters_updated_at before update on public.characters
  for each row execute procedure public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.users enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.characters enable row level security;

-- USERS: qualquer usuário autenticado pode ler perfis públicos;
-- só o próprio usuário pode atualizar seu perfil.
create policy "users_select_all" on public.users
  for select using (true);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- CAMPAIGNS: dono e membros podem ver; só o dono pode editar/excluir.
create policy "campaigns_select_member" on public.campaigns
  for select using (
    auth.uid() = owner_id
    or exists (
      select 1 from public.campaign_members cm
      where cm.campaign_id = campaigns.id and cm.user_id = auth.uid()
    )
  );

create policy "campaigns_insert_own" on public.campaigns
  for insert with check (auth.uid() = owner_id);

create policy "campaigns_update_owner" on public.campaigns
  for update using (auth.uid() = owner_id);

create policy "campaigns_delete_owner" on public.campaigns
  for delete using (auth.uid() = owner_id);

-- CAMPAIGN_MEMBERS: membros podem ver a lista da própria campanha.
create policy "members_select_member" on public.campaign_members
  for select using (
    exists (
      select 1 from public.campaign_members cm2
      where cm2.campaign_id = campaign_members.campaign_id and cm2.user_id = auth.uid()
    )
  );

create policy "members_insert_self" on public.campaign_members
  for insert with check (auth.uid() = user_id);

-- CHARACTERS: cada jogador só vê/edita os próprios personagens
-- (visão de outros personagens dentro da sala será liberada via view específica na Fase 1).
create policy "characters_select_own" on public.characters
  for select using (auth.uid() = owner_id);

create policy "characters_insert_own" on public.characters
  for insert with check (auth.uid() = owner_id);

create policy "characters_update_own" on public.characters
  for update using (auth.uid() = owner_id);

create policy "characters_delete_own" on public.characters
  for delete using (auth.uid() = owner_id);
