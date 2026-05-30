
-- ========== ENUMS ==========
create type public.app_role as enum ('admin', 'editor', 'author', 'viewer');
create type public.content_status as enum ('draft', 'published');
create type public.menu_location as enum ('header', 'footer');
create type public.section_type as enum ('hero','features','cta','gallery','testimonials','blog_list','rich_text');
create type public.font_family as enum ('Plus Jakarta Sans','Inter','Roboto','Manrope','Oswald');

-- ========== PROFILES ==========
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone"
  on public.profiles for select to authenticated, anon using (true);
create policy "Users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

-- ========== USER ROLES ==========
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','editor','author','viewer'))
$$;

create policy "Users see their own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ========== AUTO PROFILE + FIRST USER ADMIN ==========
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  insert into public.profiles (id, display_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;

  select count(*) into v_count from public.user_roles;
  if v_count = 0 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'viewer') on conflict do nothing;
  end if;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== TIMESTAMPS HELPER ==========
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- ========== PAGES ==========
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  og_image text,
  author_id uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger pages_updated_at before update on public.pages for each row execute function public.set_updated_at();
grant select, insert, update, delete on public.pages to authenticated;
grant select on public.pages to anon;
grant all on public.pages to service_role;
alter table public.pages enable row level security;
create policy "Published pages public" on public.pages for select to anon, authenticated using (status = 'published' or public.is_staff(auth.uid()));
create policy "Editors manage pages" on public.pages for insert to authenticated with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
create policy "Editors update pages" on public.pages for update to authenticated using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));
create policy "Admins delete pages" on public.pages for delete to authenticated using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

-- ========== CATEGORIES & TAGS ==========
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Categories public read" on public.categories for select to anon, authenticated using (true);
create policy "Editors manage categories" on public.categories for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);
grant select on public.tags to anon, authenticated;
grant insert, update, delete on public.tags to authenticated;
grant all on public.tags to service_role;
alter table public.tags enable row level security;
create policy "Tags public read" on public.tags for select to anon, authenticated using (true);
create policy "Editors manage tags" on public.tags for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

-- ========== POSTS ==========
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content jsonb not null default '{}'::jsonb,
  cover_image text,
  status public.content_status not null default 'draft',
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger posts_updated_at before update on public.posts for each row execute function public.set_updated_at();
grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "Published posts public" on public.posts for select to anon, authenticated
  using (status='published' or public.is_staff(auth.uid()));
create policy "Authors create posts" on public.posts for insert to authenticated
  with check (
    (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor') or public.has_role(auth.uid(),'author'))
    and (author_id = auth.uid() or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  );
create policy "Authors update own posts" on public.posts for update to authenticated
  using (
    public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor')
    or (public.has_role(auth.uid(),'author') and author_id = auth.uid())
  );
create policy "Editors delete posts" on public.posts for delete to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

create table public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);
grant select on public.post_tags to anon, authenticated;
grant insert, delete on public.post_tags to authenticated;
grant all on public.post_tags to service_role;
alter table public.post_tags enable row level security;
create policy "Post tags public read" on public.post_tags for select to anon, authenticated using (true);
create policy "Editors manage post tags" on public.post_tags for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor') or public.has_role(auth.uid(),'author'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor') or public.has_role(auth.uid(),'author'));

