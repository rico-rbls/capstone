// supabase/functions/check-in-member/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyStudentQR } from "@capstone/shared-utils/generateTotpHash.ts"; // Utilizing the import map!

// Standard CORS headers for mobile requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { studentId, scannedToken } = await req.json();

    // 1. Initialize Supabase with the Service Role Key (Bypasses RLS for secure validation)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Fetch the student's unique TOTP secret and penalty status
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('totp_secret, has_active_penalty') // NOTE: We must add a totp_secret column to students later
      .eq('student_id', studentId)
      .single();

    if (studentError || !student) throw new Error("Student record not found.");
    
    // 3. Institutional Constraint Check
    if (student.has_active_penalty) {
      return new Response(JSON.stringify({ error: "Access Denied: Unpaid library fine of ₱5.00." }), { status: 403, headers: corsHeaders });
    }

    // 4. Cryptographic Validation (30-second window)
    const isValid = verifyStudentQR(student.totp_secret, scannedToken);
    
    if (!isValid) {
      return new Response(JSON.stringify({ error: "QR Code expired. Please refresh the app." }), { status: 401, headers: corsHeaders });
    }

    // 5. Anti-Replay Attack Check (Has this code been scanned in the last 30 seconds?)
    const { data: existingLog } = await supabase
      .from('attendance_logs')
      .select('log_id')
      .eq('scanned_totp_token', scannedToken)
      .single();

    if (existingLog) {
       return new Response(JSON.stringify({ error: "QR Code already used." }), { status: 409, headers: corsHeaders });
    }

    // 6. Record Attendance
    const { error: logError } = await supabase
      .from('attendance_logs')
      .insert({
        student_id: studentId,
        scanned_totp_token: scannedToken,
        status: 'ACTIVE'
      });

    if (logError) throw logError;

    return new Response(JSON.stringify({ success: true, message: "Attendance verified." }), { status: 200, headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
  }
});