import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const getHomeContent = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [slides, sections, testimonials, features] = await Promise.all([
    sb.from("home_slides").select("*").eq("is_visible", true).order("sort_order"),
    sb.from("home_sections").select("*").order("sort_order"),
    sb.from("testimonials").select("*").eq("is_visible", true).order("sort_order"),
    sb.from("home_features").select("*").eq("is_visible", true).order("sort_order"),
  ]);
  const sectionMap: Record<string, any> = {};
  for (const s of sections.data ?? []) sectionMap[s.key] = s;
  return {
    slides: slides.data ?? [],
    sections: sectionMap,
    sectionList: sections.data ?? [],
    testimonials: testimonials.data ?? [],
    features: features.data ?? [],
  };
});
