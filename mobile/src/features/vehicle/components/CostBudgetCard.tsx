import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ComponentResponse } from '@/types/vehicle';

interface CostBudgetCardProps {
  components?: ComponentResponse[];
  currency?: string;
}

const ESTIMATED_PART_COSTS: Record<string, number> = {
  oil: 65,
  filter: 25,
  brake: 140,
  rotor: 180,
  battery: 160,
  tire: 450,
  spark: 90,
  coolant: 75,
  transmission: 120,
  wiper: 35,
};

export function CostBudgetCard({ components = [], currency = 'EUR' }: CostBudgetCardProps) {
  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'USD': return '$';
      case 'MAD': return 'DH';
      case 'GBP': return '£';
      default: return '€';
    }
  };

  const symbol = getCurrencySymbol(currency);

  let totalEstimatedBudget = 0;
  let budget3M = 0;
  let budget6M = 0;
  let budget12M = 0;

  components.forEach((comp) => {
    const nameLower = comp.name.toLowerCase();
    let baseCost = 80; // default average service cost

    for (const [key, cost] of Object.entries(ESTIMATED_PART_COSTS)) {
      if (nameLower.includes(key)) {
        baseCost = cost;
        break;
      }
    }

    totalEstimatedBudget += baseCost;

    const remainingDays = comp.remainingDays ?? 180;
    if (remainingDays <= 90) {
      budget3M += baseCost;
    } else if (remainingDays <= 180) {
      budget6M += baseCost;
    } else {
      budget12M += baseCost;
    }
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <Path
            d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"
            fill="#abc7ff"
          />
        </Svg>
        <Text style={styles.cardTitle}>Predictive Maintenance Budget</Text>
      </View>

      <Text style={styles.cardSubtitle}>
        Calculated parts & labor budget based on component health & replacement timelines.
      </Text>

      {/* Main Total Highlight */}
      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total Estimated Fleet Maintenance</Text>
        <Text style={styles.totalAmount}>
          {symbol}
          {totalEstimatedBudget} <Text style={styles.currCode}>{currency}</Text>
        </Text>
      </View>

      {/* Forecast Breakdown */}
      <View style={styles.forecastGrid}>
        <View style={styles.forecastItem}>
          <Text style={styles.forecastPeriod}>0 - 3 Months</Text>
          <Text style={[styles.forecastAmount, budget3M > 0 && styles.urgentAmount]}>
            {symbol}{budget3M}
          </Text>
          <Text style={styles.forecastSub}>High Urgency</Text>
        </View>

        <View style={styles.forecastItem}>
          <Text style={styles.forecastPeriod}>3 - 6 Months</Text>
          <Text style={styles.forecastAmount}>
            {symbol}{budget6M}
          </Text>
          <Text style={styles.forecastSub}>Medium Urgency</Text>
        </View>

        <View style={styles.forecastItem}>
          <Text style={styles.forecastPeriod}>6 - 12 Months</Text>
          <Text style={styles.forecastAmount}>
            {symbol}{budget12M}
          </Text>
          <Text style={styles.forecastSub}>Scheduled</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1c1c1c',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2f3131',
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#8e9192',
    lineHeight: 16,
    marginBottom: 16,
  },
  totalBox: {
    backgroundColor: '#131313',
    borderRadius: 14,
    borderColor: '#27272a',
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: '#8e9192',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  totalAmount: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '800',
    color: '#abc7ff',
  },
  currCode: {
    fontSize: 14,
    color: '#8e9192',
    fontWeight: '600',
  },
  forecastGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  forecastItem: {
    flex: 1,
    backgroundColor: '#131313',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 12,
    alignItems: 'center',
  },
  forecastPeriod: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: '#8e9192',
    marginBottom: 4,
  },
  forecastAmount: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  urgentAmount: {
    color: '#ffb4ab',
  },
  forecastSub: {
    fontFamily: 'Inter',
    fontSize: 9,
    color: '#8e9192',
    marginTop: 2,
  },
});
