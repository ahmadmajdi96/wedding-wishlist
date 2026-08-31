import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const uuid = z.string().uuid();

/* ---------------- public content ---------------- */

export const listOffers = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("offers")
    .select("*, vendors(id, name, city, image_url, price_from, rating)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(40);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listVendorAvailability = createServerFn({ method: "GET" })
  .inputValidator((d: { vendorId: string }) => z.object({ vendorId: uuid }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows, error } = await sb
      .from("vendor_availability")
      .select("date, note")
      .eq("vendor_id", data.vendorId);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const listFaq = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb.from("faq").select("*").eq("is_visible", true).order("sort_order");
  return data ?? [];
});

export const getLegalPage = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(40) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row } = await sb.from("legal_pages").select("*").eq("slug", data.slug).maybeSingle();
    return row;
  });

/* ---------------- messaging ---------------- */

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("conversations")
      .select("*, vendors(id, name, image_url, city)")
      .eq("user_id", context.userId)
      .order("last_message_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const startConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { vendorId: string }) => z.object({ vendorId: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("conversations")
      .select("id")
      .eq("user_id", context.userId)
      .eq("vendor_id", data.vendorId)
      .maybeSingle();
    if (existing) return { id: existing.id };
    const { data: row, error } = await context.supabase
      .from("conversations")
      .insert({ user_id: context.userId, vendor_id: data.vendorId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const getConversation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: conv, error } = await context.supabase
      .from("conversations")
      .select("*, vendors(id, name, image_url, city, phone, whatsapp)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!conv) throw new Error("Conversation not found");
    const { data: messages } = await context.supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", data.id)
      .order("created_at", { ascending: true });
    const isOwner = conv.user_id === context.userId;
    await context.supabase
      .from("conversations")
      .update(isOwner ? { unread_user: 0 } : { unread_admin: 0 })
      .eq("id", data.id);
    return { conversation: conv, messages: messages ?? [] };
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ conversationId: uuid, body: z.string().trim().min(1).max(1500) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: conv } = await context.supabase
      .from("conversations")
      .select("user_id")
      .eq("id", data.conversationId)
      .maybeSingle();
    if (!conv) throw new Error("Conversation not found");
    const role = conv.user_id === context.userId ? "user" : "admin";
    const { error } = await context.supabase.from("messages").insert({
      conversation_id: data.conversationId,
      sender_id: context.userId,
      sender_role: role,
      body: data.body,
    });
    if (error) throw new Error(error.message);
    if (role === "admin") {
      await context.supabase.from("notifications").insert({
        user_id: conv.user_id,
        title: "رسالة جديدة من فريق يلا نجهّز",
        body: data.body.slice(0, 120),
        kind: "message",
      });
    }
    return { ok: true };
  });

/* ---------------- guests ---------------- */

const guestSchema = z.object({
  id: uuid.optional(),
  name: z.string().trim().min(1).max(80),
  phone: z.string().trim().max(30).default(""),
  side: z.enum(["bride", "groom", "shared"]).default("bride"),
  seats: z.number().int().min(1).max(20).default(1),
  rsvp: z.enum(["pending", "yes", "no"]).default("pending"),
});

export const listGuests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("guests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveGuest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => guestSchema.parse(d))
  .handler(async ({ data, context }) => {
    const payload = { ...data, user_id: context.userId };
    const { error } = data.id
      ? await context.supabase.from("guests").update(payload).eq("id", data.id)
      : await context.supabase.from("guests").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteGuest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("guests").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- budget ---------------- */

const budgetSchema = z.object({
  id: uuid.optional(),
  label: z.string().trim().min(1).max(80),
  category_slug: z.string().trim().max(60).default(""),
  planned: z.number().nonnegative().default(0),
  actual: z.number().nonnegative().default(0),
  sort_order: z.number().int().min(0).max(999).default(0),
});

export const listBudget = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("budget_items")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveBudgetItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => budgetSchema.parse(d))
  .handler(async ({ data, context }) => {
    const payload = { ...data, user_id: context.userId };
    const { error } = data.id
      ? await context.supabase.from("budget_items").update(payload).eq("id", data.id)
      : await context.supabase.from("budget_items").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteBudgetItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("budget_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- tasks CRUD ---------------- */

export const saveTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: uuid.optional(),
        title: z.string().trim().min(1).max(120),
        due_date: z.string().max(20).nullable().optional(),
        notes: z.string().max(500).default(""),
        sort_order: z.number().int().min(0).max(999).default(99),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      ...data,
      due_date: data.due_date || null,
      user_id: context.userId,
    };
    const { error } = data.id
      ? await context.supabase.from("wedding_tasks").update(payload).eq("id", data.id)
      : await context.supabase.from("wedding_tasks").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("wedding_tasks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- saved searches ---------------- */

export const listSavedSearches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("saved_searches")
      .select("*")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const saveSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ label: z.string().trim().min(1).max(80), params: z.record(z.string(), z.any()) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("saved_searches")
      .insert({ user_id: context.userId, label: data.label, params: data.params });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSavedSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase.from("saved_searches").delete().eq("id", data.id);
    return { ok: true };
  });

/* ---------------- support ---------------- */

export const listMyTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const createTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        subject: z.string().trim().min(2).max(120),
        message: z.string().trim().min(2).max(1500),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("support_tickets")
      .insert({ user_id: context.userId, subject: data.subject, message: data.message });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
