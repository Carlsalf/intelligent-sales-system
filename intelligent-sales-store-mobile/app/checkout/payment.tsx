import { useState } from 'react';
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
import { CheckoutHeader } from '@/src/components/checkout/CheckoutHeader';
import { useCart } from '@/src/context/CartContext';
import { executeCustomerCheckout } from '@/src/services/checkoutApi';
import {
  colors,
  elevation,
  radius,
  spacing,
  typography,
} from '@/src/theme/tokens';
import type {
  DeliveryType,
} from '@/src/types/checkout';

function money(value: number) {
  return `${Number(value).toFixed(2).replace('.', ',')} €`;
}

export default function PaymentScreen() {
  const router = useRouter();
  const { total } = useCart();

  const {
    tipo_entrega,
    id_direccion,
  } = useLocalSearchParams<{
    tipo_entrega?: DeliveryType;
    id_direccion?: string;
  }>();

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] = useState('');

  const deliveryType: DeliveryType =
    tipo_entrega === 'RECOJO_ALMACEN'
      ? 'RECOJO_ALMACEN'
      : 'ENTREGA_DOMICILIO';

  async function pay() {
    try {
      setProcessing(true);
      setError('');

      const result =
        await executeCustomerCheckout({
          tipo_entrega: deliveryType,
          ...(id_direccion
            ? {
                id_direccion:
                  Number(id_direccion),
              }
            : {}),
          canal_venta: 'ECOMMERCE_MOBILE',
        });

      router.replace({
        pathname: '/checkout/success',
        params: {
          pedido: JSON.stringify(result.pedido),
          message: result.message,
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo completar el pago',
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <CheckoutHeader
          title="Pago"
          backLabel="Resumen"
        />

        <View style={styles.section}>
          <Text style={styles.kicker}>
            PAGO
          </Text>

          <Text style={styles.title}>
            Completa tu compra
          </Text>

          <Text style={styles.subtitle}>
            Revisa el importe y confirma el pago
            para registrar tu pedido.
          </Text>
        </View>

        <View style={styles.paymentCard}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardLabel}>
                Método de pago
              </Text>

              <Text style={styles.cardTitle}>
                Tarjeta
              </Text>
            </View>

            <View style={styles.cardMark}>
              <Text style={styles.cardMarkText}>
                VISA
              </Text>
            </View>
          </View>

          <Text style={styles.cardNumber}>
            •••• •••• •••• 4242
          </Text>

          <Text style={styles.demoText}>
            Pago de prueba · No se realizará ningún
            cargo real.
          </Text>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>
            Total a pagar
          </Text>

          <Text style={styles.totalValue}>
            {money(total)}
          </Text>
        </View>

        <View style={styles.secureCard}>
          <Text style={styles.secureTitle}>
            Compra protegida
          </Text>

          <Text style={styles.secureText}>
            Tu pedido solo se registrará cuando el
            pago sea confirmado.
          </Text>
        </View>

        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Pressable
          disabled={processing}
          onPress={() => void pay()}
          style={[
            styles.payButton,
            processing && styles.disabled,
          ]}
        >
          {processing ? (
            <ActivityIndicator
              color={colors.white}
            />
          ) : (
            <>
              <Text style={styles.payText}>
                Pagar y confirmar
              </Text>

              <Text style={styles.payAmount}>
                {money(total)}
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 60,
  },

  section: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
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
    ...typography.body,
    color: colors.textSecondary,
  },

  paymentCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    ...elevation.sm,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  cardTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginTop: spacing.xxs,
  },

  cardMark: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: '#EFF6FF',
  },

  cardMarkText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },

  cardNumber: {
    ...typography.title,
    color: colors.text,
    letterSpacing: 2,
  },

  demoText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  totalCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  totalLabel: {
    ...typography.subtitle,
    color: colors.text,
  },

  totalValue: {
    ...typography.title,
    color: colors.text,
  },

  secureCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSoft,
  },

  secureTitle: {
    ...typography.subtitle,
    color: colors.text,
  },

  secureText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  error: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    ...typography.body,
    color: colors.danger,
  },

  payButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  payText: {
    ...typography.button,
    color: colors.white,
  },

  payAmount: {
    ...typography.subtitle,
    color: colors.white,
  },

  disabled: {
    opacity: 0.55,
  },
});
