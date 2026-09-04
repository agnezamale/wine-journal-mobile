import { fireEvent, render, screen } from '@testing-library/react-native';
import { WineDetailScreen } from './WineDetailScreen';
import type { WineWithNote } from '../types';

const mockGetWine = jest.fn();
const mockUpdateWineWithNote = jest.fn();
const mockOnBack = jest.fn();

jest.mock('../hooks/useWines', () => ({
  useWines: () => ({
    getWine: mockGetWine,
    updateWineWithNote: mockUpdateWineWithNote,
    mutating: false,
  }),
}));

const sampleWine: WineWithNote = {
  id: 'w1',
  user_id: 'u1',
  name: 'Test Barolo',
  producer: 'Vietti',
  vintage: 2018,
  region: 'Piedmont',
  country: 'Italy',
  wine_type: 'red',
  grape_variety: 'Nebbiolo',
  price: 45,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
  tasting_note: {
    id: 'n1',
    wine_id: 'w1',
    rating: 4,
    aroma: 'Rose',
    taste: 'Cherry',
    notes: 'Needs time',
    tasted_at: '2026-01-01',
  },
};

describe('WineDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a spinner while the wine loads', () => {
    mockGetWine.mockReturnValue(new Promise(() => {}));
    render(<WineDetailScreen wineId="w1" onBack={mockOnBack} />);

    expect(screen.getByTestId('wine-detail-loading')).toBeOnTheScreen();
  });

  it('shows an error when loading fails', async () => {
    mockGetWine.mockRejectedValue(new Error('not found'));
    render(<WineDetailScreen wineId="w1" onBack={mockOnBack} />);

    expect(await screen.findByText('not found')).toBeOnTheScreen();
  });

  it('shows the wine after it loads', async () => {
    mockGetWine.mockResolvedValue(sampleWine);
    render(<WineDetailScreen wineId="w1" onBack={mockOnBack} />);

    expect(await screen.findByText('Test Barolo')).toBeOnTheScreen();
    expect(screen.getByText('Vietti · 2018 · Piedmont · Italy')).toBeOnTheScreen();
    expect(screen.getByText('red')).toBeOnTheScreen();
    expect(screen.getByText('Nebbiolo')).toBeOnTheScreen();
    expect(screen.getByText('Aroma: Rose')).toBeOnTheScreen();
    expect(screen.getByLabelText('4 stars')).toHaveTextContent('★');
    expect(screen.getByLabelText('5 stars')).toHaveTextContent('☆');
  });

  it('shows the barcode with the wine', async () => {
    mockGetWine.mockResolvedValue({
      ...sampleWine,
      barcode: '3274080005003',
    });
    render(<WineDetailScreen wineId="w1" onBack={mockOnBack} />);

    expect(await screen.findByText('Test Barolo')).toBeOnTheScreen();
    expect(screen.getByText('Barcode')).toBeOnTheScreen();
    expect(screen.getByText('3274080005003')).toBeOnTheScreen();
  });

  it('shows wineapi profile fields', async () => {
    mockGetWine.mockResolvedValue({
      ...sampleWine,
      appellation: 'Barolo DOCG',
      body: 'Full',
      acidity: 'High',
      alcohol_content: 14,
      average_rating: 4.5,
      description: 'Tar and roses',
    });
    render(<WineDetailScreen wineId="w1" onBack={mockOnBack} />);

    expect(await screen.findByText('Appellation')).toBeOnTheScreen();
    expect(screen.getByText('Barolo DOCG')).toBeOnTheScreen();
    expect(screen.getByText('Body')).toBeOnTheScreen();
    expect(screen.getByText('Full')).toBeOnTheScreen();
    expect(screen.getByText('Acidity')).toBeOnTheScreen();
    expect(screen.getByText('High')).toBeOnTheScreen();
    expect(screen.getByText('Alcohol')).toBeOnTheScreen();
    expect(screen.getByText('14%')).toBeOnTheScreen();
    expect(screen.getByText('Average rating')).toBeOnTheScreen();
    expect(screen.getByText('4.5')).toBeOnTheScreen();
    expect(screen.getByText('Description')).toBeOnTheScreen();
    expect(screen.getByText('Tar and roses')).toBeOnTheScreen();
  });

  it('shows the wine label photo', async () => {
    mockGetWine.mockResolvedValue({
      ...sampleWine,
      photoUrl: 'https://cdn.example/label.jpg',
    });
    render(<WineDetailScreen wineId="w1" onBack={mockOnBack} />);

    expect(await screen.findByLabelText('Wine label')).toBeOnTheScreen();
  });

  it('goes back from the header', async () => {
    mockGetWine.mockResolvedValue(sampleWine);
    render(<WineDetailScreen wineId="w1" onBack={mockOnBack} />);

    await screen.findByText('Test Barolo');
    fireEvent.press(screen.getByText('← Journal'));

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('saves a rating', async () => {
    mockGetWine.mockResolvedValue(sampleWine);
    let finishSave: (wine: WineWithNote) => void = () => {};
    mockUpdateWineWithNote.mockReturnValue(
      new Promise((resolve) => {
        finishSave = resolve;
      }),
    );
    render(<WineDetailScreen wineId="w1" onBack={mockOnBack} />);

    await screen.findByText('Test Barolo');
    fireEvent(screen.getByLabelText('5 stars'), 'pressIn');

    expect(screen.getByLabelText('5 stars')).toHaveTextContent('★');
    expect(mockUpdateWineWithNote).toHaveBeenCalledWith(
      'w1',
      {},
      { rating: 5 },
      'n1',
    );

    finishSave({
      ...sampleWine,
      tasting_note: { ...sampleWine.tasting_note!, rating: 5 },
    });
    expect(await screen.findByLabelText('5 stars')).toHaveTextContent('★');
  });
});
