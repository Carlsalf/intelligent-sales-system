import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/context/AuthContext';
import { fetchCustomerOrders } from '@/src/services/ordersApi';
import {
  colors,
  elevation,
  radius,
  spacing,
  typography,
} from '@/src/theme/tokens';
import type {
  CustomerOrderSummary,
} from '@/src/types/orders';

function money(value: number) {
  return `${Number(value)
    .toFixed(2)
    .replace('.', ',')} €`;
}

function formatDate(
  value?: string | null,
) {
  if (!value) return 'Por confirmar';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Por confirmar';
  }

  return new Intl.DateTimeFormat(
    'es-ES',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  ).format(date);
}

function statusLabel(order: CustomerOrderSummary) {
  return order.estado_visible || order.estado_pedido;
}

export default function AccountScreen() {
  const {
    customer,
    isLoading,
    logout,
  } = useAuth();

  const [orders, setOrders] = useState<
    CustomerOrderSummary[]
  >([]);

  const [loadingOrders, setLoadingOrders] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState('');

  const loadOrders = useCallback(
    async (refresh = false) => {
      if (!customer) return;

      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoadingOrders(true);
        }

        setError('');

        const result =
          await fetchCustomerOrders();

        setOrders(result.orders);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar tus pedidos',
        );
      } finally {
        setLoadingOrders(false);
        setRefreshing(false);
      }
    },
    [customer],
  );

  useEffect(() => {
    if (!customer) return;

    let active = true;

    async function initialLoad() {
      try {
        setLoadingOrders(true);
        setError('');

        const result =
          await fetchCustomerOrders();

        if (active) {
          setOrders(result.orders);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudieron cargar tus pedidos',
          );
        }
      } finally {
        if (active) {
          setLoadingOrders(false);
        }
      }
    }

    void initialLoad();

    return () => {
      active = false;
    };
  }, [customer]);

  if (isLoading) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator
          color={colors.primary}
        />
      </Screen>
    );
  }

  if (!customer) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.guestCard}>
          <Text style={styles.title}>
            Tu cuenta de compra
          </Text>

          <Text style={styles.text}>
            Inicia sesión para gestionar tus compras,
            direcciones y pedidos.
          </Text>

          <Pressable
            style={styles.primary}
            onPress={() =>
              router.push('/(auth)/login')
            }
          >
            <Text style={styles.primaryText}>
              Iniciar sesión
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondary}
            onPress={() =>
              router.push('/(auth)/register')
            }
          >
            <Text style={styles.secondaryText}>
              Crear cuenta
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              void loadOrders(true)
            }
          />
        }
      >
        <View style={styles.profileCard}>
          <Text style={styles.eyebrow}>
            MI CUENTA
          </Text>

          <Text style={styles.profileName}>
            {customer.nombre}
          </Text>

          <Text style={styles.profileEmail}>
            {customer.email}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Mis pedidos
            </Text>

            <Text style={styles.sectionSubtitle}>
              Consulta tus compras y su estado.
            </Text>
          </View>

          <Text style={styles.orderCount}>
            {orders.length}
          </Text>
        </View>

        {loadingOrders ? (
          <View style={styles.loadingState}>
            <ActivityIndicator
              color={colors.primary}
            />

            <Text style={styles.text}>
              Cargando pedidos…
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.error}>
              {error}
            </Text>

            <Pressable
              onPress={() =>
                void loadOrders()
              }
            >
              <Text style={styles.retry}>
                Reintentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!loadingOrders &&
        !error &&
        orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              Aún no tienes pedidos
            </Text>

            <Text style={styles.text}>
              Cuando realices una compra aparecerá aquí.
            </Text>

            <Pressable
              style={styles.primary}
              onPress={() =>
                router.push('/(tabs)')
              }
            >
              <Text style={styles.primaryText}>
                Explorar productos
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.orders}>
          {orders.map((order) => (
            <Pressable
              key={order.id_venta}
              onPress={() =>
                router.push({
                  pathname: '/order/[id]',
                  params: {
                    id: String(order.id_venta),
                  },
                })
              }
              style={styles.orderCard}
            >
              <View style={styles.orderTop}>
                <View>
                  <Text style={styles.orderCode}>
                    {order.codigo}
                  </Text>

                  <Text style={styles.orderDate}>
                    {formatDate(order.fecha)}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {statusLabel(order)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.orderRow}>
                <Text style={styles.label}>
                  {order.total_unidades}{' '}
                  {order.total_unidades === 1
                    ? 'unidad'
                    : 'unidades'}
                </Text>

                <Text style={styles.orderTotal}>
                  {money(order.total)}
                </Text>
              </View>

              <View style={styles.deliveryRow}>
                <View style={styles.deliveryInfo}>
                  <Text style={styles.label}>
                    Entrega estimada
                  </Text>

                  <Text style={styles.deliveryDate}>
                    {formatDate(
                      order.fecha_entrega_estimada,
                    )}
                  </Text>
                </View>

                <Text style={styles.arrow}>
                  ›
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={logout}
        >
          <Text style={styles.logoutText}>
            Cerrar sesión
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: spacing.lg,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: 100,
    gap: spacing.lg,
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  guestCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },

  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
    ...elevation.sm,
  },

  eyebrow: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '800',
    letterSpacing: 1,
  },

  profileName: {
    ...typography.headline,
    color: colors.text,
  },

  profileEmail: {
    ...typography.body,
    color: colors.textSecondary,
  },

  title: {
    ...typography.headline,
    color: colors.text,
  },

  text: {
    ...typography.body,
    color: colors.textSecondary,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  sectionTitle: {
    ...typography.title,
    color: colors.text,
  },

  sectionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },

  orderCount: {
    ...typography.subtitle,
    color: colors.primary,
  },

  orders: {
    gap: spacing.md,
  },

  orderCard: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.sm,
  },

  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },

  orderCode: {
    ...typography.subtitle,
    color: colors.text,
  },

  orderDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },

  statusBadge: {
    maxWidth: '52%',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
  },

  statusText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    textAlign: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  orderTotal: {
    ...typography.subtitle,
    color: colors.text,
  },

  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  deliveryInfo: {
    gap: spacing.xxs,
  },

  deliveryDate: {
    ...typography.bodyStrong,
    color: colors.text,
  },

  arrow: {
    fontSize: 30,
    color: colors.primary,
  },

  loadingState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },

  emptyCard: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyTitle: {
    ...typography.subtitle,
    color: colors.text,
  },

  errorCard: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.danger,
  },

  error: {
    ...typography.body,
    color: colors.danger,
  },

  retry: {
    ...typography.button,
    color: colors.primary,
  },

  primary: {
    minHeight: 54,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },

  primaryText: {
    ...typography.button,
    color: colors.white,
  },

  secondary: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryText: {
    ...typography.button,
    color: colors.text,
  },

  logoutButton: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  logoutText: {
    ...typography.button,
    color: colors.text,
  },
});
