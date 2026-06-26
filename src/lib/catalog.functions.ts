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
      .select("*, categories(slug, name_ar), vendor_packages(id, name, price, includes, sort_order)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!vendor) throw new Error("Vendor not found");
    return vendor;
  });
