import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { Screen } from '@/src/components/Screen';
import { fetchCustomerOrderById } from '@/src/services/ordersApi';
import {
  colors,
  elevation,
  radius,
  spacing,
  typography,
} from '@/src/theme/tokens';
import type {
  CustomerOrder,
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
      month: 'long',
      year: 'numeric',
    },
  ).format(date);
}

function fulfillmentLabel(
  value: string,
) {
  switch (value) {
    case 'COMMITTED':
      return 'Pendiente de reposición';

    case 'MIXED':
      return 'Disponibilidad parcial';

    case 'RESERVED':
    default:
      return 'Reservado';
  }
}

export default function OrderDetailScreen() {
  const router = useRouter();

  const { id } =
    useLocalSearchParams<{
      id?: string;
    }>();

  const [order, setOrder] =
    useState<CustomerOrder | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      const orderId = Number(id);

      if (
        !Number.isInteger(orderId) ||
        orderId <= 0
      ) {
        setError('Pedido no válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const result =
          await fetchCustomerOrderById(
            orderId,
          );

        if (active) {
          setOrder(result.order);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar el pedido',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Screen style={styles.state}>
        <ActivityIndicator
          color={colors.primary}
        />

        <Text style={styles.stateText}>
          Cargando pedido…
        </Text>
      </Screen>
    );
  }

  if (error || !order) {
    return (
      <Screen style={styles.state}>
        <Text style={styles.error}>
          {error || 'Pedido no encontrado'}
        </Text>

        <Pressable
          onPress={() => router.back()}
        >
          <Text style={styles.backLink}>
            Volver
          </Text>
        </Pressable>
      </Screen>
    );
  }

  const pendingReplenishment =
    order.estado_pedido ===
    'PENDIENTE_REPOSICION';

  const confirmedReplenishment =
    order.estado_pedido ===
    'CONFIRMADO_CON_REPOSICION';

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>
            ‹
          </Text>

          <Text style={styles.backText}>
            Mis pedidos
          </Text>
        </Pressable>

        <View style={styles.hero}>
          <Text style={styles.kicker}>
            PEDIDO
          </Text>

          <Text style={styles.title}>
            {order.codigo}
          </Text>

          <Text style={styles.subtitle}>
            {order.estado_visible}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>
              Total
            </Text>

            <Text style={styles.value}>
              {money(order.total)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Pago
            </Text>

            <Text style={styles.value}>
              {order.pago_estado ===
              'SIMULADO_PAGADO'
                ? 'Aprobado'
                : order.pago_estado}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Entrega
            </Text>

            <Text style={styles.value}>
              {order.tipo_entrega ===
              'ENTREGA_DOMICILIO'
                ? 'A domicilio'
                : 'Recogida en almacén'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View>
            <Text style={styles.label}>
              Fecha estimada
            </Text>

            <Text style={styles.estimatedDate}>
              {formatDate(
                order.fecha_entrega_estimada,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Productos
          </Text>

          {order.items.map((item) => (
            <View
              key={item.id_detalle}
              style={styles.productItem}
            >
              <View style={styles.productTop}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {item.producto_nombre}
                  </Text>

                  <Text style={styles.productMeta}>
                    {item.cantidad} ×{' '}
                    {money(
                      item.precio_unitario,
                    )}
                  </Text>
                </View>

                <Text style={styles.productPrice}>
                  {money(item.subtotal)}
                </Text>
              </View>

              <View style={styles.fulfillmentBadge}>
                <Text
                  style={styles.fulfillmentText}
                >
                  {fulfillmentLabel(
                    item.tipo_cumplimiento,
                  )}
                </Text>
              </View>

              {item.fecha_disponibilidad_estimada ? (
                <Text style={styles.availability}>
                  Disponibilidad estimada:{' '}
                  {formatDate(
                    item.fecha_disponibilidad_estimada,
                  )}
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        {order.direccion_entrega ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Dirección de entrega
            </Text>

            <Text style={styles.addressName}>
              {
                order.direccion_entrega
                  .destinatario
              }
            </Text>

            <Text style={styles.addressText}>
              {
                order.direccion_entrega
                  .direccion_linea_1
              }
            </Text>

            {order.direccion_entrega
              .direccion_linea_2 ? (
              <Text style={styles.addressText}>
                {
                  order.direccion_entrega
                    .direccion_linea_2
                }
              </Text>
            ) : null}

            <Text style={styles.addressText}>
              {
                order.direccion_entrega
                  .codigo_postal
              }{' '}
              {
                order.direccion_entrega
                  .ciudad
              }
            </Text>

            <Text style={styles.addressText}>
              {
                order.direccion_entrega
                  .provincia
              }{' '}
              ·{' '}
              {
                order.direccion_entrega
                  .pais
              }
            </Text>

            <Text style={styles.addressPhone}>
              {
                order.direccion_entrega
                  .telefono
              }
            </Text>
          </View>
        ) : null}

        <View style={styles.timelineCard}>
          <Text style={styles.cardTitle}>
            Seguimiento
          </Text>

          <View style={styles.timelineItem}>
            <Text style={styles.done}>
              ✓
            </Text>

            <Text style={styles.timelineDone}>
              Pedido recibido
            </Text>
          </View>

          <View style={styles.timelineItem}>
            <Text style={styles.done}>
              ✓
            </Text>

            <Text style={styles.timelineDone}>
              Pago confirmado
            </Text>
          </View>

          <View style={styles.timelineItem}>
            <Text
              style={
                pendingReplenishment
                  ? styles.current
                  : styles.done
              }
            >
              {pendingReplenishment
                ? '●'
                : '✓'}
            </Text>

            <Text
              style={
                pendingReplenishment
                  ? styles.timelineCurrent
                  : styles.timelineDone
              }
            >
              {pendingReplenishment
                ? 'Esperando disponibilidad'
                : confirmedReplenishment
                  ? 'Reposición planificada'
                  : 'Preparando pedido'}
            </Text>
          </View>

          <View style={styles.timelineItem}>
            <Text style={styles.pending}>
              ○
            </Text>

            <Text style={styles.timelinePending}>
              En reparto
            </Text>
          </View>

          <View style={styles.timelineItem}>
            <Text style={styles.pending}>
              ○
            </Text>

            <Text style={styles.timelinePending}>
              Entregado
            </Text>
          </View>
        </View>

        {pendingReplenishment ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>
              Fecha por confirmar
            </Text>

            <Text style={styles.noticeText}>
              Estamos esperando confirmación de
              disponibilidad. Conservaremos tu pedido y
              te informaremos cuando exista una fecha
              estimada.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: 70,
    gap: spacing.lg,
  },

  state: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },

  stateText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  error: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },

  backLink: {
    ...typography.button,
    color: colors.primary,
  },

  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  backArrow: {
    fontSize: 30,
    color: colors.text,
  },

  backText: {
    ...typography.bodyStrong,
    color: colors.text,
  },

  hero: {
    gap: spacing.xs,
  },

  kicker: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 1,
  },

  title: {
    ...typography.headline,
    color: colors.text,
  },

  subtitle: {
    ...typography.bodyStrong,
    color: colors.primary,
  },

  card: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.sm,
  },

  cardTitle: {
    ...typography.subtitle,
    color: colors.text,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  value: {
    ...typography.bodyStrong,
    color: colors.text,
    textAlign: 'right',
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  estimatedDate: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.xxs,
  },

  productItem: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },

  productTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    ...typography.bodyStrong,
    color: colors.text,
  },

  productMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },

  productPrice: {
    ...typography.bodyStrong,
    color: colors.text,
  },

  fulfillmentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
  },

  fulfillmentText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },

  availability: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  addressName: {
    ...typography.bodyStrong,
    color: colors.text,
  },

  addressText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  addressPhone: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  timelineCard: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSoft,
  },

  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  done: {
    color: colors.success,
    fontWeight: '800',
  },

  current: {
    color: colors.primary,
    fontWeight: '800',
  },

  pending: {
    color: colors.textSecondary,
  },

  timelineDone: {
    ...typography.bodyStrong,
    color: colors.text,
  },

  timelineCurrent: {
    ...typography.bodyStrong,
    color: colors.primary,
  },

  timelinePending: {
    ...typography.body,
    color: colors.textSecondary,
  },

  noticeCard: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  noticeTitle: {
    ...typography.subtitle,
    color: colors.text,
  },

  noticeText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
