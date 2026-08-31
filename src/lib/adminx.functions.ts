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

async function audit(
  context: { supabase: any; userId: string },
  action: string,
  entity: string,
  entityId: string,
  details: Record<string, unknown> = {},
) {
  await context.supabase
    .from("audit_log")
    .insert({ actor_id: context.userId, action, entity, entity_id: entityId, details });
}

/* ---------------- analytics ---------------- */

export const adminAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const sb = context.supabase;
    const [bookings, vendors, profiles, reviews] = await Promise.all([
      sb.from("bookings").select("total, status, created_at, event_date, vendor_id"),
      sb.from("vendors").select("id, name, rating, reviews_count, views_count, city, is_featured"),
      sb.from("profiles").select("id, created_at, city"),
      sb.from("reviews").select("id, rating, status, created_at"),
    ]);
    const b = (bookings.data ?? []) as any[];
    const v = (vendors.data ?? []) as any[];
    const p = (profiles.data ?? []) as any[];
    const r = (reviews.data ?? []) as any[];

    const monthKey = (d: string) => String(d).slice(0, 7);
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    const series = months.map((m) => ({
      month: m,
      bookings: b.filter((x) => monthKey(x.created_at) === m).length,
      revenue: b
        .filter((x) => monthKey(x.created_at) === m && x.status === "confirmed")
        .reduce((a, x) => a + Number(x.total), 0),
      users: p.filter((x) => monthKey(x.created_at) === m).length,
    }));

    const perVendor = new Map<string, number>();
    for (const x of b) perVendor.set(x.vendor_id, (perVendor.get(x.vendor_id) ?? 0) + 1);
    const topVendors = v
      .map((x) => ({ ...x, bookings: perVendor.get(x.id) ?? 0 }))
      .sort((a, x) => x.bookings - a.bookings || x.rating - a.rating)
      .slice(0, 8);

    const cityMap = new Map<string, number>();
    for (const x of v) cityMap.set(x.city, (cityMap.get(x.city) ?? 0) + 1);

    return {
      series,
      topVendors,
      cities: Array.from(cityMap, ([city, count]) => ({ city, count })).sort((a, x) => x.count - a.count),
      totals: {
        bookings: b.length,
        revenue: b.filter((x) => x.status === "confirmed").reduce((a, x) => a + Number(x.total), 0),
        users: p.length,
        vendors: v.length,
        reviews: r.length,
        avgRating: r.length ? Math.round((r.reduce((a, x) => a + x.rating, 0) / r.length) * 10) / 10 : 0,
        pendingReviews: r.filter((x) => x.status === "pending").length,
        conversion: p.length ? Math.round((b.length / p.length) * 100) : 0,
      },
    };
  });

/* ---------------- reviews moderation ---------------- */

export const adminListReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("reviews")
      .select("*, vendors(id, name, image_url)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminModerateReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: uuid, status: z.enum(["approved", "pending", "rejected"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("reviews")
      .update({ status: data.status, is_reported: false })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context, "moderate_review", "reviews", data.id, { status: data.status });
    return { ok: true };
  });

export const adminDeleteReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("reviews").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context, "delete_review", "reviews", data.id);
    return { ok: true };
  });

/* ---------------- offers ---------------- */

export const adminListOffers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("offers")
      .select("*, vendors(id, name, image_url)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSaveOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: uuid.optional(),
        vendor_id: uuid,
        title: z.string().trim().min(2).max(120),
        description: z.string().max(400).default(""),
        discount_percent: z.number().int().min(0).max(100).default(10),
        starts_on: z.string().max(20),
        ends_on: z.string().max(20).nullable().optional(),
        is_active: z.boolean().default(true),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const payload = { ...data, ends_on: data.ends_on || null };
    const { error } = data.id
      ? await context.supabase.from("offers").update(payload).eq("id", data.id)
      : await context.supabase.from("offers").insert(payload);
    if (error) throw new Error(error.message);
    await audit(context, data.id ? "update_offer" : "create_offer", "offers", data.id ?? "");
    return { ok: true };
  });

export const adminDeleteOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("offers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(context, "delete_offer", "offers", data.id);
    return { ok: true };
  });

/* ---------------- availability ---------------- */

export const adminListAvailability = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { vendorId: string }) => z.object({ vendorId: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: rows } = await context.supabase
      .from("vendor_availability")
      .select("*")
      .eq("vendor_id", data.vendorId)
      .order("date");
    return rows ?? [];
  });

export const adminToggleAvailability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ vendorId: uuid, date: z.string().max(20), note: z.string().max(120).default("") }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: existing } = await context.supabase
      .from("vendor_availability")
      .select("id")
      .eq("vendor_id", data.vendorId)
      .eq("date", data.date)
      .maybeSingle();
    if (existing) {
      await context.supabase.from("vendor_availability").delete().eq("id", existing.id);
      return { blocked: false };
    }
    const { error } = await context.supabase
      .from("vendor_availability")
      .insert({ vendor_id: data.vendorId, date: data.date, note: data.note });
    if (error) throw new Error(error.message);
    return { blocked: true };
  });

/* ---------------- inbox ---------------- */

export const adminListConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("conversations")
      .select("*, vendors(id, name, image_url)")
      .order("last_message_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((data ?? []).map((c: any) => c.user_id)));
    const { data: profiles } = await context.supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const map = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    return (data ?? []).map((c: any) => ({ ...c, profile: map.get(c.user_id) ?? null }));
  });

/* ---------------- support ---------------- */

export const adminListTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminReplyTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: uuid,
        admin_reply: z.string().trim().min(1).max(1500),
        status: z.enum(["open", "answered", "closed"]).default("answered"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: ticket, error } = await context.supabase
      .from("support_tickets")
      .update({ admin_reply: data.admin_reply, status: data.status })
      .eq("id", data.id)
      .select("user_id, subject")
      .single();
    if (error) throw new Error(error.message);
    await context.supabase.from("notifications").insert({
      user_id: ticket.user_id,
      title: "رد على طلب الدعم",
      body: `${ticket.subject}: ${data.admin_reply.slice(0, 120)}`,
      kind: "support",
    });
    await audit(context, "reply_ticket", "support_tickets", data.id);
    return { ok: true };
  });

/* ---------------- FAQ / legal / settings ---------------- */

export const adminGetSiteContent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [faq, legal, settings] = await Promise.all([
      context.supabase.from("faq").select("*").order("sort_order"),
      context.supabase.from("legal_pages").select("*").order("slug"),
      context.supabase.from("app_settings").select("*").order("key"),
    ]);
    return { faq: faq.data ?? [], legal: legal.data ?? [], settings: settings.data ?? [] };
  });

export const adminSaveFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: uuid.optional(),
        question: z.string().trim().min(2).max(200),
        answer: z.string().trim().max(2000).default(""),
        sort_order: z.number().int().min(0).max(999).default(0),
        is_visible: z.boolean().default(true),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = data.id
      ? await context.supabase.from("faq").update(data).eq("id", data.id)
      : await context.supabase.from("faq").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await context.supabase.from("faq").delete().eq("id", data.id);
    return { ok: true };
  });

export const adminSaveLegal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        slug: z.string().trim().min(2).max(40),
        title: z.string().trim().min(2).max(120),
        body: z.string().max(20000).default(""),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("legal_pages")
      .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: "slug" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSaveSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        key: z.string().trim().min(2).max(60),
        value: z.string().max(500).default(""),
        label: z.string().max(120).default(""),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("app_settings").upsert(data, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- audit ---------------- */

export const adminListAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    return data ?? [];
  });
