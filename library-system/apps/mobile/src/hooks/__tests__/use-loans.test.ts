import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useMyLoans, useReturnBook } from "../use-loans";
import { supabase } from "../../lib/supabase";

jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
    functions: {
      invoke: jest.fn(),
    },
  },
}));

const mockFrom = supabase.from as jest.Mock;
const mockInvoke = supabase.functions.invoke as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useMyLoans", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches active and overdue loans for a member", async () => {
    const mockLoans = [
      {
        id: "loan-1",
        book_id: "book-1",
        member_id: "member-1",
        borrowed_at: "2025-05-01T00:00:00Z",
        due_date: "2025-05-15T00:00:00Z",
        returned_at: null,
        status: "active",
        book: {
          title: "Clean Code",
          author: "Robert C. Martin",
          cover_url: null,
        },
      },
      {
        id: "loan-2",
        book_id: "book-2",
        member_id: "member-1",
        borrowed_at: "2025-04-01T00:00:00Z",
        due_date: "2025-04-15T00:00:00Z",
        returned_at: null,
        status: "overdue",
        book: {
          title: "Refactoring",
          author: "Martin Fowler",
          cover_url: null,
        },
      },
    ];

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest
              .fn()
              .mockResolvedValue({ data: mockLoans, error: null }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useMyLoans("member-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].status).toBe("active");
    expect(result.current.data![1].status).toBe("overdue");
  });

  it("does not fetch when memberId is empty", () => {
    const { result } = renderHook(() => useMyLoans(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });

  it("handles errors from Supabase", async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest
              .fn()
              .mockResolvedValue({
                data: null,
                error: { message: "DB error" },
              }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useMyLoans("member-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useReturnBook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls process-return edge function with the loan ID", async () => {
    mockInvoke.mockResolvedValue({
      data: {
        message: "Return processed successfully",
        loan_id: "loan-1",
        overdue_days: 3,
        penalty: 15,
      },
      error: null,
    });

    const { result } = renderHook(() => useReturnBook(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("loan-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockInvoke).toHaveBeenCalledWith("process-return", {
      body: { loan_id: "loan-1" },
    });
    expect(result.current.data.penalty).toBe(15);
  });

  it("handles edge function errors", async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: "Function timeout" },
    });

    const { result } = renderHook(() => useReturnBook(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("loan-1");

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
