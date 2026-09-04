import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { LoginScreen } from './LoginScreen';

const mockSignIn = jest.fn();

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

describe('LoginScreen', () => {
  const onGoToSignUp = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows email and password fields only', () => {
    render(<LoginScreen onGoToSignUp={onGoToSignUp} />);

    expect(screen.getByPlaceholderText('you@example.com')).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('Password')).toBeOnTheScreen();
    expect(screen.queryByPlaceholderText('yourname')).toBeNull();
    expect(screen.getByText('Sign in')).toBeOnTheScreen();
  });

  it('requires email and password before signing in', () => {
    render(<LoginScreen onGoToSignUp={onGoToSignUp} />);

    fireEvent.press(screen.getByText('Sign in'));

    expect(screen.getByText('Email and password are required.')).toBeOnTheScreen();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('signs in with trimmed email and password', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginScreen onGoToSignUp={onGoToSignUp} />);

    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), '  me@wine.test  ');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'secret12');
    fireEvent.press(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('me@wine.test', 'secret12');
    });
  });

  it('shows an error from sign in', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid login credentials' } });
    render(<LoginScreen onGoToSignUp={onGoToSignUp} />);

    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'me@wine.test');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'wrong');
    fireEvent.press(screen.getByText('Sign in'));

    expect(await screen.findByText('Invalid login credentials')).toBeOnTheScreen();
  });

  it('goes to sign up when the link is pressed', () => {
    render(<LoginScreen onGoToSignUp={onGoToSignUp} />);

    fireEvent.press(screen.getByText("Don't have an account? Sign up"));

    expect(onGoToSignUp).toHaveBeenCalled();
  });
});
