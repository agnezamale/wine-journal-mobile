import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { WINE_BARCODE_TYPES } from '../lib/barcode';

type BarcodeScannerOverlayProps = {
  onScanned: (barcode: string) => void;
  onClose: () => void;
};

export function BarcodeScannerOverlay({ onScanned, onClose }: BarcodeScannerOverlayProps) {
  return (
    <View style={styles.overlay} testID="barcode-scanner">
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: WINE_BARCODE_TYPES }}
        onBarcodeScanned={({ data }) => onScanned(data)}
      />
      <View style={styles.topBar} pointerEvents="box-none">
        <Pressable onPress={onClose} accessibilityLabel="Close barcode scanner">
          <Text style={styles.close}>Close</Text>
        </Pressable>
        <Text style={styles.hint}>Point at the barcode on the bottle</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 20,
  },
  topBar: {
    paddingTop: 56,
    paddingHorizontal: 24,
    gap: 12,
  },
  close: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  hint: {
    color: '#fff',
    fontWeight: '600',
  },
});
