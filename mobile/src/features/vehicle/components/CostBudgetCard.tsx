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
        <View style={styles.iconBox}>
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path
              d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"
              fill="#3B82F6"
            />
          </Svg>
        </View>
        <Text style={styles.cardTitle}>Predictive Maintenance Budget</Text>
      </View>

      <Text style={styles.cardSubtitle}>
        Estimated parts & labor investment forecast based on component wear timelines.
      </Text>

      {/* Main Total Highlight */}
      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>Total Estimated Fleet Maintenance</Text>
        <Text style={styles.totalAmount}>
          {symbol}
          {totalEstimatedBudget.toLocaleString()} <Text style={styles.currCode}>{currency}</Text>
        </Text>
      </View>

      {/* Forecast Breakdown */}
      <View style={styles.forecastGrid}>
        <View style={styles.forecastItem}>
          <Text style={styles.forecastPeriod}>0 - 3 Months</Text>
          <Text style={[styles.forecastAmount, budget3M > 0 && styles.urgentAmount]}>
            {symbol}{budget3M.toLocaleString()}
          </Text>
          <Text style={styles.forecastSub}>High Urgency</Text>
        </View>

        <View style={styles.forecastItem}>
          <Text style={styles.forecastPeriod}>3 - 6 Months</Text>
          <Text style={styles.forecastAmount}>
            {symbol}{budget6M.toLocaleString()}
          </Text>
          <Text style={styles.forecastSub}>Medium Urgency</Text>
        </View>

        <View style={styles.forecastItem}>
          <Text style={styles.forecastPeriod}>6 - 12 Months</Text>
          <Text style={styles.forecastAmount}>
            {symbol}{budget12M.toLocaleString()}
          </Text>
          <Text style={styles.forecastSub}>Scheduled</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#131722',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
    marginBottom: 14,
  },
  totalBox: {
    backgroundColor: '#181D2A',
    borderRadius: 12,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  totalAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#3B82F6',
    letterSpacing: -0.5,
  },
  currCode: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  forecastGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  forecastItem: {
    flex: 1,
    minWidth: 95,
    backgroundColor: '#181D2A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 10,
    alignItems: 'center',
  },
  forecastPeriod: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  forecastAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  urgentAmount: {
    color: '#EF4444',
  },
  forecastSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
});
