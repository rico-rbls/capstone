// supabase/functions/generate-member-qr/index.ts
// Deno Edge Function — generates a signed, time-limited QR payload for a member.
// The QR code encodes a TOTP-like hash so attendance scanners can verify identity
// without a round-trip to the database at scan time.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface QrPayload {
  member_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { member_id } = (await req.json()) as QrPayload;
    if (!member_id) {
      return new Response(JSON.stringify({ error: "member_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createAdminClient();
    const secret = Deno.env.get("QR_SIGNING_SECRET") || "default-secret";

    // Generate a time-based hash (30-second window)
    const windowSeconds = 30;
    const counter = Math.floor(Date.now() / 1000 / windowSeconds);
    const input = `${secret}:${member_id}:${counter}`;

    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const code = Math.abs(hash % 1_000_000)
      .toString()
      .padStart(6, "0");

    const payload = JSON.stringify({
      member_id,
      code,
      expires_at: new Date((counter + 1) * windowSeconds * 1000).toISOString(),
    });

    return new Response(payload, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
