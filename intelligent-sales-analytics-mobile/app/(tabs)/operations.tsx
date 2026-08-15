import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MonthlySalesChart } from '@/src/components/analytics/MonthlySalesChart';
import { RankingCard } from '@/src/components/analytics/RankingCard';

import { fetchAnalyticsSummary } from '@/src/services/analyticsApi';

import type {
  AnalyticsSummary,
} from '@/src/types/analytics';

import {
  colors,
  radius,
  spacing,
} from '@/src/theme/tokens';

function money(value: number) {
  const fixed = Number(value).toFixed(2);
  const [integer, decimals] = fixed.split('.');

  const grouped = integer.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    '.',
  );

  return `${grouped},${decimals} €`;
}

export default function OperationsScreen() {
  const [summary, setSummary] =
    useState<AnalyticsSummary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState('');

  const load = useCallback(
    async (
      mode:
        | 'initial'
        | 'refresh' = 'initial',
    ) => {
      try {
        mode === 'initial'
          ? setLoading(true)
          : setRefreshing(true);

        setError('');

        const result =
          await fetchAnalyticsSummary();

        setSummary(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'No fue posible cargar operaciones.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!summary) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.error}>
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              void load('refresh')
            }
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.brand}>
            INTELLIGENT SALES
          </Text>

          <Text style={styles.title}>
            Operaciones
          </Text>

          <Text style={styles.subtitle}>
            Prioridades y comportamiento comercial
          </Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons
              name="pulse-outline"
              size={23}
              color="#16A34A"
            />
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusLabel}>
              Estado del negocio
            </Text>

            <Text style={styles.statusValue}>
              {summary.salud_comercial}
            </Text>

            <Text style={styles.statusMeta}>
              Índice comercial {summary.indice_comercial}/100 · Tendencia {summary.tendencia}
            </Text>
          </View>
        </View>

        <RankingCard
          title="Top productos"
          subtitle="Ranking por unidades vendidas"
          items={summary.top_productos
            .slice(0, 5)
            .map((item) => ({
              label: item.producto,
              value: `${item.unidades} uds.`,
              secondary: `Facturación · ${money(
                item.facturacion,
              )}`,
            }))}
        />

        <MonthlySalesChart
          items={summary.ventas_mes}
          partialMonth={
            summary.periodo_en_curso?.es_parcial
              ? summary.periodo_en_curso.mes
              : null
          }
        />

        <RankingCard
          title="Top clientes"
          subtitle="Ranking por facturación acumulada"
          items={summary.top_clientes
            .slice(0, 5)
            .map((item) => ({
              label: item.cliente,
              value: money(
                item.facturacion,
              ),
              secondary: `${item.ventas} ventas`,
            }))}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 42,
    gap: spacing.lg,
  },

  header: {
    gap: 4,
  },

  brand: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  title: {
    color: colors.text,
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  statusCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#CFEFD9',
    padding: spacing.lg,
  },

  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusContent: {
    flex: 1,
  },

  statusLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },

  statusValue: {
    color: '#15803D',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },

  statusMeta: {
    color: colors.textSecondary,
    fontSize: 10.5,
    marginTop: 3,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F8FC',
    padding: spacing.xl,
  },

  error: {
    color: colors.danger,
    textAlign: 'center',
  },
});
