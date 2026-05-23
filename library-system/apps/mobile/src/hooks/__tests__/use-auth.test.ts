import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useAuth } from "../use-auth";
import { supabase } from "../../lib/supabase";

const mockUnsubscribe = jest.fn();

jest.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

const mockGetSession = supabase.auth.getSession as jest.Mock;
const mockOnAuthStateChange = supabase.auth.onAuthStateChange as jest.Mock;

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  it("starts in loading state", () => {
    mockGetSession.mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it("resolves with session data when user is logged in", async () => {
    const mockSession = {
      user: { id: "user-1", email: "student@school.edu" },
      access_token: "token-123",
    };

    mockGetSession.mockResolvedValue({ data: { session: mockSession } });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.session).toEqual(mockSession);
    expect(result.current.user?.id).toBe("user-1");
  });

  it("resolves with null when no user is logged in", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it("subscribes to auth state changes", () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    renderHook(() => useAuth());

    expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes on unmount", () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const { unmount } = renderHook(() => useAuth());
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
