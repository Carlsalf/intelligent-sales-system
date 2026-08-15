import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  radius,
  spacing,
} from '@/src/theme/tokens';

type Item = {
  mes: string;
  facturacion: number;
};

type Props = {
  items: Item[];
  partialMonth?: string | null;
};

function monthShort(value: string) {
  const [, month] = value.split('-');

  const map: Record<string, string> = {
    '01': 'Ene',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Abr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Ago',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dic',
  };

  return map[month] ?? month;
}

function money(value: number) {
  const fixed = Number(value).toFixed(2);
  const [integer, decimals] = fixed.split('.');

  const grouped = integer.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    '.',
  );

  return `${grouped},${decimals} €`;
}

export function MonthlySalesChart({
  items,
  partialMonth,
}: Props) {
  const max = Math.max(
    ...items.map((item) => item.facturacion),
    1,
  );

  const completeItems = partialMonth
    ? items.filter(
        (item) => item.mes !== partialMonth,
      )
    : items;

  const lastComplete =
    completeItems.length > 0
      ? completeItems[completeItems.length - 1]
      : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Evolución de ventas
          </Text>

          <Text style={styles.subtitle}>
            Facturación mensual
          </Text>
        </View>

        {partialMonth ? (
          <View style={styles.partialBadge}>
            <Text style={styles.partialBadgeText}>
              Mes parcial
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.chart}>
        {items.map((item) => {
          const isPartial =
            item.mes === partialMonth;

          const height = Math.max(
            10,
            (item.facturacion / max) * 118,
          );

          return (
            <View
              key={item.mes}
              style={styles.column}
            >
              <View style={styles.barArea}>
                <View
                  style={[
                    styles.bar,
                    { height },
                    isPartial &&
                      styles.partialBar,
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.month,
                  isPartial &&
                    styles.partialMonth,
                ]}
              >
                {monthShort(item.mes)}
                {isPartial ? '*' : ''}
              </Text>
            </View>
          );
        })}
      </View>

      {lastComplete ? (
        <View style={styles.footer}>
          <View style={styles.footerIcon}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#2563EB"
            />
          </View>

          <View style={styles.footerInfo}>
            <Text style={styles.footerLabel}>
              Último mes completo
            </Text>

            <Text style={styles.footerValue}>
              {monthShort(lastComplete.mes)} ·{' '}
              {money(lastComplete.facturacion)}
            </Text>
          </View>
        </View>
      ) : null}

      {partialMonth ? (
        <Text style={styles.note}>
          * El último periodo contiene información
          parcial y no se utiliza para la comparación
          mensual principal.
        </Text>
      ) : null}
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
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  partialBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: '#FFF3D6',
  },

  partialBadgeText: {
    color: '#B45309',
    fontSize: 9.5,
    fontWeight: '800',
  },

  chart: {
    height: 165,
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  column: {
    flex: 1,
    alignItems: 'center',
  },

  barArea: {
    height: 124,
    justifyContent: 'flex-end',
  },

  bar: {
    width: 17,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
  },

  partialBar: {
    backgroundColor: '#F59E0B',
  },

  month: {
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 9.5,
  },

  partialMonth: {
    color: '#B45309',
    fontWeight: '800',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
  },

  footerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },

  footerInfo: {
    flex: 1,
  },

  footerLabel: {
    color: colors.textSecondary,
    fontSize: 9.5,
  },

  footerValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },

  note: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 13,
    marginTop: spacing.sm,
  },
});
