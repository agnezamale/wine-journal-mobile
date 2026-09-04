import { StyleSheet, Text, View } from 'react-native';
import type { Wine } from '../types';

type WineCardProps = {
  wine: Wine;
  rating?: number;
};

export function WineCard({ wine, rating }: WineCardProps) {
  const meta = [wine.producer, wine.vintage, wine.region]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.card}>
      <View style={styles.photo} />
      <View style={styles.body}>
        <Text style={styles.title}>{wine.name}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
        {wine.wine_type ? (
          <Text style={styles.type}>{wine.wine_type}</Text>
        ) : null}
        {rating != null && rating > 0 ? (
          <Text style={styles.rating}>{'★'.repeat(rating)}</Text>
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
    width: 72,
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
});