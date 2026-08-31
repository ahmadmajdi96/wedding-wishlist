import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("categories")
    .select("id, slug, name_ar, icon, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listVendors = createServerFn({ method: "GET" })
  .inputValidator((d: { categorySlug?: string }) =>
    z.object({ categorySlug: z.string().optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb
      .from("vendors")
      .select("id, name, city, image_url, price_from, rating, reviews_count, category_id, categories!inner(slug, name_ar)")
      .order("rating", { ascending: false });
    if (data.categorySlug) q = q.eq("categories.slug", data.categorySlug);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getVendor = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: vendor, error } = await sb
      .from("vendors")
      .select(
        "*, categories(slug, name_ar), vendor_packages(id, name, price, includes, sort_order), vendor_images(id, url, sort_order)",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!vendor) throw new Error("Vendor not found");
    return vendor;
  });

export const searchVendors = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        q: z.string().trim().max(80).optional(),
        city: z.string().trim().max(60).optional(),
        categorySlug: z.string().trim().max(60).optional(),
        maxPrice: z.number().nonnegative().optional(),
        minRating: z.number().min(0).max(5).optional(),
        sort: z.enum(["rating", "price_asc", "price_desc", "newest"]).default("rating"),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb
      .from("vendors")
      .select(
        "id, name, city, image_url, price_from, rating, reviews_count, is_featured, is_verified, categories!inner(slug, name_ar)",
      )
      .eq("is_active", true);
    if (data.q) q = q.or(`name.ilike.%${data.q}%,description.ilike.%${data.q}%,city.ilike.%${data.q}%`);
    if (data.city) q = q.eq("city", data.city);
    if (data.categorySlug) q = q.eq("categories.slug", data.categorySlug);
    if (data.maxPrice) q = q.lte("price_from", data.maxPrice);
    if (data.minRating) q = q.gte("rating", data.minRating);
    if (data.sort === "price_asc") q = q.order("price_from", { ascending: true });
    else if (data.sort === "price_desc") q = q.order("price_from", { ascending: false });
    else if (data.sort === "newest") q = q.order("created_at", { ascending: false });
    else q = q.order("rating", { ascending: false });
    const { data: rows, error } = await q.limit(60);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listCities = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("vendors").select("city").eq("is_active", true);
  if (error) throw new Error(error.message);
  return Array.from(new Set((data ?? []).map((r) => r.city))).sort();
});

