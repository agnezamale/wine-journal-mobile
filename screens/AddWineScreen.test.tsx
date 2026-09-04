import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AddWineScreen } from './AddWineScreen';
import type { CatalogWine } from '../types';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const mockCreateWine = jest.fn();
const mockOnSaved = jest.fn();

let mockSearch: {
  query: string;
  setQuery: jest.Mock;
  results: CatalogWine[];
  loading: boolean;
  error: string | null;
};

jest.mock('../hooks/useWineSearch', () => ({
  useWineSearch: () => mockSearch,
}));

jest.mock('../hooks/useWines', () => ({
  useWines: () => ({
    createWine: mockCreateWine,
    mutating: false,
  }),
}));

import * as ImagePicker from 'expo-image-picker';

const nauMai: CatalogWine = {
  external_id: '1',
  external_source: 'wineapi.io',
  name: 'Sauvignon Blanc',
  producer: 'Nau Mai',
  region: 'Marlborough',
};

function renderScreen() {
  return render(<AddWineScreen onSaved={mockOnSaved} />);
}

describe('AddWineScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearch = {
      query: '',
      setQuery: jest.fn(),
      results: [],
      loading: false,
      error: null,
    };
    mockCreateWine.mockResolvedValue({ id: 'w1', name: 'Sauvignon Blanc' });
  });

  it('shows scan and manual add actions', () => {
    renderScreen();

    expect(screen.getByText('Add wine')).toBeOnTheScreen();
    expect(screen.getByText('Scan label')).toBeOnTheScreen();
    expect(screen.getByText('Add manually')).toBeOnTheScreen();
  });

  it('shows catalog search without a photo', () => {
    renderScreen();

    expect(screen.getByPlaceholderText('Name, producer, or region')).toBeOnTheScreen();
  });

  it('shows a preview after taking a photo', async () => {
    jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({
      granted: true,
    } as ImagePicker.PermissionResponse);
    jest.mocked(ImagePicker.launchCameraAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///label.jpg' }],
    } as ImagePicker.ImagePickerResult);

    renderScreen();
    fireEvent.press(screen.getByText('Scan label'));

    expect(await screen.findByLabelText('Wine label preview')).toBeOnTheScreen();
  });

  it('shows catalog search after a photo is taken', async () => {
    jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({
      granted: true,
    } as ImagePicker.PermissionResponse);
    jest.mocked(ImagePicker.launchCameraAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///label.jpg' }],
    } as ImagePicker.ImagePickerResult);

    renderScreen();
    fireEvent.press(screen.getByText('Scan label'));

    expect(
      await screen.findByPlaceholderText('Name, producer, or region'),
    ).toBeOnTheScreen();
  });

  it('shows an error when camera permission is denied', async () => {
    jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({
      granted: false,
    } as ImagePicker.PermissionResponse);

    renderScreen();
    fireEvent.press(screen.getByText('Scan label'));

    expect(
      await screen.findByText('Camera permission is required to scan a label.'),
    ).toBeOnTheScreen();
  });

  it('saves a selected catalog wine to the journal', async () => {
    mockSearch = {
      ...mockSearch,
      query: 'nau mai',
      results: [nauMai],
    };

    renderScreen();
    fireEvent.press(screen.getByText('Sauvignon Blanc'));
    fireEvent.press(screen.getByText('Add to journal'));

    await waitFor(() => {
      expect(mockCreateWine).toHaveBeenCalledWith({
        name: 'Sauvignon Blanc',
        producer: 'Nau Mai',
        vintage: null,
        region: 'Marlborough',
        country: null,
        grape_variety: null,
        wine_type: null,
        external_id: '1',
        external_source: 'wineapi.io',
      });
    });
    expect(mockOnSaved).toHaveBeenCalled();
  });

  it('saves a typed name without a catalog match', async () => {
    mockSearch = {
      ...mockSearch,
      query: 'Maori Bay',
      results: [],
    };

    renderScreen();
    fireEvent.press(screen.getByText('Add to journal'));

    await waitFor(() => {
      expect(mockCreateWine).toHaveBeenCalledWith({ name: 'Maori Bay' });
    });
    expect(mockOnSaved).toHaveBeenCalled();
  });

  it('asks for a name when adding manually with an empty query', () => {
    renderScreen();
    fireEvent.press(screen.getByText('Add manually'));

    expect(screen.getByText('Select a match or type a name.')).toBeOnTheScreen();
    expect(mockCreateWine).not.toHaveBeenCalled();
  });
});
