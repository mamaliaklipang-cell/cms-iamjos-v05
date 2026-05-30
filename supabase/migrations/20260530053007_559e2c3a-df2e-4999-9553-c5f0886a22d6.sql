-- Site settings (id is fixed at 1)
INSERT INTO public.site_settings (id, site_name, tagline, footer_html, social_links, hero_default)
VALUES (
  1,
  'IAMJOS-CMS',
  'Rumah Jurnal Premium & Pendampingan Indeksasi',
  '<p>© IAMJOS-CMS</p>',
  '{"twitter":"https://twitter.com","linkedin":"https://linkedin.com","github":"https://github.com"}'::jsonb,
  '{"eyebrow":"Modern Journal Platform","title":"Bangun Rumah Jurnal\nKelas Dunia","subtitle":"Tema OJS premium, pendampingan SINTA & Scopus, hingga infrastruktur VPS dan domain — semua dalam satu tempat.","cta_primary":{"label":"Lihat Themes","href":"/themes"},"cta_secondary":{"label":"Layanan Kami","href":"/services"}}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  site_name = EXCLUDED.site_name,
  tagline = EXCLUDED.tagline,
  footer_html = EXCLUDED.footer_html,
  social_links = EXCLUDED.social_links,
  hero_default = EXCLUDED.hero_default;

-- Menus
INSERT INTO public.menus (id, location, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'header', 'Main Menu'),
  ('22222222-2222-2222-2222-222222222222', 'footer', 'Footer Menu')
ON CONFLICT (id) DO NOTHING;

-- Menu items
INSERT INTO public.menu_items (menu_id, label, url, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Beranda', '/', 1),
  ('11111111-1111-1111-1111-111111111111', 'Themes', '/themes', 2),
  ('11111111-1111-1111-1111-111111111111', 'Layanan', '/services', 3),
  ('11111111-1111-1111-1111-111111111111', 'Infrastruktur', '/infrastructure', 4),
  ('11111111-1111-1111-1111-111111111111', 'Event & Agenda', '/events', 5),
  ('11111111-1111-1111-1111-111111111111', 'Blog', '/blog', 6),
  ('22222222-2222-2222-2222-222222222222', 'Beranda', '/', 1),
  ('22222222-2222-2222-2222-222222222222', 'Themes', '/themes', 2),
  ('22222222-2222-2222-2222-222222222222', 'Layanan', '/services', 3),
  ('22222222-2222-2222-2222-222222222222', 'Infrastruktur', '/infrastructure', 4),
  ('22222222-2222-2222-2222-222222222222', 'Event & Agenda', '/events', 5),
  ('22222222-2222-2222-2222-222222222222', 'Blog', '/blog', 6)
ON CONFLICT DO NOTHING;

-- Home sections
INSERT INTO public.home_sections (type, props, sort_order, is_visible) VALUES
  ('hero', '{}'::jsonb, 1, true),
  ('features', '{"title":"Kenapa IAMJOS-CMS?","subtitle":"Dari tema hingga indeksasi, kami dampingi setiap langkah.","items":[{"title":"Tema OJS Premium","description":"Desain modern, cepat, dan SEO-friendly untuk jurnal Anda."},{"title":"Pendampingan Indeksasi","description":"SINTA, Scopus, hingga Google Scholar dengan tim berpengalaman."},{"title":"Infrastruktur Andal","description":"VPS, domain, dan keamanan terkelola tanpa ribet."}]}'::jsonb, 2, true),
  ('blog_list', '{"title":"Dari Blog","subtitle":"Wawasan terbaru seputar pengelolaan jurnal.","limit":3}'::jsonb, 3, true),
  ('cta', '{"title":"Siap Tingkatkan Jurnal Anda?","subtitle":"Konsultasikan kebutuhan jurnal Anda dengan tim kami hari ini.","cta":{"label":"Hubungi Tim","href":"/services"}}'::jsonb, 4, true)
ON CONFLICT DO NOTHING;

-- Categories
INSERT INTO public.categories (id, slug, name, description) VALUES
  ('33333333-3333-3333-3333-333333333331', 'manajemen-jurnal', 'Manajemen Jurnal', 'Tips pengelolaan jurnal ilmiah'),
  ('33333333-3333-3333-3333-333333333332', 'indeksasi', 'Indeksasi', 'Panduan indeksasi dan akreditasi')
ON CONFLICT DO NOTHING;

-- Posts
INSERT INTO public.posts (slug, title, excerpt, content, status, category_id, published_at) VALUES
  ('panduan-akreditasi-sinta-2026', 'Panduan Akreditasi SINTA 2026', 'Langkah praktis menyiapkan jurnal menuju akreditasi SINTA terbaru.', '{"blocks":[{"type":"paragraph","text":"Persiapan akreditasi SINTA membutuhkan tata kelola yang rapi, dari manajemen naskah hingga konsistensi terbitan."}]}'::jsonb, 'published', '33333333-3333-3333-3333-333333333332', now() - interval '3 days'),
  ('setup-doi-crossref', 'Setup DOI & Crossref untuk Jurnal', 'Cara mendaftarkan dan mengonfigurasi DOI melalui Crossref.', '{"blocks":[{"type":"paragraph","text":"DOI memberikan identitas permanen untuk artikel Anda dan meningkatkan sitasi."}]}'::jsonb, 'published', '33333333-3333-3333-3333-333333333331', now() - interval '2 days'),
  ('tips-alur-editorial', 'Tips Alur Editorial yang Efisien', 'Optimalkan proses review dan publikasi di OJS.', '{"blocks":[{"type":"paragraph","text":"Alur editorial yang terstruktur mempercepat waktu publikasi dan menjaga kualitas."}]}'::jsonb, 'published', '33333333-3333-3333-3333-333333333331', now() - interval '1 days')
ON CONFLICT DO NOTHING;