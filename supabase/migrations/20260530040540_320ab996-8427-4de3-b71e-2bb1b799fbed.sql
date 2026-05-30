
INSERT INTO public.site_settings (id, site_name, tagline, font_family, footer_html, hero_default)
VALUES (
  1,
  'Lumen CMS',
  'Modern content platform',
  'Plus Jakarta Sans',
  '<p class="text-sm text-muted-foreground">© 2026 Lumen CMS. Built with love.</p>',
  jsonb_build_object(
    'eyebrow', 'Modern Content Platform',
    'title', E'Publish beautiful\ncontent, faster.',
    'subtitle', 'A premium WordPress-style CMS with pages, posts, menus, media, and a section-based home builder.',
    'cta_primary', jsonb_build_object('label','Get started','href','/admin'),
    'cta_secondary', jsonb_build_object('label','Read blog','href','/blog')
  )
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.menus (location, name) VALUES ('header','Header'), ('footer','Footer')
ON CONFLICT (location) DO NOTHING;

INSERT INTO public.menu_items (menu_id, label, url, sort_order)
SELECT id, 'Home', '/', 0 FROM public.menus WHERE location='header'
UNION ALL SELECT id, 'Blog', '/blog', 1 FROM public.menus WHERE location='header'
UNION ALL SELECT id, 'Admin', '/admin', 2 FROM public.menus WHERE location='header'
UNION ALL SELECT id, 'Blog', '/blog', 0 FROM public.menus WHERE location='footer'
UNION ALL SELECT id, 'Login', '/login', 1 FROM public.menus WHERE location='footer';

INSERT INTO public.home_sections (type, props, sort_order, is_visible) VALUES
('hero', '{}'::jsonb, 0, true),
('features', jsonb_build_object(
  'title','Everything you need',
  'subtitle','A complete toolkit to manage your content with confidence.',
  'items', jsonb_build_array(
    jsonb_build_object('title','Pages & Posts','description','Create rich pages and blog posts with categories and tags.'),
    jsonb_build_object('title','Menu Manager','description','Configure header and footer navigation visually.'),
    jsonb_build_object('title','Media Library','description','Upload, browse, and reuse images across the site.')
  )
), 1, true),
('blog_list', jsonb_build_object('title','From the blog','subtitle','Latest stories and updates.','limit',3), 2, true),
('cta', jsonb_build_object(
  'title','Ready to build?',
  'subtitle','Jump into the admin and start composing your homepage.',
  'cta', jsonb_build_object('label','Open admin','href','/admin')
), 3, true);
