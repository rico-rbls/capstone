// supabase/functions/mark-overdue-loans/index.ts
// Deno Edge Function — runs on a cron schedule (pg_cron or external trigger).
// Scans all active loans past their due date and marks them as "overdue".
// Heavy processing is server-side; no browser session required.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Find all active loans where due_date has passed
    const { data: overdueLoans, error: fetchError } = await supabase
      .from("loans")
      .select("id, member_id, book_id, due_date")
      .eq("status", "active")
      .lt("due_date", now);

    if (fetchError) throw fetchError;

    if (!overdueLoans || overdueLoans.length === 0) {
      return new Response(
        JSON.stringify({ message: "No overdue loans found", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Batch update status to "overdue"
    const ids = overdueLoans.map((loan) => loan.id);
    const { error: updateError } = await supabase
      .from("loans")
      .update({ status: "overdue", updated_at: now })
      .in("id", ids);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        message: `Marked ${ids.length} loan(s) as overdue`,
        count: ids.length,
        loan_ids: ids,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
