import { Pressable, StyleSheet, Text, View } from 'react-native';

type RatingStarsProps = {
  rating: number;
  onChange?: (value: number) => void;
};

const MAX = 5;

export function RatingStars({ rating, onChange }: RatingStarsProps) {
  const stars = Array.from({ length: MAX }, (_, index) => index + 1);

  return (
    <View style={styles.row}>
      {stars.map((value) => (
        <Pressable
          key={value}
          accessibilityLabel={`${value} stars`}
          hitSlop={8}
          onPressIn={() => onChange?.(value)}
          disabled={!onChange}
        >
          <Text style={styles.star}>{value <= rating ? '★' : '☆'}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    fontSize: 32,
    color: '#c9a227',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
});
