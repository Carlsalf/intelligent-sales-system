import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { radius, spacing } from '@/src/theme/tokens';

type Props = {
  month: string;
  sales: number;
  revenue: string;
};

export function CurrentPeriodCard({
  month,
  sales,
  revenue,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>
            PERÍODO EN CURSO
          </Text>

          <Text style={styles.month}>
            {month}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            Datos parciales
          </Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="receipt-outline"
              size={19}
              color="#2563EB"
            />
          </View>

          <View>
            <Text style={styles.value}>
              {sales}
            </Text>
            <Text style={styles.label}>
              Ventas
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.metric}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="cash-outline"
              size={19}
              color="#2563EB"
            />
          </View>

          <View>
            <Text style={styles.value}>
              {revenue}
            </Text>
            <Text style={styles.label}>
              Facturación
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    backgroundColor: '#FFF8EA',
    borderWidth: 1,
    borderColor: '#FDE7B2',
    padding: spacing.lg,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  kicker: {
    color: '#C55A11',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  month: {
    color: '#102A43',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
    textTransform: 'capitalize',
  },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFEDC2',
  },

  badgeText: {
    color: '#C55A11',
    fontSize: 10,
    fontWeight: '800',
  },

  metrics: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    alignItems: 'center',
  },

  metric: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  separator: {
    width: 1,
    height: 42,
    backgroundColor: '#F2D89F',
    marginHorizontal: spacing.md,
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  value: {
    color: '#102A43',
    fontSize: 20,
    fontWeight: '900',
  },

  label: {
    color: '#627D98',
    fontSize: 11,
    marginTop: 2,
  },
});
