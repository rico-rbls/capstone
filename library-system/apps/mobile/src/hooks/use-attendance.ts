import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export interface AttendanceRecord {
  id: string;
  member_id: string;
  session_id: string;
  scanned_at: string;
}

export interface AttendanceSession {
  id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

export function useActiveSessions() {
  return useQuery({
    queryKey: ["attendance-sessions", "active"],
    queryFn: async (): Promise<AttendanceSession[]> => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("attendance_sessions")
        .select("*")
        .lte("starts_at", now)
        .gte("ends_at", now)
        .eq("is_active", true);

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRecordAttendance() {
  return useMutation({
    mutationFn: async ({
      memberId,
      sessionId,
    }: {
      memberId: string;
      sessionId: string;
    }): Promise<AttendanceRecord> => {
      const { data, error } = await supabase
        .from("attendance_records")
        .insert({
          member_id: memberId,
          session_id: sessionId,
          scanned_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}
