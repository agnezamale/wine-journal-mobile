import { Pressable, StyleSheet, Text, View } from 'react-native';

export function AddWineScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Add wine</Text>
      <Text style={styles.subtitle}>
        Scan a label, or type the bottle in yourself.
      </Text>

      <Pressable style={styles.card}>
        <Text style={styles.cardTitle}>Scan label</Text>
        <Text style={styles.cardBody}>Take a photo of the bottle</Text>
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
});