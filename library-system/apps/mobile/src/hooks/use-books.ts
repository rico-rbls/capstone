import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  available_copies: number;
  total_copies: number;
  cover_url: string | null;
}

export function useBooks(searchQuery?: string) {
  return useQuery({
    queryKey: ["books", searchQuery],
    queryFn: async (): Promise<Book[]> => {
      let query = supabase.from("books").select("*").order("title");

      if (searchQuery && searchQuery.trim().length > 0) {
        query = query.or(
          `title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,isbn.ilike.%${searchQuery}%`,
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: true,
  });
}

export function useBookById(bookId: string) {
  return useQuery({
    queryKey: ["books", bookId],
    queryFn: async (): Promise<Book | null> => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!bookId,
  });
}
