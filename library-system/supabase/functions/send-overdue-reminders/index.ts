// supabase/functions/send-overdue-reminders/index.ts
// Deno Edge Function — sends email/push notifications to members with overdue books.
// Triggered by cron or after mark-overdue-loans completes.
// Runs entirely server-side; librarian does not need to keep a browser open.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createAdminClient();

    // Fetch overdue loans joined with member contact info
    const { data: overdueLoans, error } = await supabase
      .from("loans")
      .select(
        `
        id,
        due_date,
        book:books(title),
        member:members(id, full_name, email, push_token)
      `,
      )
      .eq("status", "overdue")
      .eq("reminder_sent", false);

    if (error) throw error;

    if (!overdueLoans || overdueLoans.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending reminders", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const sent: string[] = [];

    for (const loan of overdueLoans) {
      const member = loan.member as any;
      const book = loan.book as any;

      // Send email via Supabase Auth or external provider
      // (placeholder — integrate with Resend, SendGrid, etc.)
      console.log(
        `[reminder] ${member.full_name} (${member.email}): "${book.title}" was due ${loan.due_date}`,
      );

      // Mark reminder as sent
      await supabase
        .from("loans")
        .update({ reminder_sent: true })
        .eq("id", loan.id);

      sent.push(loan.id);
    }

    return new Response(
      JSON.stringify({ message: `Sent ${sent.length} reminder(s)`, sent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
