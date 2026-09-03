import { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/LoginScreen';
import { SignUpScreen } from './components/SignUpScreen';

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    if (showSignUp) {
      return <SignUpScreen onGoToSignIn={() => setShowSignUp(false)} />;
    }
    return <LoginScreen onGoToSignUp={() => setShowSignUp(true)} />;
  }
  return (
    <View style={styles.centered}>
      <Text>Signed in as {user.email}</Text>
      <Text>
        Username: {user.user_metadata?.username ?? 'none'}
      </Text>
      <Button title="Sign out" onPress={() => signOut()} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
});