// supabase/functions/process-return/index.ts
// Deno Edge Function — processes a book return server-side.
// Calculates fines, updates loan status, and restores book availability.
// Offloaded from the client so the operation completes even if the browser closes.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface ReturnPayload {
  loan_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { loan_id } = (await req.json()) as ReturnPayload;
    if (!loan_id) {
      return new Response(JSON.stringify({ error: "loan_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createAdminClient();
    const now = new Date();

    // Fetch the loan
    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .select("id, book_id, member_id, due_date, status")
      .eq("id", loan_id)
      .single();

    if (loanError || !loan) {
      return new Response(JSON.stringify({ error: "Loan not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate penalty
    const dueDate = new Date(loan.due_date);
    const msPerDay = 1000 * 60 * 60 * 24;
    const overdueDays = Math.max(
      0,
      Math.floor((now.getTime() - dueDate.getTime()) / msPerDay),
    );
    const dailyRate = 5; // currency units per day
    const penalty = overdueDays * dailyRate;

    // Update loan status to "returned"
    const { error: updateLoanError } = await supabase
      .from("loans")
      .update({
        status: "returned",
        returned_at: now.toISOString(),
        penalty_amount: penalty,
        updated_at: now.toISOString(),
      })
      .eq("id", loan_id);

    if (updateLoanError) throw updateLoanError;

    // Restore book availability
    const { error: updateBookError } = await supabase
      .from("books")
      .update({ available_copies: supabase.rpc ? undefined : undefined })
      .eq("id", loan.book_id);

    // Increment available_copies via RPC for atomicity
    await supabase.rpc("increment_available_copies", { book_id: loan.book_id });

    // Insert fine record if applicable
    if (penalty > 0) {
      await supabase.from("fines").insert({
        member_id: loan.member_id,
        loan_id: loan.id,
        amount: penalty,
        reason: `${overdueDays} day(s) overdue`,
        status: "unpaid",
      });
    }

    return new Response(
      JSON.stringify({
        message: "Return processed successfully",
        loan_id,
        overdue_days: overdueDays,
        penalty,
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
