import { fireEvent, render, screen } from '@testing-library/react-native';
import { BarcodeScannerOverlay } from './BarcodeScannerOverlay';

jest.mock('expo-camera', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  function CameraView(props: { onBarcodeScanned?: (event: { data: string }) => void }) {
    return React.createElement(
      Pressable,
      {
        testID: 'barcode-camera',
        onPress: () => props.onBarcodeScanned?.({ data: '3274080005003' }),
      },
      React.createElement(Text, null, 'camera'),
    );
  }
  return { CameraView };
});

describe('BarcodeScannerOverlay', () => {
  it('reports a scanned barcode', () => {
    const onScanned = jest.fn();
    render(<BarcodeScannerOverlay onScanned={onScanned} onClose={jest.fn()} />);

    fireEvent.press(screen.getByTestId('barcode-camera'));

    expect(onScanned).toHaveBeenCalledWith('3274080005003');
  });

  it('closes from the header', () => {
    const onClose = jest.fn();
    render(<BarcodeScannerOverlay onScanned={jest.fn()} onClose={onClose} />);

    fireEvent.press(screen.getByLabelText('Close barcode scanner'));

    expect(onClose).toHaveBeenCalled();
  });
});
