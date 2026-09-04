import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AddWineScreen } from './AddWineScreen';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

import * as ImagePicker from 'expo-image-picker';

describe('AddWineScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows scan and manual add actions', () => {
    render(<AddWineScreen />);

    expect(screen.getByText('Add wine')).toBeOnTheScreen();
    expect(screen.getByText('Scan label')).toBeOnTheScreen();
    expect(screen.getByText('Add manually')).toBeOnTheScreen();
  });

  it('shows a preview after taking a photo', async () => {
    jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({
      granted: true,
    } as ImagePicker.PermissionResponse);
    jest.mocked(ImagePicker.launchCameraAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///label.jpg' }],
    } as ImagePicker.ImagePickerResult);

    render(<AddWineScreen />);
    fireEvent.press(screen.getByText('Scan label'));

    expect(await screen.findByLabelText('Wine label preview')).toBeOnTheScreen();
  });

  it('shows an error when camera permission is denied', async () => {
    jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({
      granted: false,
    } as ImagePicker.PermissionResponse);

    render(<AddWineScreen />);
    fireEvent.press(screen.getByText('Scan label'));

    expect(
      await screen.findByText('Camera permission is required to scan a label.'),
    ).toBeOnTheScreen();
  });
});