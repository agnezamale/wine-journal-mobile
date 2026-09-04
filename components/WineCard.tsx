import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Wine } from '../types';

type WineCardProps = {
  wine: Wine;
  rating?: number;
  photoUrl?: string | null;
  onPress?: () => void;
  onRemove?: () => void;
};

export function WineCard({ wine, rating, photoUrl, onPress, onRemove }: WineCardProps) {
  const meta = [wine.producer, wine.vintage, wine.region, wine.country]
    .filter(Boolean)
    .join(' · ');

  const info = (
    <>
      <Text style={styles.title}>{wine.name}</Text>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      {wine.wine_type ? (
        <Text style={styles.type}>{wine.wine_type}</Text>
      ) : null}
      {rating != null && rating > 0 ? (
        <Text style={styles.rating}>{'★'.repeat(rating)}</Text>
      ) : null}
    </>
  );

  return (
    <View style={styles.card}>
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={styles.photo}
          resizeMode="cover"
          accessibilityLabel="Wine label"
        />
      ) : (
        <View style={styles.photo} />
      )}
      <View style={styles.body}>
        {onPress ? (
          <Pressable onPress={onPress}>{info}</Pressable>
        ) : (
          <View>{info}</View>
        )}
        {onRemove ? (
          <Pressable
            onPress={onRemove}
            accessibilityLabel={`Remove ${wine.name}`}
            style={styles.removeButton}
          >
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: 88,
    minHeight: 120,
    backgroundColor: '#e8dcd0',
  },
  body: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: '#666',
  },
  type: {
    color: '#7b1e3a',
    textTransform: 'capitalize',
  },
  rating: {
    color: '#c9a227',
  },
  removeButton: {
    alignSelf: 'flex-end',
    marginTop: 'auto',
    paddingTop: 8,
  },
  remove: {
    color: '#b00020',
    fontWeight: '600',
  },
});
