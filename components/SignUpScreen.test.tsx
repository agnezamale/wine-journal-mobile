import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SignUpScreen } from './SignUpScreen';

const mockSignUp = jest.fn();

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
  }),
}));

describe('SignUpScreen', () => {
  const onGoToSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('includes a username field', () => {
    render(<SignUpScreen onGoToSignIn={onGoToSignIn} />);

    expect(screen.getByPlaceholderText('yourname')).toBeOnTheScreen();
    expect(screen.getByText('Sign up')).toBeOnTheScreen();
  });

  it('requires username, email, and password', () => {
    render(<SignUpScreen onGoToSignIn={onGoToSignIn} />);

    fireEvent.press(screen.getByText('Sign up'));

    expect(screen.getByText('Username, email, and password are required.')).toBeOnTheScreen();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('rejects passwords shorter than 6 characters', () => {
    render(<SignUpScreen onGoToSignIn={onGoToSignIn} />);

    fireEvent.changeText(screen.getByPlaceholderText('yourname'), 'agne');
    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'agne@wine.test');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), '123');
    fireEvent.press(screen.getByText('Sign up'));

    expect(screen.getByText('Password must be at least 6 characters.')).toBeOnTheScreen();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('signs up with username in user metadata', async () => {
    mockSignUp.mockResolvedValue({ error: null });
    render(<SignUpScreen onGoToSignIn={onGoToSignIn} />);

    fireEvent.changeText(screen.getByPlaceholderText('yourname'), '  agne  ');
    fireEvent.changeText(screen.getByPlaceholderText('you@example.com'), 'agne@wine.test');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'secret12');
    fireEvent.press(screen.getByText('Sign up'));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('agne@wine.test', 'secret12', 'agne');
    });
    expect(
      await screen.findByText(
        'Check your email to confirm, or go back and sign in if confirmations are off.',
      ),
    ).toBeOnTheScreen();
  });

  it('goes back to sign in', () => {
    render(<SignUpScreen onGoToSignIn={onGoToSignIn} />);

    fireEvent.press(screen.getByText('Already have an account? Sign in'));

    expect(onGoToSignIn).toHaveBeenCalled();
  });
});
