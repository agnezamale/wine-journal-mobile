import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
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

const mockGetCatalogWine = jest.fn();
const mockLookupBarcode = jest.fn();
const mockModernScan = {
  listener: undefined as ((event: { data: string }) => void) | undefined,
};

jest.mock('../lib/edgeFunctions', () => ({
  getCatalogWine: (...args: unknown[]) => mockGetCatalogWine(...args),
  lookupBarcode: (...args: unknown[]) => mockLookupBarcode(...args),
}));

jest.mock('expo-camera', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  function CameraView(props: { onBarcodeScanned?: (event: { data: string; type: string }) => void }) {
    return React.createElement(
      Pressable,
      {
        testID: 'barcode-camera',
        onPress: () => props.onBarcodeScanned?.({ data: '3274080005003', type: 'ean13' }),
      },
      React.createElement(Text, null, 'camera'),
    );
  }
  CameraView.isModernBarcodeScannerAvailable = true;
  CameraView.launchScanner = jest.fn(async () => {});
  CameraView.dismissScanner = jest.fn(async () => {});
  CameraView.onModernBarcodeScanned = jest.fn((listener: (event: { data: string }) => void) => {
    mockModernScan.listener = listener;
    return { remove: jest.fn() };
  });
  return {
    CameraView,
    Camera: {
      requestCameraPermissionsAsync: jest.fn(),
    },
  };
});

import * as ImagePicker from 'expo-image-picker';
import { Camera, CameraView } from 'expo-camera';

const nauMai: CatalogWine = {
  external_id: '1',
  external_source: 'wineapi.io',
  name: 'Sauvignon Blanc',
  producer: 'Nau Mai',
  region: 'Marlborough',
};

const offWine: CatalogWine = {
  external_id: '3274080005003',
  external_source: 'openfoodfacts',
  name: 'Nau Mai Sauvignon Blanc',
  producer: 'Nau Mai',
  country: 'New Zealand',
  wine_type: 'white',
};

function renderScreen() {
  return render(<AddWineScreen onSaved={mockOnSaved} />);
}

async function scanModernBarcode(data = '3274080005003') {
  fireEvent.press(screen.getByText('Scan barcode'));
  await waitFor(() => {
    expect(CameraView.launchScanner).toHaveBeenCalled();
  });
  const listener = mockModernScan.listener;
  expect(listener).toBeDefined();
  await act(async () => {
    listener?.({ data });
  });
}

