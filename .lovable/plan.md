
# CMS Modular — WordPress-style

Membangun CMS dengan situs publik + admin panel, backed by Lovable Cloud (Postgres, Auth, Storage). UI light/clean/whitespace, default font Plus Jakarta Sans dengan opsi Inter, Roboto, Manrope, Oswald.

## Stack & Konvensi

- TanStack Start (routing file-based di `src/routes/`)
- Lovable Cloud: Auth (email/password), Postgres + RLS, Storage
- Server functions (`createServerFn`) untuk semua mutasi/baca terproteksi; admin client hanya untuk operasi terpercaya
- shadcn/ui + Tailwind; design tokens di `src/styles.css` (semantik, light theme premium)
- RBAC: `app_role` enum + tabel `user_roles` + fungsi `has_role()` (SECURITY DEFINER)

## Skema Database (migrasi)

- `profiles` (id → auth.users, display_name, avatar_url, created_at) — auto-create via trigger
- `app_role` enum: `admin | editor | author | viewer`
- `user_roles` (id, user_id, role, unique(user_id, role))
- `pages` (id, slug unique, title, content jsonb, status: draft/published, seo_title, seo_description, og_image, author_id, published_at, timestamps)
- `posts` (blog/news: id, slug, title, excerpt, content jsonb, cover_image, status, category_id, author_id, published_at, timestamps)
- `categories` (id, slug, name, description)
- `tags` (id, slug, name) + `post_tags` (post_id, tag_id)
- `menus` (id, location: header/footer, name)
- `menu_items` (id, menu_id, parent_id nullable, label, url, page_id nullable, sort_order)
- `media` (id, path, url, mime_type, size, width, height, alt, uploaded_by)
- `home_sections` (id, type: hero/features/cta/gallery/blog_list/testimonials/rich_text, props jsonb, sort_order, is_visible)
- `site_settings` (singleton: logo_url, favicon_url, site_name, font_family enum, footer_html, social_links jsonb, hero_default jsonb)

RLS:
- Public: SELECT `pages`/`posts` WHERE status='published'; SELECT `menus`, `menu_items`, `home_sections` visible, `site_settings`, `categories`, `tags`, `media` (read)
- Authenticated/role-gated writes via `has_role()`: admin (semua), editor (pages/posts/menus/home/media/settings), author (posts miliknya), viewer (read-only admin)
- Storage bucket `media` (public read; write authenticated)

## Struktur Route

```
src/routes/
  __root.tsx                       // shell, font loader dinamis dari site_settings
  index.tsx                        // Home: render home_sections berurutan
  about.tsx, contact.tsx           // contoh — sebenarnya semua "page" via [slug]
  $slug.tsx                        // dynamic page renderer (pages.slug)
  blog.index.tsx                   // listing posts
  blog.$slug.tsx                   // detail post
  login.tsx, register.tsx
  _authenticated.tsx               // gate context.auth
  _authenticated/admin.tsx                 // admin layout (sidebar)
  _authenticated/admin/index.tsx           // dashboard
  _authenticated/admin/pages.tsx           // list + create
  _authenticated/admin/pages.$id.tsx       // editor
  _authenticated/admin/posts.tsx
  _authenticated/admin/posts.$id.tsx
  _authenticated/admin/menus.tsx
  _authenticated/admin/media.tsx
  _authenticated/admin/users.tsx           // admin only
  _authenticated/admin/home-builder.tsx    // drag-reorder sections
  _authenticated/admin/appearance.tsx      // logo, font, header, footer, hero default
```

## Komponen Publik

- `<SiteHeader/>` — logo, nav dari `menus(location=header)`
- `<SiteFooter/>` — dari `menus(location=footer)` + `site_settings.footer_html`
- `<HeroSection/>` — props dari section/home setting (title, subtitle, image, CTAs)
- Renderer section: `HeroBlock`, `FeaturesBlock`, `CTABlock`, `GalleryBlock`, `TestimonialsBlock`, `BlogListBlock`, `RichTextBlock`
- Loader fonts: inject `<link>` Google Fonts berdasarkan `site_settings.font_family` (Plus Jakarta Sans default)

## Admin Panel

- Sidebar: Dashboard, Pages, Blog/News, Menus, Media, Users & Roles, Home Builder, Appearance
- Pages/Posts editor: form (title, slug auto, status, SEO meta, cover) + rich text editor (Tiptap) menulis ke `content jsonb`
- Menu Manager: list per location, tambah/edit item, drag-reorder (dnd-kit), link ke page atau URL kustom, nested 1 level
- Home Builder: list section drag-reorder (dnd-kit), toggle visible, edit props per type via dialog
- Media Manager: grid, upload ke Storage, copy URL, set alt, pakai sebagai cover/hero
- Users & Roles (admin only): list users, assign/remove roles
- Appearance: upload logo/favicon, pilih font (5 opsi), edit header nav helper, footer HTML, hero default

## Server Functions (contoh)

- `src/lib/cms/pages.functions.ts`: `listPages`, `getPage`, `upsertPage`, `deletePage`
- `src/lib/cms/posts.functions.ts`: serupa + filter kategori/tag
- `src/lib/cms/menus.functions.ts`, `home.functions.ts`, `media.functions.ts`, `settings.functions.ts`, `users.functions.ts`
- `src/lib/cms/public.functions.ts`: public reads via `supabaseAdmin` dengan WHERE status='published' (untuk loader SSR di route publik)
- Semua mutasi: `.middleware([requireSupabaseAuth])` + cek role via RPC `has_role`

## Design System (light premium)

- `--background: oklch(0.99 0 0)`, `--foreground: oklch(0.18 0.02 260)`
- `--primary: oklch(0.45 0.18 265)` (deep indigo), `--accent` lembut
- Radius medium (0.75rem), shadow halus, banyak whitespace, type scale generous
- Font default Plus Jakarta Sans; opsi dinamis di body via CSS variable `--font-sans`

## Iterasi Build

1. Enable Lovable Cloud, migrasi schema + RLS + storage bucket + trigger profile + seed site_settings/home_sections default
2. Auth (login/register), `_authenticated` guard, `has_role` helper di client (RPC)
3. Layout publik (header/footer/font loader) + Home renderer + page `$slug` + blog listing/detail
4. Admin shell + Pages CRUD + Posts CRUD (Tiptap)
5. Menu Manager, Home Builder (dnd-kit)
6. Media Manager (Storage), Appearance (logo/font/hero default)
7. Users & RBAC management UI
8. Polish: SEO meta dinamis, 404, loading states

## Catatan

- "Customized layouting" = section-based drag-reorder (sesuai pilihan); bukan block editor penuh
- Posting hanya bisa dipublish oleh role yang diizinkan; author bisa edit miliknya sendiri
- Beberapa modul (media, RBAC UI, builder) cukup besar — saya akan kirim semuanya dalam satu build inti yang fungsional, lalu kita iterasi polish setelahnya
