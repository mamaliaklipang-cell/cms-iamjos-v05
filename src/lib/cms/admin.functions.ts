import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const isStaff = async (supabase: any, userId: string) => {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r: any) => r.role) as string[];
};

// ============ PAGES ============
export const adminListPages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("pages")
      .select("id, slug, title, status, updated_at, published_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const adminGetPage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    const { data: page, error } = await context.supabase
      .from("pages").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return page;
  });

const pageInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(80),
  title: z.string().min(1).max(200),
  content: z.any(),
  status: z.enum(["draft", "published"]),
  seo_title: z.string().max(200).nullish(),
  seo_description: z.string().max(400).nullish(),
  og_image: z.string().max(500).nullish(),
});

export const adminUpsertPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => pageInput.parse(d))
  .handler(async ({ context, data }) => {
    const payload: any = {
      ...data,
      author_id: context.userId,
      published_at: data.status === "published" ? new Date().toISOString() : null,
    };
    if (data.id) {
      const { error } = await context.supabase.from("pages").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    } else {
      delete payload.id;
      const { data: row, error } = await context.supabase.from("pages").insert(payload).select("id").single();
      if (error) throw new Error(error.message);
      return { id: row.id };
    }
  });

export const adminDeletePage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("pages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ POSTS ============
export const adminListPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("posts")
      .select("id, slug, title, status, updated_at, published_at, author_id, category_id")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const adminGetPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    const { data: post, error } = await context.supabase
      .from("posts").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    return post;
  });

const postInput = pageInput.extend({
  excerpt: z.string().max(500).nullish(),
  cover_image: z.string().max(500).nullish(),
  category_id: z.string().uuid().nullish(),
});

export const adminUpsertPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => postInput.parse(d))
  .handler(async ({ context, data }) => {
    const payload: any = {
      ...data,
      author_id: context.userId,
      published_at: data.status === "published" ? new Date().toISOString() : null,
    };
    if (data.id) {
      const { error } = await context.supabase.from("posts").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    } else {
      delete payload.id;
      const { data: row, error } = await context.supabase.from("posts").insert(payload).select("id").single();
      if (error) throw new Error(error.message);
      return { id: row.id };
    }
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("categories").select("*").order("name");
    return data ?? [];
  });

// ============ MENUS ============
export const adminGetMenuWithItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { location: "header" | "footer" }) => d)
  .handler(async ({ context, data }) => {
    const { data: menu } = await context.supabase
      .from("menus").select("*").eq("location", data.location).maybeSingle();
    if (!menu) return { menu: null, items: [] };
    const { data: items } = await context.supabase
      .from("menu_items").select("*").eq("menu_id", menu.id).order("sort_order");
    return { menu, items: items ?? [] };
  });

export const adminSaveMenuItems = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    menu_id: string;
    items: { id?: string; label: string; url: string | null; page_id: string | null; sort_order: number }[];
  }) => d)
  .handler(async ({ context, data }) => {
    // Replace all items
    await context.supabase.from("menu_items").delete().eq("menu_id", data.menu_id);
    if (data.items.length) {
      const rows = data.items.map((it, i) => ({
        menu_id: data.menu_id,
        label: it.label,
        url: it.url,
        page_id: it.page_id,
        sort_order: i,
      }));
      const { error } = await context.supabase.from("menu_items").insert(rows);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ============ HOME SECTIONS ============
export const adminListHomeSections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("home_sections").select("*").order("sort_order");
    return data ?? [];
  });

export const adminSaveHomeSections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    sections: { id?: string; type: string; props: any; sort_order: number; is_visible: boolean }[];
  }) => d)
  .handler(async ({ context, data }) => {
    // Wipe and re-insert (simple, transactional enough for small lists)
    await context.supabase.from("home_sections").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (data.sections.length) {
      const rows = data.sections.map((s, i) => ({
        type: s.type as any,
        props: s.props,
        sort_order: i,
        is_visible: s.is_visible,
      }));
      const { error } = await context.supabase.from("home_sections").insert(rows as any);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ============ MEDIA ============
export const adminListMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("media").select("*").order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });

export const adminInsertMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    path: string; url: string; mime_type?: string | null; size?: number | null; alt?: string | null;
  }) => d)
  .handler(async ({ context, data }) => {
    const { error, data: row } = await context.supabase.from("media").insert({
      ...data,
      uploaded_by: context.userId,
    }).select("*").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminDeleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; path: string }) => d)
  .handler(async ({ context, data }) => {
    await context.supabase.storage.from("media").remove([data.path]);
    const { error } = await context.supabase.from("media").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ SETTINGS ============
export const adminGetSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    return data;
  });

const settingsInput = z.object({
  site_name: z.string().min(1).max(120),
  tagline: z.string().max(200).nullish(),
  logo_url: z.string().max(500).nullish(),
  favicon_url: z.string().max(500).nullish(),
  font_family: z.enum(["Plus Jakarta Sans", "Inter", "Roboto", "Manrope", "Oswald"]),
  footer_html: z.string().max(5000).nullish(),
  social_links: z.any(),
  hero_default: z.any(),
});

export const adminSaveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => settingsInput.parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("site_settings").update(data as any).eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ USERS & ROLES ============
export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await isStaff(context.supabase, context.userId);
    if (!roles.includes("admin")) throw new Error("Forbidden");
    const { data: profiles } = await context.supabase.from("profiles").select("*").order("created_at");
    const { data: ur } = await context.supabase.from("user_roles").select("user_id, role");
    return (profiles ?? []).map((p: any) => ({
      ...p,
      roles: (ur ?? []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role),
    }));
  });

export const adminSetUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; role: "admin"|"editor"|"author"|"viewer"; enabled: boolean }) => d)
  .handler(async ({ context, data }) => {
    const roles = await isStaff(context.supabase, context.userId);
    if (!roles.includes("admin")) throw new Error("Forbidden");
    if (data.enabled) {
      await context.supabase.from("user_roles").insert({ user_id: data.user_id, role: data.role });
    } else {
      await context.supabase.from("user_roles").delete().eq("user_id", data.user_id).eq("role", data.role);
    }
    return { ok: true };
  });

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    return (data ?? []).map((r: any) => r.role) as string[];
  });