describe('AddWineScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockModernScan.listener = undefined;
    mockSearch = {
      query: '',
      setQuery: jest.fn(),
      results: [],
      loading: false,
      error: null,
    };
    mockCreateWine.mockResolvedValue({ id: 'w1', name: 'Sauvignon Blanc' });
    mockGetCatalogWine.mockResolvedValue({ result: nauMai });
    mockLookupBarcode.mockResolvedValue({ result: offWine });
    CameraView.isModernBarcodeScannerAvailable = true;
    jest.mocked(Camera.requestCameraPermissionsAsync).mockResolvedValue({
      granted: true,
    } as Awaited<ReturnType<typeof Camera.requestCameraPermissionsAsync>>);
  });

  it('shows scan and manual add actions', () => {
    renderScreen();

    expect(screen.getByText('Add wine')).toBeOnTheScreen();
    expect(screen.getByText('Scan barcode')).toBeOnTheScreen();
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
    await waitFor(() => {
      expect(mockGetCatalogWine).toHaveBeenCalledWith('1');
    });
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
        price: null,
        external_id: '1',
        external_source: 'wineapi.io',
        description: null,
        alcohol_content: null,
        average_rating: null,
        body: null,
        acidity: null,
        appellation: null,
        image_url: null,
      }, null);
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
      expect(mockCreateWine).toHaveBeenCalledWith({ name: 'Maori Bay' }, null);
    });
    expect(mockOnSaved).toHaveBeenCalled();
  });

  it('asks for a name when adding manually with an empty query', () => {
    renderScreen();
    fireEvent.press(screen.getByText('Add manually'));

    expect(screen.getByText('Select a match or type a name.')).toBeOnTheScreen();
    expect(mockCreateWine).not.toHaveBeenCalled();
  });

  it('saves the photo with the wine', async () => {
    jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({
      granted: true,
    } as ImagePicker.PermissionResponse);
    jest.mocked(ImagePicker.launchCameraAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///label.jpg' }],
    } as ImagePicker.ImagePickerResult);
    mockSearch = {
      ...mockSearch,
      query: 'Maori Bay',
      results: [],
    };

    renderScreen();
    fireEvent.press(screen.getByText('Scan label'));
    await screen.findByLabelText('Wine label preview');
    fireEvent.press(screen.getByText('Add to journal'));

    await waitFor(() => {
      expect(mockCreateWine).toHaveBeenCalledWith({ name: 'Maori Bay' }, 'file:///label.jpg');
    });
    expect(mockOnSaved).toHaveBeenCalled();
  });

  it('marks a catalog result as selected', async () => {
    mockSearch = {
      ...mockSearch,
      query: 'nau mai',
      results: [nauMai],
    };

    renderScreen();
    fireEvent.press(screen.getByText('Sauvignon Blanc'));

    expect(screen.getByText('Selected: Sauvignon Blanc')).toBeOnTheScreen();
    await waitFor(() => {
      expect(mockGetCatalogWine).toHaveBeenCalledWith('1');
    });
  });

  it('looks up a scanned barcode and shows the product', async () => {
    renderScreen();
    await scanModernBarcode();

    expect(await screen.findByText('Nau Mai Sauvignon Blanc · 3274080005003')).toBeOnTheScreen();
    expect(screen.getByText('Selected: Nau Mai Sauvignon Blanc')).toBeOnTheScreen();
    expect(mockLookupBarcode).toHaveBeenCalledWith('3274080005003');
    expect(mockSearch.setQuery).toHaveBeenCalledWith('Nau Mai');
  });

  it('saves the barcode with a selected product', async () => {
    renderScreen();
    await scanModernBarcode();

    await screen.findByText('Selected: Nau Mai Sauvignon Blanc');
    fireEvent.press(screen.getByText('Add to journal'));

    await waitFor(() => {
      expect(mockCreateWine).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Nau Mai Sauvignon Blanc',
          producer: 'Nau Mai',
          external_source: 'openfoodfacts',
          barcode: '3274080005003',
        }),
        null,
      );
    });
    expect(mockGetCatalogWine).not.toHaveBeenCalled();
    expect(mockOnSaved).toHaveBeenCalled();
  });

  it('shows an error when barcode permission is denied', async () => {
    jest.mocked(Camera.requestCameraPermissionsAsync).mockResolvedValue({
      granted: false,
    } as Awaited<ReturnType<typeof Camera.requestCameraPermissionsAsync>>);

    renderScreen();
    fireEvent.press(screen.getByText('Scan barcode'));

    expect(
      await screen.findByText('Camera permission is required to scan a barcode.'),
    ).toBeOnTheScreen();
  });

  it('opens an in-app scanner when the system scanner is unavailable', async () => {
    CameraView.isModernBarcodeScannerAvailable = false;
    renderScreen();
    fireEvent.press(screen.getByText('Scan barcode'));

    expect(await screen.findByTestId('barcode-scanner')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('barcode-camera'));

    expect(await screen.findByText('Nau Mai Sauvignon Blanc · 3274080005003')).toBeOnTheScreen();
  });

  it('asks to type a name when the barcode is unknown', async () => {
    mockLookupBarcode.mockResolvedValue({ result: null });
    renderScreen();
    await scanModernBarcode();

    expect(
      await screen.findByText('No product for barcode 3274080005003. Type the name from the label.'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Barcode 3274080005003')).toBeOnTheScreen();
  });

  it('uses a known GTIN when Open Food Facts has no product', async () => {
    mockLookupBarcode.mockResolvedValue({ result: null });
    renderScreen();
    await scanModernBarcode('9420073800146');

    expect(await screen.findByText('Nau Mai Sauvignon Blanc · 9420073800146')).toBeOnTheScreen();
    expect(screen.getByText('Selected: Nau Mai Sauvignon Blanc')).toBeOnTheScreen();
    expect(mockSearch.setQuery).toHaveBeenCalledWith('Nau Mai');
    expect(mockGetCatalogWine).not.toHaveBeenCalled();
  });
});
