import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const LOVABLE_ZONES = [
  "lovableproject.com",
  "lovableproject-dev.com",
  "lovable.app",
  "gpt-eng.com",
  "gptengineer.run",
];

/** The Lovable-brokered OAuth flow only exists on Lovable-hosted domains.
 *  On a self-hosted domain it 404s, so go straight to the backend provider. */
export function isLovableHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return LOVABLE_ZONES.some((z) => host === z || host.endsWith("." + z));
}

export async function signInWithGoogle(): Promise<{ error?: unknown }> {
  const redirectTo = `${window.location.origin}/auth/callback`;

  if (isLovableHost()) {
    return await lovable.auth.signInWithOAuth("google", { redirect_uri: redirectTo });
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  return { error: error ?? undefined };
}
