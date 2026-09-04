import { fireEvent, render, screen } from '@testing-library/react-native';
import App from './App';

const mockUseAuth = jest.fn();

jest.mock('./hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('./hooks/useWines', () => ({
  useWines: () => ({
    wines: [],
    loading: false,
    error: null,
    fetchWines: jest.fn(),
    createWine: jest.fn(),
  }),
}));

jest.mock('./hooks/useWineSearch', () => ({
  useWineSearch: () => ({
    query: '',
    setQuery: jest.fn(),
    results: [],
    loading: false,
    error: null,
  }),
}));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a spinner while the session loads', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    render(<App />);

    expect(screen.getByTestId('app-loading')).toBeOnTheScreen();
  });

  it('shows login when there is no user', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
    });
    render(<App />);

    expect(screen.getByText('Sign in with your email')).toBeOnTheScreen();
    expect(screen.queryByText('journal')).toBeNull();
  });

  it('switches to sign up from login', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
    });
    render(<App />);

    fireEvent.press(screen.getByText("Don't have an account? Sign up"));

    expect(screen.getByText('Create account')).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('yourname')).toBeOnTheScreen();
  });

  it('shows the journal tabs when signed in', () => {
    mockUseAuth.mockReturnValue({
      user: {
        email: 'me@wine.test',
        user_metadata: { username: 'agne' },
      },
      loading: false,
      signOut: jest.fn(),
    });
    render(<App />);

    expect(screen.getByText('Journal')).toBeOnTheScreen();
    expect(screen.getByText('Scan')).toBeOnTheScreen();
    expect(screen.getByText('Discover')).toBeOnTheScreen();
    expect(screen.getByText('No wines yet')).toBeOnTheScreen();
  });

  it('opens the scan tab from the journal empty state', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'me@wine.test', user_metadata: {} },
      loading: false,
      signOut: jest.fn(),
    });
    render(<App />);

    fireEvent.press(screen.getByText('Scan a label'));

    expect(screen.getByText('Add wine')).toBeOnTheScreen();
    expect(screen.getByText('Scan label')).toBeOnTheScreen();
  });
});
