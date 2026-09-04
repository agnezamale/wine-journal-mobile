import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useAuth } from './useAuth';

const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockUnsubscribe = jest.fn();

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  it('loads a saved session', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'u1', email: 'me@wine.test' },
        },
      },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user?.email).toBe('me@wine.test');
  });

  it('starts with no user when there is no session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
  });

  it('signs in with email and password', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockSignInWithPassword.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signIn('me@wine.test', 'secret12');
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'me@wine.test',
      password: 'secret12',
    });
  });

  it('passes username as user metadata on sign up', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockSignUp.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signUp('me@wine.test', 'secret12', '  agne  ');
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'me@wine.test',
      password: 'secret12',
      options: { data: { username: 'agne' } },
    });
  });

  it('unsubscribes on unmount', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const { unmount } = renderHook(() => useAuth());
    await waitFor(() => expect(mockOnAuthStateChange).toHaveBeenCalled());

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
