import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useMyFines, useUnpaidFinesTotal } from "../use-fines";
import { supabase } from "../../lib/supabase";

jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockFrom = supabase.from as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useMyFines", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches all fines for a member ordered by date", async () => {
    const mockFines = [
      {
        id: "fine-1",
        member_id: "member-1",
        loan_id: "loan-1",
        amount: 25,
        reason: "5 day(s) overdue",
        status: "unpaid",
        created_at: "2025-05-20T00:00:00Z",
      },
      {
        id: "fine-2",
        member_id: "member-1",
        loan_id: "loan-2",
        amount: 10,
        reason: "2 day(s) overdue",
        status: "paid",
        created_at: "2025-05-10T00:00:00Z",
      },
    ];

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockFines, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useMyFines("member-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].amount).toBe(25);
  });

  it("does not fetch when memberId is empty", () => {
    const { result } = renderHook(() => useMyFines(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});

describe("useUnpaidFinesTotal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calculates total unpaid fines correctly", async () => {
    const mockFines = [{ amount: 25 }, { amount: 10 }, { amount: 15 }];

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: mockFines, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useUnpaidFinesTotal("member-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(50);
  });

  it("returns 0 when member has no unpaid fines", async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useUnpaidFinesTotal("member-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(0);
  });
});
