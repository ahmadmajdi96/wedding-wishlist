import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const uuid = z.string().uuid();

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: Boolean(data) };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const sb = context.supabase;
    const [vendors, categories, bookings, users, reviews] = await Promise.all([
      sb.from("vendors").select("id", { count: "exact", head: true }),
      sb.from("categories").select("id", { count: "exact", head: true }),
      sb.from("bookings").select("total, status"),
      sb.from("profiles").select("id", { count: "exact", head: true }),
      sb.from("reviews").select("id", { count: "exact", head: true }),
    ]);
    const rows = (bookings.data ?? []) as { total: number; status: string }[];
    return {
      vendors: vendors.count ?? 0,
      categories: categories.count ?? 0,
      users: users.count ?? 0,
      reviews: reviews.count ?? 0,
      bookings: rows.length,
      pending: rows.filter((b) => b.status === "pending").length,
      confirmed: rows.filter((b) => b.status === "confirmed").length,
      revenue: rows
        .filter((b) => b.status === "confirmed")
        .reduce((a, b) => a + Number(b.total), 0),
    };
  });

/* ---------------- categories ---------------- */

const categoryInput = z.object({
  id: uuid.optional(),
  slug: z.string().trim().min(2).max(60),
  name_ar: z.string().trim().min(2).max(80),
  icon: z.string().trim().min(1).max(40),
  sort_order: z.number().int().min(0).max(999),
});

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSaveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => categoryInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...values } = data;
    const q = id
      ? context.supabase.from("categories").update(values).eq("id", id)
      : context.supabase.from("categories").insert(values);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- vendors ---------------- */

const vendorInput = z.object({
  id: uuid.optional(),
  name: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(60),
  category_id: uuid,
  image_url: z.string().trim().min(4).max(500),
  price_from: z.number().nonnegative(),
  description: z.string().trim().max(2000).default(""),
  capacity: z.number().int().nonnegative().nullable().optional(),
  area_m2: z.number().int().nonnegative().nullable().optional(),
  parking: z.number().int().nonnegative().nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  whatsapp: z.string().trim().max(30).nullable().optional(),
  address: z.string().trim().max(200).nullable().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_verified: z.boolean().default(false),
});

export const adminListVendors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("vendors")
      .select("*, categories(name_ar, slug)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSaveVendor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => vendorInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...values } = data;
    const q = id
      ? context.supabase.from("vendors").update(values).eq("id", id)
      : context.supabase.from("vendors").insert(values);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteVendor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("vendors").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- packages ---------------- */

const packageInput = z.object({
  id: uuid.optional(),
  vendor_id: uuid,
  name: z.string().trim().min(2).max(100),
  price: z.number().nonnegative(),
  includes: z.string().trim().max(500).default(""),
  sort_order: z.number().int().min(0).max(99).default(0),
});

export const adminListPackages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { vendorId: string }) => z.object({ vendorId: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: rows, error } = await context.supabase
      .from("vendor_packages")
      .select("*")
      .eq("vendor_id", data.vendorId)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSavePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => packageInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...values } = data;
    const q = id
      ? context.supabase.from("vendor_packages").update(values).eq("id", id)
      : context.supabase.from("vendor_packages").insert(values);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeletePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("vendor_packages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- gallery ---------------- */

export const adminListVendorImages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { vendorId: string }) => z.object({ vendorId: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: rows, error } = await context.supabase
      .from("vendor_images")
      .select("*")
      .eq("vendor_id", data.vendorId)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminAddVendorImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        vendor_id: uuid,
        url: z.string().trim().min(4).max(500),
        sort_order: z.number().int().min(0).max(99).default(0),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("vendor_images").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteVendorImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("vendor_images").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- bookings ---------------- */

export const adminListBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("bookings")
      .select("*, vendors(name, city)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpdateBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: uuid,
        status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
        payment_status: z.enum(["unpaid", "deposit", "paid"]).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...values } = data;
    const { error } = await context.supabase.from("bookings").update(values).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("bookings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- users ---------------- */

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { data: roles } = await context.supabase.from("user_roles").select("user_id, role");
    return (data ?? []).map((p: any) => ({
      ...p,
      roles: (roles ?? []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role),
    }));
  });

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        userId: uuid,
        role: z.enum(["admin", "moderator", "user"]),
        grant: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.grant) {
      const { error } = await context.supabase
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

/* ---------------- broadcast ---------------- */

export const adminBroadcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        title: z.string().trim().min(2).max(120),
        body: z.string().trim().max(500).default(""),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: users, error } = await context.supabase.from("profiles").select("id");
    if (error) throw new Error(error.message);
    const rows = (users ?? []).map((u: any) => ({
      user_id: u.id,
      title: data.title,
      body: data.body,
      kind: "system",
    }));
    if (rows.length) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: insErr } = await supabaseAdmin.from("notifications").insert(rows);
      if (insErr) throw new Error(insErr.message);
    }
    return { sent: rows.length };
  });

/* ---------------- home content (CMS) ---------------- */

export const adminGetHomeContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const sb = context.supabase;
    const [slides, sections, testimonials, features] = await Promise.all([
      sb.from("home_slides").select("*").order("sort_order"),
      sb.from("home_sections").select("*").order("sort_order"),
      sb.from("testimonials").select("*").order("sort_order"),
      sb.from("home_features").select("*").order("sort_order"),
    ]);
    return {
      slides: slides.data ?? [],
      sections: sections.data ?? [],
      testimonials: testimonials.data ?? [],
      features: features.data ?? [],
    };
  });

const TABLES = ["home_slides", "home_sections", "testimonials", "home_features"] as const;
const tableEnum = z.enum(TABLES);

export const adminSaveHomeRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ table: tableEnum, values: z.record(z.string(), z.any()) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...values } = data.values as Record<string, any>;
    const q = id
      ? context.supabase.from(data.table).update(values).eq("id", id)
      : context.supabase.from(data.table).insert(values);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteHomeRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ table: tableEnum, id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
