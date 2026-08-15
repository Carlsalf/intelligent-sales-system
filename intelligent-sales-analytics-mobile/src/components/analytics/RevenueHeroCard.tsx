import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { radius, spacing } from '@/src/theme/tokens';

type Props = {
  value: string;
  sales: number;
  period: string;
  monthlyValues: number[];
};

export function RevenueHeroCard({
  value,
  sales,
  period,
  monthlyValues,
}: Props) {
  const max = Math.max(...monthlyValues, 1);

  return (
    <LinearGradient
      colors={['#2F6FED', '#3959DB', '#4338CA']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="bar-chart-outline"
              size={18}
              color="#FFFFFF"
            />
          </View>

          <Text
            style={styles.label}
            numberOfLines={1}
          >
            FACTURACIÓN ACUMULADA
          </Text>
        </View>

        <View style={styles.periodPill}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color="#FFFFFF"
          />

          <Text
            style={styles.periodText}
            numberOfLines={1}
          >
            {period}
          </Text>
        </View>
      </View>

      <Text
        style={styles.value}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
      >
        {value}
      </Text>

      <View style={styles.footer}>
        <View style={styles.salesPill}>
          <Ionicons
            name="receipt-outline"
            size={15}
            color="#FFFFFF"
          />

          <Text style={styles.salesText}>
            {sales} ventas analizadas
          </Text>
        </View>

        <View style={styles.sparkline}>
          {monthlyValues.slice(-8).map((item, index) => {
            const height = Math.max(
              8,
              (item / max) * 42,
            );

            return (
              <View
                key={`${index}-${item}`}
                style={[
                  styles.sparkBar,
                  { height },
                ]}
              />
            );
          })}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    minHeight: 205,
    justifyContent: 'space-between',
    shadowColor: '#1D4ED8',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 7,
  },

  header: {
    gap: spacing.sm,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor:
      'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    flex: 1,
    color: '#EEF2FF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },

  periodPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor:
      'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  periodText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },

  value: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginVertical: spacing.sm,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.md,
  },

  salesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor:
      'rgba(255,255,255,0.13)',
  },

  salesText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },

  sparkline: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },

  sparkBar: {
    width: 5,
    borderRadius: 4,
    backgroundColor:
      'rgba(255,255,255,0.74)',
  },
});
