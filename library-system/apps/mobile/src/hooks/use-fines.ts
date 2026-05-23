import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export interface Fine {
  id: string;
  member_id: string;
  loan_id: string;
  amount: number;
  reason: string;
  status: "unpaid" | "paid";
  created_at: string;
}

export function useMyFines(memberId: string) {
  return useQuery({
    queryKey: ["fines", memberId],
    queryFn: async (): Promise<Fine[]> => {
      const { data, error } = await supabase
        .from("fines")
        .select("*")
        .eq("member_id", memberId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!memberId,
  });
}

export function useUnpaidFinesTotal(memberId: string) {
  return useQuery({
    queryKey: ["fines", memberId, "unpaid-total"],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase
        .from("fines")
        .select("amount")
        .eq("member_id", memberId)
        .eq("status", "unpaid");

      if (error) throw error;
      return (data ?? []).reduce((sum, fine) => sum + fine.amount, 0);
    },
    enabled: !!memberId,
  });
}
