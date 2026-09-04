import { fireEvent, render, screen } from '@testing-library/react-native';
import type { User } from '@supabase/supabase-js';
import { JournalScreen } from './JournalScreen';
import type { WineWithNote } from '../types';

const mockSignOut = jest.fn();
const mockFetchWines = jest.fn();

let mockAuth: {
  user: Partial<User> | null;
  signOut: typeof mockSignOut;
};

let mockWines: {
  wines: WineWithNote[];
  loading: boolean;
  error: string | null;
  fetchWines: typeof mockFetchWines;
};

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}));

jest.mock('../hooks/useWines', () => ({
  useWines: () => mockWines,
}));

const sampleWine: WineWithNote = {
  id: 'w1',
  user_id: 'u1',
  name: 'Test Barolo',
  producer: 'Vietti',
  vintage: 2018,
  region: 'Piedmont',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  tasting_note: {
    id: 'n1',
    wine_id: 'w1',
    rating: 5,
    tasted_at: '2026-01-01',
  },
};

describe('JournalScreen', () => {
  const onAddWine = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth = {
      user: {
        email: 'me@wine.test',
        user_metadata: { username: 'agne' },
      },
      signOut: mockSignOut,
    };
    mockWines = {
      wines: [],
      loading: false,
      error: null,
      fetchWines: mockFetchWines,
    };
  });

  it('shows a spinner while wines are loading', () => {
    mockWines.loading = true;
    render(<JournalScreen onAddWine={onAddWine} />);

    expect(screen.getByTestId('journal-loading')).toBeOnTheScreen();
  });

  it('shows an error and retries', () => {
    mockWines.error = 'permission denied';
    render(<JournalScreen onAddWine={onAddWine} />);

    expect(screen.getByText('permission denied')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Try again'));
    expect(mockFetchWines).toHaveBeenCalled();
  });

  it('shows the empty state and opens scan', () => {
    render(<JournalScreen onAddWine={onAddWine} />);

    expect(screen.getByText('No wines yet')).toBeOnTheScreen();
    expect(screen.getByText('Hi, agne')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Scan a label'));
    expect(onAddWine).toHaveBeenCalled();
  });

  it('lists wines from the journal', () => {
    mockWines.wines = [sampleWine];
    render(<JournalScreen onAddWine={onAddWine} />);

    expect(screen.getByText('Test Barolo')).toBeOnTheScreen();
    expect(screen.getByText('Vietti · 2018 · Piedmont')).toBeOnTheScreen();
    expect(screen.getByText('★★★★★')).toBeOnTheScreen();
    expect(screen.queryByText('No wines yet')).toBeNull();
  });

  it('signs out from the header', () => {
    render(<JournalScreen onAddWine={onAddWine} />);

    fireEvent.press(screen.getByText('Sign out'));
    expect(mockSignOut).toHaveBeenCalled();
  });
});
