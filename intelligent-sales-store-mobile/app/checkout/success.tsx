import {
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
import {
  colors,
  elevation,
  radius,
  spacing,
  typography,
} from '@/src/theme/tokens';
import type { CheckoutOrder } from '@/src/types/checkout';

function money(value: number) {
  return `${Number(value).toFixed(2).replace('.', ',')} €`;
}

function formatDate(value?: string | null) {
  if (!value) return 'Por confirmar';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Por confirmar';
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function SuccessScreen() {
  const router = useRouter();

  const { pedido: rawPedido } =
    useLocalSearchParams<{
      pedido?: string;
      message?: string;
    }>();

  let pedido: CheckoutOrder | null = null;

  const orderStatus = (value?: string) => {
    if (value === 'PENDIENTE_REPOSICION') {
      return {
        title: 'Pendiente de disponibilidad',
        description:
          'Estamos esperando confirmación de reposición. Te avisaremos cuando podamos indicar una fecha de entrega.',
      };
    }

    if (value === 'CONFIRMADO_CON_REPOSICION') {
      return {
        title: 'Pedido confirmado',
        description:
          'Algunos productos requieren reposición, pero ya contamos con una previsión de disponibilidad.',
      };
    }

    return {
      title: 'Pedido confirmado',
      description:
        'Gracias por tu compra. Ya estamos preparando tu pedido.',
    };
  };

  try {
    pedido = rawPedido
      ? JSON.parse(rawPedido)
      : null;
  } catch {
    pedido = null;
  }

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View style={styles.successIcon}>
            <Text style={styles.successCheck}>
              ✓
            </Text>
          </View>

          <Text style={styles.kicker}>
            COMPRA COMPLETADA
          </Text>

          <Text style={styles.title}>
            {orderStatus(pedido?.estado).title}
          </Text>

          <Text style={styles.subtitle}>
            {orderStatus(pedido?.estado).description}
          </Text>
        </View>

        {pedido ? (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.label}>
                  Pedido
                </Text>

                <Text style={styles.orderCode}>
                  {pedido.codigo}
                </Text>
              </View>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {pedido.estado === 'PENDIENTE_REPOSICION'
                    ? 'Pendiente'
                    : pedido.estado === 'CONFIRMADO_CON_REPOSICION'
                      ? 'Con reposición'
                      : 'Confirmado'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>
                Total
              </Text>

              <Text style={styles.value}>
                {money(pedido.total)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                Entrega
              </Text>

              <Text style={styles.value}>
                {pedido.tipo_entrega ===
                'ENTREGA_DOMICILIO'
                  ? 'A domicilio'
                  : 'Recogida en almacén'}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                Pago
              </Text>

              <Text style={styles.value}>
                Aprobado
              </Text>
            </View>

            <View style={styles.divider} />

            <View>
              <Text style={styles.label}>
                Fecha estimada
              </Text>

              <Text style={styles.estimatedDate}>
                {pedido.fecha_entrega_estimada
                  ? formatDate(
                      pedido.fecha_entrega_estimada,
                    )
                  : 'Por confirmar'}
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>
            Estado de tu pedido
          </Text>

          <View style={styles.progressItem}>
            <Text style={styles.progressCheck}>
              ✓
            </Text>

            <Text style={styles.progressText}>
              Pedido recibido
            </Text>
          </View>

          <View style={styles.progressItem}>
            <Text style={styles.progressCheck}>
              ✓
            </Text>

            <Text style={styles.progressText}>
              Pago confirmado
            </Text>
          </View>

          <View style={styles.progressItem}>
            <Text
              style={
                pedido?.estado === 'PENDIENTE_REPOSICION'
                  ? styles.progressPending
                  : styles.progressCheck
              }
            >
              {pedido?.estado === 'PENDIENTE_REPOSICION'
                ? '○'
                : '✓'}
            </Text>

            <Text
              style={
                pedido?.estado === 'PENDIENTE_REPOSICION'
                  ? styles.progressPendingText
                  : styles.progressText
              }
            >
              {pedido?.estado === 'PENDIENTE_REPOSICION'
                ? 'Esperando disponibilidad'
                : pedido?.estado === 'CONFIRMADO_CON_REPOSICION'
                  ? 'Reposición planificada'
                  : 'Preparando pedido'}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            router.replace('/(tabs)')
          }
        >
          <Text style={styles.primaryText}>
            Seguir comprando
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() =>
            router.replace('/(tabs)/account')
          }
        >
          <Text style={styles.secondaryText}>
            Ir a mi cuenta
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: 60,
    gap: spacing.lg,
  },

  hero: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },

  successIcon: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF3',
  },

  successCheck: {
    fontSize: 44,
    fontWeight: '800',
    color: '#16A34A',
  },

  kicker: {
    ...typography.caption,
    color: '#16A34A',
    fontWeight: '800',
    letterSpacing: 1,
  },

  title: {
    ...typography.headline,
    color: colors.text,
    textAlign: 'center',
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
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

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  orderCode: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.xxs,
  },

  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: '#ECFDF3',
  },

  statusText: {
    ...typography.caption,
    color: '#16A34A',
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  value: {
    ...typography.bodyStrong,
    color: colors.text,
    textAlign: 'right',
  },

  estimatedDate: {
    ...typography.subtitle,
    color: colors.text,
    marginTop: spacing.xxs,
  },

  progressCard: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSoft,
  },

  progressTitle: {
    ...typography.subtitle,
    color: colors.text,
  },

  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  progressCheck: {
    color: '#16A34A',
    fontWeight: '800',
  },

  progressText: {
    ...typography.bodyStrong,
    color: colors.text,
  },

  progressPending: {
    color: colors.textSecondary,
  },

  progressPendingText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  primaryButton: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },

  primaryText: {
    ...typography.button,
    color: colors.white,
  },

  secondaryButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  secondaryText: {
    ...typography.button,
    color: colors.text,
  },
});
