import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export function AddWineScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const takePhoto = async() => {
    setError(null);
    
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if(!permission.granted){
      setError('Camera permission is required to scan a label.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if(result.canceled) return;

    const uri = result.assets[0]?.uri;
    if(uri) setPhotoUri(uri);
  }
  
  const pickFromLibrary = async() => {
    setError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(!permission.granted){
      setError('Photo library permission is required to choose a label');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if(result.canceled) return;

    const uri = result.assets[0]?.uri;
    if(uri) setPhotoUri(uri);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Add wine</Text>
      <Text style={styles.subtitle}>
        Scan a label, or type the bottle in yourself.
      </Text>

      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={styles.preview}
          accessibilityLabel="Wine label preview"
        />
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.card} onPress={takePhoto}>
        <Text style={styles.cardTitle}>Scan label</Text>
        <Text style={styles.cardBody}>Take a photo of the bottle</Text>
      </Pressable>
      
      <Pressable onPress={pickFromLibrary}>
        <Text style={styles.link}>Choose from library</Text>
      </Pressable>

      <Pressable style={styles.card}>
        <Text style={styles.cardTitle}>Add manually</Text>
        <Text style={styles.cardBody}>Name, producer, vintage, notes</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f1ea',
    paddingHorizontal: 24,
    paddingTop: 56,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#666',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardBody: {
    color: '#666',
    marginTop: 4,
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#e8dcd0',
  },
  link: {
    color: '#7b1e3a',
    fontWeight: '600',
    textAlign: 'center',
  },
  error: {
    color: '#b00020',
  },
});