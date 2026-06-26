import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const profileSchema = z.object({
  full_name: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  wedding_date: z.string().optional().nullable(),
  budget_min: z.number().nonnegative().optional().nullable(),
  budget_max: z.number().nonnegative().optional().nullable(),
  style_preferences: z.array(z.string().max(40)).max(20).optional(),
  onboarding_completed: z.boolean().optional(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => profileSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update(data)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("favorites")
      .select("vendor_id, vendors(id, name, city, image_url, price_from, rating, reviews_count)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { vendorId: string }) =>
    z.object({ vendorId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("favorites")
      .select("vendor_id")
      .eq("user_id", context.userId)
      .eq("vendor_id", data.vendorId)
      .maybeSingle();
    if (existing) {
      const { error } = await context.supabase
        .from("favorites")
        .delete()
        .eq("user_id", context.userId)
        .eq("vendor_id", data.vendorId);
      if (error) throw new Error(error.message);
      return { favorited: false };
    }
    const { error } = await context.supabase
      .from("favorites")
      .insert({ user_id: context.userId, vendor_id: data.vendorId });
    if (error) throw new Error(error.message);
    return { favorited: true };
  });

export const listBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("bookings")
      .select("*, vendors(id, name, city, image_url)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getBooking = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: booking, error } = await context.supabase
      .from("bookings")
      .select("*, vendors(id, name, city, image_url, price_from), vendor_packages(id, name, price)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!booking) throw new Error("Booking not found");
    return booking;
  });

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      vendor_id: z.string().uuid(),
      package_id: z.string().uuid().nullable().optional(),
      event_date: z.string().min(8),
      total: z.number().nonnegative(),
      notes: z.string().max(500).optional().nullable(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("bookings")
      .insert({
        user_id: context.userId,
        vendor_id: data.vendor_id,
        package_id: data.package_id ?? null,
        event_date: data.event_date,
        total: data.total,
        notes: data.notes ?? null,
        status: "pending",
        payment_status: "unpaid",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await context.supabase.from("notifications").insert({
      user_id: context.userId,
      title: "تم استلام طلب الحجز",
      body: "سيتم التواصل معكِ قريباً لتأكيد الحجز.",
      kind: "booking",
    });
    return { id: row.id };
  });

export const cancelBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("wedding_tasks")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const toggleTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "todo" | "done" }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["todo", "done"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("wedding_tasks")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
    return { ok: true };
  });
