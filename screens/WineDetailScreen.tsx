import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RatingStars } from '../components/RatingStars';
import { useWines } from '../hooks/useWines';
import type { WineWithNote } from '../types';

type WineDetailScreenProps = {
  wineId: string;
  onBack: () => void;
};

export function WineDetailScreen({ wineId, onBack }: WineDetailScreenProps) {
  const { getWine, updateWineWithNote } = useWines();
  const [wine, setWine] = useState<WineWithNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRate = async (rating: number) => {
    if (!wine) return;

    const previous = wine;
    setError(null);
    setWine({
      ...wine,
      tasting_note: {
        id: wine.tasting_note?.id ?? '',
        wine_id: wine.id,
        tasted_at: wine.tasting_note?.tasted_at ?? new Date().toISOString(),
        ...wine.tasting_note,
        rating,
      },
    });

    try {
      const updated = await updateWineWithNote(
        wine.id,
        {},
        { rating },
        wine.tasting_note?.id,
      );
      setWine(updated);
    } catch (err) {
      setWine(previous);
      setError(err instanceof Error ? err.message : 'Failed to save rating');
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getWine(wineId);
        if (!cancelled) {
          setWine(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load wine');
          setWine(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [wineId, getWine]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator testID="wine-detail-loading" />
      </View>
    );
  }

  if (!wine) {
    return (
      <View style={styles.screen}>
        <View style={styles.content}>
          <Pressable onPress={onBack}>
            <Text style={styles.back}>← Journal</Text>
          </Pressable>
          <Text style={styles.error}>{error ?? 'Wine not found'}</Text>
        </View>
      </View>
    );
  }

  const meta = [wine.producer, wine.vintage, wine.region, wine.country]
    .filter(Boolean)
    .join(' · ');
  const note = wine.tasting_note;
  const hasWrittenNotes = Boolean(note?.aroma || note?.taste || note?.notes);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>← Journal</Text>
      </Pressable>

      <Text style={styles.title}>{wine.name}</Text>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      {wine.wine_type ? <Text style={styles.type}>{wine.wine_type}</Text> : null}
      {wine.barcode ? (
        <View>
          <Text style={styles.fieldLabel}>Barcode</Text>
          <Text style={styles.fieldValue}>{wine.barcode}</Text>
        </View>
      ) : null}

      {wine.photoUrl || wine.image_url ? (
        <Image
          source={{ uri: wine.photoUrl ?? wine.image_url }}
          style={styles.preview}
          resizeMode="cover"
          accessibilityLabel="Wine label"
        />
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <RatingStars rating={note?.rating ?? 0} onChange={handleRate} />

      {wine.grape_variety ? (
        <View>
          <Text style={styles.fieldLabel}>Grape</Text>
          <Text style={styles.fieldValue}>{wine.grape_variety}</Text>
        </View>
      ) : null}

      {wine.appellation ? (
        <View>
          <Text style={styles.fieldLabel}>Appellation</Text>
          <Text style={styles.fieldValue}>{wine.appellation}</Text>
        </View>
      ) : null}

      {wine.body ? (
        <View>
          <Text style={styles.fieldLabel}>Body</Text>
          <Text style={styles.fieldValue}>{wine.body}</Text>
        </View>
      ) : null}

      {wine.acidity ? (
        <View>
          <Text style={styles.fieldLabel}>Acidity</Text>
          <Text style={styles.fieldValue}>{wine.acidity}</Text>
        </View>
      ) : null}

      {wine.alcohol_content != null ? (
        <View>
          <Text style={styles.fieldLabel}>Alcohol</Text>
          <Text style={styles.fieldValue}>{wine.alcohol_content}%</Text>
        </View>
      ) : null}

      {wine.price != null ? (
        <View>
          <Text style={styles.fieldLabel}>Price</Text>
          <Text style={styles.fieldValue}>{String(wine.price)}</Text>
        </View>
      ) : null}

      {wine.average_rating != null ? (
        <View>
          <Text style={styles.fieldLabel}>Average rating</Text>
          <Text style={styles.fieldValue}>{String(wine.average_rating)}</Text>
        </View>
      ) : null}

      {wine.description ? (
        <View>
          <Text style={styles.fieldLabel}>Description</Text>
          <Text style={styles.fieldValue}>{wine.description}</Text>
        </View>
      ) : null}

      {hasWrittenNotes ? (
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Tasting notes</Text>
          {note?.aroma ? (
            <Text style={styles.fieldValue}>Aroma: {note.aroma}</Text>
          ) : null}
          {note?.taste ? (
            <Text style={styles.fieldValue}>Taste: {note.taste}</Text>
          ) : null}
          {note?.notes ? <Text style={styles.fieldValue}>{note.notes}</Text> : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f1ea',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f1ea',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 32,
    gap: 12,
  },
  back: {
    color: '#7b1e3a',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  meta: {
    color: '#666',
  },
  type: {
    color: '#7b1e3a',
    textTransform: 'capitalize',
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#e8dcd0',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  fieldValue: {
    fontSize: 16,
    marginTop: 4,
  },
  notes: {
    gap: 8,
    marginTop: 8,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  error: {
    color: '#b00020',
  },
});
