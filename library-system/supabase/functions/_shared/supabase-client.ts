import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Create a Supabase admin client for server-side operations.
 * Uses the service role key so Edge Functions can bypass RLS.
 */
export function createAdminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}
