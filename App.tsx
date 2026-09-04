import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/LoginScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { TabBar, type TabName } from './components/TabBar';
import { JournalScreen } from './screens/JournalScreen';
import { AddWineScreen } from './screens/AddWineScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { WineDetailScreen } from './screens/WineDetailScreen';

function MainTabs() {
  const [activeTab, setActiveTab] = useState<TabName>('journal');
  const [selectedWineId, setSelectedWineId] = useState<string | null>(null);

  const onChangeTab = (tab: TabName) => {
    setSelectedWineId(null);
    setActiveTab(tab);
  };

  return (
    <View style={styles.shell}>
      <View style={styles.body}>
        {activeTab === 'journal' && selectedWineId ? (
          <WineDetailScreen
            wineId={selectedWineId}
            onBack={() => setSelectedWineId(null)}
          />
        ) : activeTab === 'journal' ? (
          <JournalScreen
            onAddWine={() => setActiveTab('add')}
            onOpenWine={setSelectedWineId}
          />
        ) : null}
        {activeTab === 'add' && (
          <AddWineScreen onSaved={() => {
            setSelectedWineId(null);
            setActiveTab('journal');
          }} />
        )}
        {activeTab === 'discover' && <DiscoverScreen />}
      </View>
      {selectedWineId ? null : (
        <TabBar activeTab={activeTab} onChangeTab={onChangeTab} />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator testID="app-loading" />
      </View>
    );
  }

  if (!user) {
    if (showSignUp) {
      return <SignUpScreen onGoToSignIn={() => setShowSignUp(false)} />;
    }
    return <LoginScreen onGoToSignUp={() => setShowSignUp(true)} />;
  }

  return <MainTabs />;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#f6f1ea',
  },
  body: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});