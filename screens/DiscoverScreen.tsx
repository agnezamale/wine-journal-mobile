import { Pressable, StyleSheet, Text, View } from 'react-native';

export function DiscoverScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.subtitle}>
        Recommendations get better after you log a few bottles.
      </Text>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Recommend for me</Text>
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
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#7b1e3a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});