import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useBooks, useBookById } from "../use-books";
import { supabase } from "../../lib/supabase";

// Mock Supabase client
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

describe("useBooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches all books when no search query is provided", async () => {
    const mockBooks = [
      {
        id: "1",
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "978-0132350884",
        available_copies: 3,
        total_copies: 5,
        cover_url: null,
      },
      {
        id: "2",
        title: "The Pragmatic Programmer",
        author: "David Thomas",
        isbn: "978-0135957059",
        available_copies: 1,
        total_copies: 2,
        cover_url: null,
      },
    ];

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockBooks, error: null }),
      }),
    });

    const { result } = renderHook(() => useBooks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].title).toBe("Clean Code");
    expect(mockFrom).toHaveBeenCalledWith("books");
  });

  it("filters books by search query", async () => {
    const mockBooks = [
      {
        id: "1",
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "978-0132350884",
        available_copies: 3,
        total_copies: 5,
        cover_url: null,
      },
    ];

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          or: jest.fn().mockResolvedValue({ data: mockBooks, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useBooks("Clean"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].title).toBe("Clean Code");
  });

  it("handles Supabase errors gracefully", async () => {
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest
          .fn()
          .mockResolvedValue({
            data: null,
            error: { message: "Network error" },
          }),
      }),
    });

    const { result } = renderHook(() => useBooks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});

describe("useBookById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches a single book by ID", async () => {
    const mockBook = {
      id: "1",
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "978-0132350884",
      available_copies: 3,
      total_copies: 5,
      cover_url: null,
    };

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockBook, error: null }),
        }),
      }),
    });

    const { result } = renderHook(() => useBookById("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.title).toBe("Clean Code");
  });

  it("does not fetch when bookId is empty", () => {
    const { result } = renderHook(() => useBookById(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
  });
});