-- ========== MENUS ==========
create table public.menus (
  id uuid primary key default gen_random_uuid(),
  location public.menu_location not null unique,
  name text not null,
  created_at timestamptz not null default now()
);
grant select on public.menus to anon, authenticated;
grant insert, update, delete on public.menus to authenticated;
grant all on public.menus to service_role;
alter table public.menus enable row level security;
create policy "Menus public read" on public.menus for select to anon, authenticated using (true);
create policy "Editors manage menus" on public.menus for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus(id) on delete cascade,
  parent_id uuid references public.menu_items(id) on delete cascade,
  label text not null,
  url text,
  page_id uuid references public.pages(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.menu_items to anon, authenticated;
grant insert, update, delete on public.menu_items to authenticated;
grant all on public.menu_items to service_role;
alter table public.menu_items enable row level security;
create policy "Menu items public read" on public.menu_items for select to anon, authenticated using (true);
create policy "Editors manage menu items" on public.menu_items for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

-- ========== MEDIA ==========
create table public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  url text not null,
  mime_type text,
  size bigint,
  width int,
  height int,
  alt text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.media to anon, authenticated;
grant insert, update, delete on public.media to authenticated;
grant all on public.media to service_role;
alter table public.media enable row level security;
create policy "Media public read" on public.media for select to anon, authenticated using (true);
create policy "Staff manage media" on public.media for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- ========== HOME SECTIONS ==========
create table public.home_sections (
  id uuid primary key default gen_random_uuid(),
  type public.section_type not null,
  props jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger home_sections_updated_at before update on public.home_sections for each row execute function public.set_updated_at();
grant select on public.home_sections to anon, authenticated;
grant insert, update, delete on public.home_sections to authenticated;
grant all on public.home_sections to service_role;
alter table public.home_sections enable row level security;
create policy "Home sections public read" on public.home_sections for select to anon, authenticated using (true);
create policy "Editors manage home sections" on public.home_sections for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

-- ========== SITE SETTINGS (singleton) ==========
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'My CMS',
  tagline text,
  logo_url text,
  favicon_url text,
  font_family public.font_family not null default 'Plus Jakarta Sans',
  footer_html text,
  social_links jsonb not null default '{}'::jsonb,
  hero_default jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "Settings public read" on public.site_settings for select to anon, authenticated using (true);
create policy "Editors manage settings" on public.site_settings for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

-- ========== SEED DEFAULTS ==========
insert into public.site_settings (id, site_name, tagline, font_family, footer_html, social_links, hero_default)
values (1, 'Lumen CMS', 'Modern Premium Content Platform', 'Plus Jakarta Sans',
  '<p class="text-sm text-muted-foreground">© 2026 Lumen CMS. Built with care.</p>',
  '{"twitter":"","instagram":"","linkedin":""}'::jsonb,
  '{"title":"Build beautiful sites,\nfaster than ever.","subtitle":"A modern CMS to manage pages, blog, menus, media — without touching code.","cta_primary":{"label":"Get started","href":"/admin"},"cta_secondary":{"label":"Read the blog","href":"/blog"},"image":""}'::jsonb)
on conflict (id) do nothing;

insert into public.menus (location, name) values ('header','Header Menu'),('footer','Footer Menu') on conflict do nothing;

insert into public.pages (slug, title, content, status, seo_title, seo_description, published_at)
values
  ('about','About Us','{"blocks":[{"type":"paragraph","text":"Welcome to Lumen CMS. We help teams publish beautifully crafted content with ease."}]}'::jsonb,'published','About Us','Learn more about Lumen CMS', now()),
  ('contact','Contact','{"blocks":[{"type":"paragraph","text":"Reach out via email at hello@example.com."}]}'::jsonb,'published','Contact','Get in touch', now())
on conflict (slug) do nothing;

with h as (select id from public.menus where location='header')
insert into public.menu_items (menu_id, label, url, sort_order)
select h.id, x.label, x.url, x.ord from h, (values
  ('Home','/',0),('Blog','/blog',1),('About','/about',2),('Contact','/contact',3)
) as x(label,url,ord);

with f as (select id from public.menus where location='footer')
insert into public.menu_items (menu_id, label, url, sort_order)
select f.id, x.label, x.url, x.ord from f, (values
  ('About','/about',0),('Blog','/blog',1),('Contact','/contact',2)
) as x(label,url,ord);

insert into public.home_sections (type, props, sort_order, is_visible) values
('hero','{}'::jsonb, 0, true),
('features','{"title":"Everything you need","subtitle":"A modern publishing toolkit","items":[{"title":"Page Builder","description":"Compose pages with rich content blocks.","icon":"layout"},{"title":"Menu Manager","description":"Organize navigation effortlessly.","icon":"menu"},{"title":"Media Library","description":"Upload and reuse assets anywhere.","icon":"image"}]}'::jsonb, 1, true),
('blog_list','{"title":"From the blog","subtitle":"Latest news & articles","limit":3}'::jsonb, 2, true),
('cta','{"title":"Ready to publish?","subtitle":"Sign in to your admin panel and start creating.","cta":{"label":"Open admin","href":"/admin"}}'::jsonb, 3, true);

insert into public.categories (slug, name, description) values
('news','News','Latest updates'),
('product','Product','Product announcements')
on conflict do nothing;

-- ========== STORAGE BUCKET ==========
insert into storage.buckets (id, name, public) values ('media','media', true) on conflict (id) do nothing;

create policy "Media bucket public read" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "Staff upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_staff(auth.uid()));
create policy "Staff update media" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_staff(auth.uid()));
create policy "Staff delete media" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_staff(auth.uid()));
