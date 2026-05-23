import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useActiveSessions, useRecordAttendance } from "../use-attendance";
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

describe("useActiveSessions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches currently active attendance sessions", async () => {
    const mockSessions = [
      {
        id: "session-1",
        name: "Morning Reading",
        starts_at: "2025-05-20T08:00:00Z",
        ends_at: "2025-05-20T12:00:00Z",
        is_active: true,
      },
    ];

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lte: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            eq: jest
              .fn()
              .mockResolvedValue({ data: mockSessions, error: null }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useActiveSessions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].name).toBe("Morning Reading");
    expect(mockFrom).toHaveBeenCalledWith("attendance_sessions");
  });

  it("returns empty array when no sessions are active", async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lte: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useActiveSessions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(0);
  });

  it("handles database errors", async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lte: jest.fn().mockReturnValue({
          gte: jest.fn().mockReturnValue({
            eq: jest
              .fn()
              .mockResolvedValue({
                data: null,
                error: { message: "Connection refused" },
              }),
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useActiveSessions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useRecordAttendance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("inserts an attendance record on successful scan", async () => {
    const mockRecord = {
      id: "record-1",
      member_id: "member-1",
      session_id: "session-1",
      scanned_at: "2025-05-20T09:15:00Z",
    };

    mockFrom.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest
            .fn()
            .mockResolvedValue({ data: mockRecord, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useRecordAttendance(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ memberId: "member-1", sessionId: "session-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockRecord);
    expect(mockFrom).toHaveBeenCalledWith("attendance_records");
  });

  it("handles duplicate attendance error", async () => {
    mockFrom.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: {
              message: "duplicate key value violates unique constraint",
              code: "23505",
            },
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useRecordAttendance(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ memberId: "member-1", sessionId: "session-1" });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
