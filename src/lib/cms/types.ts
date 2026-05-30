import { z } from "zod";

export const ROLES = ["admin", "editor", "author", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const FONT_OPTIONS = ["Plus Jakarta Sans", "Inter", "Roboto", "Manrope", "Oswald"] as const;
export type FontFamily = (typeof FONT_OPTIONS)[number];

export const SECTION_TYPES = [
  "hero",
  "features",
  "cta",
  "gallery",
  "testimonials",
  "blog_list",
  "rich_text",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const STATUS = ["draft", "published"] as const;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

export const fontHrefFor = (f: FontFamily) => {
  const map: Record<FontFamily, string> = {
    "Plus Jakarta Sans":
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
    Inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
    Roboto: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap",
    Manrope: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap",
    Oswald: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap",
  };
  return map[f];
};

export const pageSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(80),
  title: z.string().min(1).max(200),
  content: z.any(),
  status: z.enum(STATUS),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(400).nullable().optional(),
  og_image: z.string().max(500).nullable().optional(),
});

export const postSchema = pageSchema.extend({
  excerpt: z.string().max(500).nullable().optional(),
  cover_image: z.string().max(500).nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
});
