import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  radius,
  spacing,
} from '@/src/theme/tokens';

type Props = {
  index: number;
  health: string;
  variation: number;
  previous: string;
  current: string;
};

export function CommercialHealthCard({
  index,
  health,
  variation,
  previous,
  current,
}: Props) {
  const positive = variation >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title}>
            Salud comercial
          </Text>

          <Text style={styles.caption}>
            Comparación entre periodos completos
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {health}
          </Text>

          <Ionicons
            name="star"
            size={13}
            color="#15803D"
          />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.indexArea}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Text style={styles.indexValue}>
                {index}
              </Text>

              <Text style={styles.indexOf}>
                /100
              </Text>
            </View>
          </View>

          <Text style={styles.indexLabel}>
            Índice comercial
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.variationArea}>
          <View style={styles.trendCircle}>
            <Ionicons
              name={
                positive
                  ? 'trending-up'
                  : 'trending-down'
              }
              size={24}
              color={
                positive
                  ? '#16A34A'
                  : '#DC2626'
              }
            />
          </View>

          <Text
            style={[
              styles.variation,
              {
                color: positive
                  ? '#15803D'
                  : '#B91C1C',
              },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {positive ? '+' : '-'}
            {Math.abs(variation).toFixed(2)} %
          </Text>

          <Text style={styles.variationCaption}>
            Variación mensual
          </Text>

          <View style={styles.periodRow}>
            <Ionicons
              name="calendar-outline"
              size={15}
              color="#2563EB"
            />

            <Text
              style={styles.periodText}
              numberOfLines={1}
            >
              {previous} → {current}
            </Text>
          </View>
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
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },

  heading: {
    flex: 1,
  },

  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },

  caption: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 11,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  badgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
  },

  body: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },

  indexArea: {
    width: '42%',
    alignItems: 'center',
  },

  ringOuter: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 10,
    borderColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },

  ringInner: {
    alignItems: 'center',
  },

  indexValue: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '900',
  },

  indexOf: {
    color: colors.textSecondary,
    fontSize: 11,
  },

  indexLabel: {
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 10.5,
  },

  divider: {
    width: 1,
    height: 112,
    backgroundColor: '#E2E8F0',
    marginHorizontal: spacing.md,
  },

  variationArea: {
    flex: 1,
    minWidth: 0,
  },

  trendCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  variation: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  variationCaption: {
    color: colors.textSecondary,
    fontSize: 10.5,
    marginTop: 3,
  },

  periodRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  periodText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 9.5,
  },
});
