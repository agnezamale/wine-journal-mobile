import { fireEvent, render, screen } from '@testing-library/react-native';
import App from './App';
import type { WineWithNote } from './types';

const mockUseAuth = jest.fn();
const mockGetWine = jest.fn();

let mockWines: WineWithNote[] = [];

jest.mock('./hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('./hooks/useWines', () => ({
  useWines: () => ({
    wines: mockWines,
    loading: false,
    error: null,
    fetchWines: jest.fn(),
    createWine: jest.fn(),
    getWine: mockGetWine,
    updateWineWithNote: jest.fn(),
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

jest.mock('./lib/edgeFunctions', () => ({
  getCatalogWine: jest.fn(async () => ({ result: null })),
  searchWines: jest.fn(),
  lookupBarcode: jest.fn(async () => ({ result: null })),
}));

jest.mock('expo-camera', () => {
  const CameraView = () => null;
  CameraView.isModernBarcodeScannerAvailable = false;
  CameraView.launchScanner = jest.fn();
  CameraView.dismissScanner = jest.fn();
  CameraView.onModernBarcodeScanned = jest.fn(() => ({ remove: jest.fn() }));
  return {
    CameraView,
    Camera: {
      requestCameraPermissionsAsync: jest.fn(),
    },
  };
});

const sampleWine: WineWithNote = {
  id: 'w1',
  user_id: 'u1',
  name: 'Test Barolo',
  producer: 'Vietti',
  vintage: 2018,
  region: 'Piedmont',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

function signIn() {
  mockUseAuth.mockReturnValue({
    user: {
      email: 'me@wine.test',
      user_metadata: { username: 'agne' },
    },
    loading: false,
    signOut: jest.fn(),
  });
}

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWines = [];
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

  it('opens wine detail from the journal', async () => {
    mockWines = [sampleWine];
    mockGetWine.mockResolvedValue(sampleWine);
    signIn();
    render(<App />);

    fireEvent.press(screen.getByText('Test Barolo'));

    expect(await screen.findByText('← Journal')).toBeOnTheScreen();
    expect(screen.getByText('Vietti · 2018 · Piedmont')).toBeOnTheScreen();
    expect(screen.queryByText('Scan')).toBeNull();
  });
});
