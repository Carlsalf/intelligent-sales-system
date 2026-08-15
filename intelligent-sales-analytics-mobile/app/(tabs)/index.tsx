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

import { SafeAreaView } from 'react-native-safe-area-context';

import { RevenueHeroCard } from '@/src/components/analytics/RevenueHeroCard';
import { MetricCard } from '@/src/components/analytics/MetricCard';
import { CommercialHealthCard } from '@/src/components/analytics/CommercialHealthCard';
import { CurrentPeriodCard } from '@/src/components/analytics/CurrentPeriodCard';
import { ProjectionCard } from '@/src/components/analytics/ProjectionCard';
import { RecommendationsCard } from '@/src/components/analytics/RecommendationsCard';

import { useAuth } from '@/src/context/AuthContext';
import { fetchAnalyticsSummary } from '@/src/services/analyticsApi';

import type {
  AnalyticsSummary,
} from '@/src/types/analytics';

import {
  colors,
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

function firstName(value?: string | null) {
  if (!value) {
    return 'Gerencia';
  }

  return value
    .trim()
    .split(/\s+/)[0];
}

function shortPeriod(
  value: string,
) {
  return value
    .replace(/ de /g, ' ')
    .replace(
      /^([a-záéíóúñ])/,
      (letter) =>
        letter.toUpperCase(),
    );
}

export default function DashboardScreen() {
  const { user } = useAuth();

  const [summary, setSummary] =
    useState<AnalyticsSummary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState('');

  const loadSummary =
    useCallback(
      async (
        mode:
          | 'initial'
          | 'refresh' = 'initial',
      ) => {
        try {
          if (mode === 'initial') {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setError('');

          const result =
            await fetchAnalyticsSummary();

          setSummary(result);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : 'No fue posible cargar la información.',
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.loading}>
            Preparando visión ejecutiva...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!summary) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorTitle}>
            No se pudo cargar el resumen
          </Text>

          <Text style={styles.error}>
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const period =
    `${shortPeriod(
      summary.periodo_comparacion.anterior_visible,
    )} – ${shortPeriod(
      summary.periodo_comparacion.actual_visible,
    )}`;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              void loadSummary('refresh')
            }
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.brand}>
            INTELLIGENT SALES
          </Text>

          <Text style={styles.area}>
            Centro de Operaciones
          </Text>

          <Text style={styles.greeting}>
            Buenos días, {firstName(user?.nombre)}
          </Text>

          <Text style={styles.period}>
            Información ejecutiva · {summary.periodo}
          </Text>
        </View>

        <RevenueHeroCard
          value={money(
            summary.facturacion_acumulada,
          )}
          sales={summary.ventas_analizadas}
          period={summary.periodo}
          monthlyValues={summary.ventas_mes.map(
            (item) => item.facturacion,
          )}
        />

        <View style={styles.metricsRow}>
          <MetricCard
            icon="trending-up-outline"
            title="Ticket medio"
            value={money(summary.ticket_medio)}
            subtitle="Por venta promedio"
          />

          <MetricCard
            icon="bar-chart-outline"
            title="Índice comercial"
            value={`${summary.indice_comercial}/100`}
            subtitle="Rendimiento general"
            accent="green"
            progress={summary.indice_comercial}
          />
        </View>

        <CommercialHealthCard
          index={summary.indice_comercial}
          health={summary.salud_comercial}
          variation={summary.variacion_mensual}
          previous={shortPeriod(
            summary.periodo_comparacion
              .anterior_visible,
          )}
          current={shortPeriod(
            summary.periodo_comparacion
              .actual_visible,
          )}
        />

        {summary.periodo_en_curso ? (
          <CurrentPeriodCard
            month={shortPeriod(
              summary.periodo_en_curso
                .mes_visible,
            )}
            sales={
              summary.periodo_en_curso
                .ventas
            }
            revenue={money(
              summary.periodo_en_curso
                .facturacion,
            )}
          />
        ) : null}

        <ProjectionCard
          value={money(
            summary.proyeccion_siguiente_mes,
          )}
          method={
            summary.metodologia_proyeccion
          }
        />

        <RecommendationsCard
          items={summary.recomendaciones}
        />

        <View style={styles.methodNote}>
          <Text style={styles.methodTitle}>
            Criterio analítico
          </Text>

          <Text style={styles.methodText}>
            Los indicadores y recomendaciones se
            calculan mediante datos comerciales y
            reglas de negocio. Los modelos de
            Inteligencia Artificial quedan definidos
            como evolución futura de la arquitectura.
          </Text>
        </View>
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
    marginBottom: 4,
  },

  brand: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  area: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 3,
  },

  greeting: {
    color: colors.text,
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '900',
    letterSpacing: -0.7,
    marginTop: 2,
  },

  period: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },

  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  methodNote: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },

  methodTitle: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },

  methodText: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  center: {
    flex: 1,
    backgroundColor: '#F6F8FC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },

  loading: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  errorTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },

  error: {
    color: colors.danger,
    textAlign: 'center',
  },
});
