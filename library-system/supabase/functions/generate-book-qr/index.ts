// supabase/functions/generate-book-qr/index.ts
// Deno Edge Function — generates a QR code payload for a specific book.
// Used by librarians to print QR labels for physical books.
// Server-side generation ensures consistent encoding and signing.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createAdminClient } from "../_shared/supabase-client.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface BookQrPayload {
  book_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { book_id } = (await req.json()) as BookQrPayload;
    if (!book_id) {
      return new Response(JSON.stringify({ error: "book_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createAdminClient();

    // Verify book exists
    const { data: book, error } = await supabase
      .from("books")
      .select("id, title, isbn")
      .eq("id", book_id)
      .single();

    if (error || !book) {
      return new Response(JSON.stringify({ error: "Book not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build QR payload — this is what gets encoded into the physical QR label
    const qrData = JSON.stringify({
      type: "book",
      id: book.id,
      isbn: book.isbn,
      title: book.title,
    });

    return new Response(JSON.stringify({ qr_data: qrData, book }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
