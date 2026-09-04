import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useWineSearch } from '../hooks/useWineSearch';
import { useWines } from '../hooks/useWines';
import { catalogToWineInput, visibleCatalogResults } from '../lib/catalogMatch';
import type { CatalogWine } from '../types';

type AddWineScreenProps = {
  onSaved: () => void;
};

export function AddWineScreen({ onSaved }: AddWineScreenProps) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CatalogWine | null>(null);
  const [showAllResults, setShowAllResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const { query, setQuery, results, loading, error: searchError } = useWineSearch();
  const { visible, hiddenCount } = visibleCatalogResults(results, query, showAllResults);
  const { createWine } = useWines();

  const takePhoto = async () => {
    setError(null);

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Camera permission is required to scan a label.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0]?.uri;
    if (uri) setPhotoUri(uri);
  };

  const pickFromLibrary = async () => {
    setError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library permission is required to choose a label');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0]?.uri;
    if (uri) setPhotoUri(uri);
  };

  const handleAddToJournal = async () => {
    setError(null);

    const input = selected
      ? catalogToWineInput(selected)
      : { name: query.trim() };

    if (!input.name) {
      setError('Select a match or type a name.');
      return;
    }

    setSaving(true);
    try {
      await createWine(input);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add wine');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add wine</Text>
        <Text style={styles.subtitle}>
          Type the name from the label, or take a photo first.
        </Text>

        <View style={styles.search}>
          <Text style={styles.label}>What does the label say?</Text>
          <TextInput
            style={styles.input}
            placeholder="Name, producer, or region"
            value={query}
            onChangeText={(text) => {
              setSelected(null);
              setShowAllResults(false);
              setQuery(text);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            textContentType="none"
          />

          {loading ? <Text>Searching…</Text> : null}
          {searchError ? <Text style={styles.error}>{searchError}</Text> : null}

          {visible.map((wine) => {
            const meta = [wine.producer, wine.vintage, wine.region]
              .filter(Boolean)
              .join(' · ');
            const isSelected = selected?.external_id === wine.external_id;

            return (
              <Pressable
                key={wine.external_id}
                style={[styles.result, isSelected && styles.resultSelected]}
                onPress={() => setSelected(wine)}
              >
                <Text style={styles.resultName}>{wine.name}</Text>
                {meta ? <Text style={styles.resultMeta}>{meta}</Text> : null}
              </Pressable>
            );
          })}

          {hiddenCount > 0 ? (
            <Pressable onPress={() => setShowAllResults(true)}>
              <Text style={styles.link}>Show {hiddenCount} more</Text>
            </Pressable>
          ) : null}

          {selected ? (
            <Text style={styles.selected}>Selected: {selected.name}</Text>
          ) : null}

          {(selected || query.trim().length >= 2) ? (
            <Pressable
              style={[styles.card, styles.saveButton]}
              onPress={handleAddToJournal}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.saveTitle}>Add to journal</Text>
                  <Text style={styles.saveBody}>
                    {selected
                      ? selected.name
                      : `Save “${query.trim()}” without a catalog match`}
                  </Text>
                </>
              )}
            </Pressable>
          ) : null}
        </View>

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

        <Pressable style={styles.card} onPress={handleAddToJournal} disabled={saving}>
          <Text style={styles.cardTitle}>Add manually</Text>
          <Text style={styles.cardBody}>Name, producer, vintage, notes</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f1ea',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
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
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#e8dcd0',
  },
  search: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  result: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  resultSelected: {
    borderColor: '#7b1e3a',
  },
  resultName: {
    fontWeight: '700',
  },
  resultMeta: {
    color: '#666',
    marginTop: 4,
  },
  selected: {
    color: '#7b1e3a',
    fontWeight: '600',
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
  saveButton: {
    backgroundColor: '#7b1e3a',
  },
  saveTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  saveBody: {
    color: '#f3e6ea',
    marginTop: 4,
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
