// supabase/functions/mark-overdue-loans/index.ts
// Deno Edge Function — runs on a cron schedule (pg_cron or external trigger).
// Scans all active loans past their due date and marks them as "overdue".
// Heavy processing is server-side; no browser session required.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";
// Import shared business logic from monorepo — resolved via deno.json import map
import { calculatePenalty } from "@library-system/shared-utils";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date();
    const nowIso = now.toISOString();

    // Find all active loans where due_date has passed
    const { data: overdueLoans, error: fetchError } = await supabase
      .from("loans")
      .select("id, member_id, book_id, due_date")
      .eq("status", "active")
      .lt("due_date", nowIso);

    if (fetchError) throw fetchError;

    if (!overdueLoans || overdueLoans.length === 0) {
      return new Response(
        JSON.stringify({ message: "No overdue loans found", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Batch update status to "overdue" and calculate projected penalties
    const results = overdueLoans.map(
      (loan: { id: string; due_date: string }) => ({
        id: loan.id,
        projected_penalty: calculatePenalty(new Date(loan.due_date), now),
      }),
    );

    const ids = results.map((r) => r.id);
    const { error: updateError } = await supabase
      .from("loans")
      .update({ status: "overdue", updated_at: nowIso })
      .in("id", ids);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        message: `Marked ${ids.length} loan(s) as overdue`,
        count: ids.length,
        loans: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
