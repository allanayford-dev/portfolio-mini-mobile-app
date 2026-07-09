import { StyleSheet, Text, View } from 'react-native';

import type { PortfolioHolding } from '../types/portfolio';
import { formatCurrency } from '../utils/formatCurrency';

type PortfolioSummaryCardProps = {
  holdings: PortfolioHolding[];
};

export function PortfolioSummaryCard({
  holdings,
}: PortfolioSummaryCardProps) {
  const totalValue = holdings.reduce((total, holding) => total + holding.value, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>TOTAL VALUE</Text>
      <Text style={styles.total}>{formatCurrency(totalValue)}</Text>

      <View style={styles.divider} />

      {holdings.map((holding) => (
        <View key={holding.id} style={styles.row}>
          <Text style={styles.name}>{holding.name}</Text>
          <Text style={styles.value}>{formatCurrency(holding.value)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderColor: '#DCE3DC',
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  label: {
    color: '#718078',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  total: {
    marginTop: 8,
    color: '#142018',
    fontSize: 32,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 24,
    backgroundColor: '#E8ECE8',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  name: {
    flex: 1,
    color: '#3C4941',
    fontSize: 15,
  },
  value: {
    marginLeft: 16,
    color: '#142018',
    fontSize: 15,
    fontWeight: '600',
  },
});
