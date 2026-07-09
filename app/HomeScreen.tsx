import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { signOut } from 'firebase/auth';

import { PortfolioSummaryCard } from '../components/PortfolioSummaryCard';
import type { PortfolioHolding } from '../types/portfolio';
import { auth } from './firebase';

const sampleHoldings: PortfolioHolding[] = [
  { id: 'global-equity', name: 'Global Equity ETF', value: 42500 },
  { id: 'sa-bonds', name: 'SA Bond Fund', value: 18300 },
  { id: 'cash', name: 'Cash', value: 9200 },
];

type HomeScreenProps = {
  userEmail: string | null;
};

export function HomeScreen({ userEmail }: HomeScreenProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (!auth) {
      return;
    }

    setErrorMessage(null);
    setIsSigningOut(true);

    try {
      await signOut(auth);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Sign-out failed.');
      setIsSigningOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PORTFOLIO MINI</Text>
            {userEmail ? <Text style={styles.accountText}>{userEmail}</Text> : null}
          </View>
          <Pressable
            disabled={isSigningOut}
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOutButton,
              isSigningOut && styles.disabledButton,
              pressed && !isSigningOut ? styles.pressedButton : null,
            ]}
          >
            <Text style={styles.signOutText}>{isSigningOut ? 'Signing out...' : 'Sign out'}</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>Your investments, at a glance.</Text>
          <Text style={styles.subtitle}>
            A simple snapshot for your signed-in account.
          </Text>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <PortfolioSummaryCard holdings={sampleHoldings} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F2',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  eyebrow: {
    color: '#41644A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  accountText: {
    marginTop: 8,
    maxWidth: 190,
    color: '#607067',
    fontSize: 13,
    lineHeight: 18,
  },
  signOutButton: {
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#41644A',
    paddingHorizontal: 14,
  },
  signOutText: {
    color: '#41644A',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.45,
  },
  pressedButton: {
    opacity: 0.78,
  },
  hero: {
    marginBottom: 32,
  },
  title: {
    maxWidth: 320,
    color: '#142018',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
  },
  subtitle: {
    maxWidth: 320,
    marginTop: 16,
    color: '#607067',
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    marginBottom: 16,
    color: '#B42318',
    fontSize: 14,
    lineHeight: 20,
  },
});
