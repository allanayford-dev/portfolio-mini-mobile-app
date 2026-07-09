import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { PortfolioSummaryCard } from '../components/PortfolioSummaryCard';
import type { PortfolioHolding } from '../types/portfolio';

const sampleHoldings: PortfolioHolding[] = [
  { id: 'global-equity', name: 'Global Equity ETF', value: 42500 },
  { id: 'sa-bonds', name: 'SA Bond Fund', value: 18300 },
  { id: 'cash', name: 'Cash', value: 9200 },
];

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>PORTFOLIO MINI</Text>
          <Text style={styles.title}>Your investments, at a glance.</Text>
          <Text style={styles.subtitle}>
            A simple local snapshot. No account or connection required.
          </Text>
        </View>

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
    marginBottom: 32,
  },
  eyebrow: {
    marginBottom: 12,
    color: '#41644A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
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
});
