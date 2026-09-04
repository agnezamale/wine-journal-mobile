import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
  } from 'react-native';
  import { useAuth } from '../hooks/useAuth';
  import { useWines } from '../hooks/useWines';
  import { WineCard } from '../components/WineCard';
  import type { WineWithNote } from '../types';
  
  type JournalScreenProps = {
    onAddWine: () => void;
    onOpenWine: (id: string) => void;
  };
  
  export function JournalScreen({ onAddWine, onOpenWine }: JournalScreenProps) {
    const { user, signOut } = useAuth();
    const { wines, loading, error, fetchWines, deleteWine } = useWines();
    const username = user?.user_metadata?.username as string | undefined;

    const confirmRemove = (wine: WineWithNote) => {
      Alert.alert(
        'Remove wine',
        `Remove “${wine.name}” from your journal? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              void deleteWine(wine.id);
            },
          },
        ],
      );
    };
  
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator testID="journal-loading" />
        </View>
      );
    }
  
    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={fetchWines}>
            <Text style={styles.link}>Try again</Text>
          </Pressable>
        </View>
      );
    }
  
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Journal</Text>
            <Text style={styles.subtitle}>
              {username ? `Hi, ${username}` : user?.email}
            </Text>
          </View>
          <Pressable onPress={() => signOut()}>
            <Text style={styles.link}>Sign out</Text>
          </Pressable>
        </View>
  
        {wines.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No wines yet</Text>
            <Text style={styles.emptyBody}>
              Scan a label or add a bottle to start your journal.
            </Text>
            <Pressable style={styles.cta} onPress={onAddWine}>
              <Text style={styles.ctaText}>Scan a label</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={wines}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <WineCard
                wine={item}
                rating={item.tasting_note?.rating}
                photoUrl={item.photoUrl ?? item.image_url}
                onPress={() => onOpenWine(item.id)}
                onRemove={() => confirmRemove(item)}
              />
            )}
          />
        )}
      </View>
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
      padding: 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingHorizontal: 24,
      paddingTop: 56,
      paddingBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
    },
    subtitle: {
      color: '#666',
      marginTop: 4,
    },
    link: {
      color: '#7b1e3a',
      fontWeight: '600',
    },
    error: {
      color: '#b00020',
      marginBottom: 12,
    },
    empty: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 32,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: '700',
    },
    emptyBody: {
      color: '#666',
      marginBottom: 16,
    },
    cta: {
      backgroundColor: '#7b1e3a',
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    ctaText: {
      color: '#fff',
      fontWeight: '700',
    },
    list: {
      paddingHorizontal: 16,
      paddingBottom: 24,
      gap: 12,
    },
  });