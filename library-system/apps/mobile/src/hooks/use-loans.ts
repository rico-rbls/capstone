import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export interface Loan {
  id: string;
  book_id: string;
  member_id: string;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: "active" | "overdue" | "returned";
  book?: { title: string; author: string; cover_url: string | null };
}

export function useMyLoans(memberId: string) {
  return useQuery({
    queryKey: ["loans", memberId],
    queryFn: async (): Promise<Loan[]> => {
      const { data, error } = await supabase
        .from("loans")
        .select("*, book:books(title, author, cover_url)")
        .eq("member_id", memberId)
        .in("status", ["active", "overdue"])
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!memberId,
  });
}

export function useReturnBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loanId: string) => {
      const { data, error } = await supabase.functions.invoke(
        "process-return",
        {
          body: { loan_id: loanId },
        },
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });
}
