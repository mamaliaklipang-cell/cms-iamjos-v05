import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Public reads used by SSR loaders on public routes.

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});

export const getMenu = createServerFn({ method: "GET" })
  .inputValidator((d: { location: "header" | "footer" }) => d)
  .handler(async ({ data }) => {
    const { data: menu } = await supabaseAdmin
      .from("menus")
      .select("id, location, name")
      .eq("location", data.location)
      .maybeSingle();
    if (!menu) return { menu: null, items: [] };
    const { data: items } = await supabaseAdmin
      .from("menu_items")
      .select("id, label, url, page_id, parent_id, sort_order")
      .eq("menu_id", menu.id)
      .order("sort_order", { ascending: true });
    return { menu, items: items ?? [] };
  });

export const getHomeSections = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("home_sections")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getPublishedPage = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { data: page } = await supabaseAdmin
      .from("pages")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    return page;
  });

export const listPublishedPosts = createServerFn({ method: "GET" })
  .inputValidator((d: { limit?: number } | undefined) => d ?? {})
  .handler(async ({ data }) => {
    const { data: posts, error } = await supabaseAdmin
      .from("posts")
      .select("id, slug, title, excerpt, cover_image, published_at, category_id")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(data?.limit ?? 50);
    if (error) throw new Error(error.message);
    return posts ?? [];
  });

export const getPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const { data: post } = await supabaseAdmin
      .from("posts")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    return post;
  });
