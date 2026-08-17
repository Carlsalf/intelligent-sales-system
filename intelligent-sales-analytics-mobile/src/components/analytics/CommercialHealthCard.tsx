import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  radius,
  spacing,
} from '@/src/theme/tokens';

type Props = {
  variation: number;
  previous: string;
  current: string;
  previousRevenue: string;
  currentRevenue: string;
};

export function CommercialHealthCard({
  variation,
  previous,
  current,
  previousRevenue,
  currentRevenue,
}: Props) {
  const positive = variation > 0;
  const negative = variation < 0;

  const iconName = positive
    ? 'trending-up'
    : negative
      ? 'trending-down'
      : 'remove-outline';

  const variationColor = positive
    ? '#15803D'
    : negative
      ? '#B91C1C'
      : '#475569';

  const variationPrefix = positive
    ? '+'
    : '';

  const changeLabel = positive
    ? 'Aumento'
    : negative
      ? 'Disminución'
      : 'Sin variación';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Comparación de facturación
          </Text>

          <Text style={styles.caption}>
            Dos últimos periodos completos
          </Text>
        </View>

        <View style={styles.badge}>
          <Ionicons
            name={iconName}
            size={14}
            color={variationColor}
          />

          <Text
            style={[
              styles.badgeText,
              { color: variationColor },
            ]}
          >
            {changeLabel}
          </Text>
        </View>
      </View>

      <View style={styles.periodComparison}>
        <View style={styles.periodBlock}>
          <Text style={styles.periodLabel}>
            {previous}
          </Text>

          <Text style={styles.revenueValue}>
            {previousRevenue}
          </Text>

          <Text style={styles.revenueCaption}>
            Facturación anterior
          </Text>
        </View>

        <View style={styles.arrowArea}>
          <Ionicons
            name="arrow-forward"
            size={20}
            color="#64748B"
          />
        </View>

        <View style={styles.periodBlock}>
          <Text style={styles.periodLabel}>
            {current}
          </Text>

          <Text style={styles.revenueValue}>
            {currentRevenue}
          </Text>

          <Text style={styles.revenueCaption}>
            Último periodo completo
          </Text>
        </View>
      </View>

      <View style={styles.variationPanel}>
        <View
          style={[
            styles.trendCircle,
            {
              backgroundColor: positive
                ? '#DCFCE7'
                : negative
                  ? '#FEE2E2'
                  : '#F1F5F9',
            },
          ]}
        >
          <Ionicons
            name={iconName}
            size={24}
            color={variationColor}
          />
        </View>

        <View style={styles.variationTextArea}>
          <Text
            style={[
              styles.variationValue,
              { color: variationColor },
            ]}
          >
            {variationPrefix}
            {variation.toFixed(2)} %
          </Text>

          <Text style={styles.variationCaption}>
            Variación respecto al periodo anterior
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.lg,
    marginTop: spacing.md,
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },

  caption: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748B',
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  periodComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },

  periodBlock: {
    flex: 1,
  },

  periodLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },

  revenueValue: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },

  revenueCaption: {
    marginTop: 2,
    fontSize: 10,
    color: '#94A3B8',
  },

  arrowArea: {
    paddingHorizontal: spacing.sm,
  },

  variationPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  trendCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },

  variationTextArea: {
    marginLeft: spacing.md,
    flex: 1,
  },

  variationValue: {
    fontSize: 22,
    fontWeight: '900',
  },

  variationCaption: {
    marginTop: 1,
    fontSize: 11,
    color: '#64748B',
  },
});
