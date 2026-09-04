import { Pressable, StyleSheet, Text, View } from 'react-native';

export type TabName = 'journal' | 'add' | 'discover';

type TabBarProps = {
    activeTab: TabName;
    onChangeTab: (tab: TabName) => void;
}

export function TabBar({activeTab, onChangeTab}: TabBarProps) {
    return(
        <View style={styles.bar}>
            <Pressable style={styles.tab} onPress={()=> onChangeTab('journal')}>
                <Text style={[styles.label, activeTab==='journal' && styles.labelActive]}>
                    journal
                </Text>
            </Pressable>

            <Pressable style={styles.scanWrap} onPress={() => onChangeTab('add')}>
                <View style={[styles.scan, activeTab === 'add' && styles.scanActive]}>
                    <Text style={styles.scanText}>Scan</Text>
                </View>
            </Pressable>
            <Pressable style={styles.tab} onPress={() => onChangeTab('discover')}>
                <Text style={[styles.label, activeTab === 'discover' && styles.labelActive]}>
                Discover
                </Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 20,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#eee',
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
    },
    label: {
      fontSize: 14,
      color: '#888',
      fontWeight: '600',
    },
    labelActive: {
      color: '#7b1e3a',
    },
    scanWrap: {
      alignItems: 'center',
      marginTop: -28,
    },
    scan: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: '#7b1e3a',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scanActive: {
      backgroundColor: '#5c162c',
    },
    scanText: {
      color: '#fff',
      fontWeight: '700',
    },
  });