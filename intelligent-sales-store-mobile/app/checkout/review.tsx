import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '@/src/components/Screen';
import { CheckoutHeader } from '@/src/components/checkout/CheckoutHeader';
import { useCart } from '@/src/context/CartContext';
import { fetchCustomerAddresses } from '@/src/services/checkoutApi';
import {
  colors,
  elevation,
  radius,
  spacing,
  typography,
} from '@/src/theme/tokens';
import type {
  CustomerAddress,
  DeliveryType,
} from '@/src/types/checkout';

function money(value: number) {
  return `${Number(value).toFixed(2).replace('.', ',')} €`;
}

export default function ReviewScreen() {
  const router = useRouter();

  const {
    tipo_entrega,
    id_direccion,
  } = useLocalSearchParams<{
    tipo_entrega?: DeliveryType;
    id_direccion?: string;
  }>();

  const {
    cart,
    total,
    totalUnits,
  } = useCart();

  const [address, setAddress] =
    useState<CustomerAddress | null>(null);

  const [loadingAddress, setLoadingAddress] =
    useState(false);

  const [error, setError] = useState('');

  const deliveryType: DeliveryType =
    tipo_entrega === 'RECOJO_ALMACEN'
      ? 'RECOJO_ALMACEN'
      : 'ENTREGA_DOMICILIO';

  useEffect(() => {
    let active = true;

    async function loadAddress() {
      if (
        deliveryType !== 'ENTREGA_DOMICILIO' ||
        !id_direccion
      ) {
        return;
      }

      try {
        setLoadingAddress(true);
        setError('');

        const result =
          await fetchCustomerAddresses();

        if (!active) return;

        const selected =
          result.addresses.find(
            (item) =>
              item.id_direccion ===
              Number(id_direccion),
          ) ?? null;

        if (!selected) {
          setError(
            'No pudimos encontrar la dirección seleccionada.',
          );
          return;
        }

        setAddress(selected);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar la dirección',
          );
        }
      } finally {
        if (active) {
          setLoadingAddress(false);
        }
      }
    }

    void loadAddress();

    return () => {
      active = false;
    };
  }, [deliveryType, id_direccion]);

  const items = cart?.items ?? [];

  function continueToPayment() {
    router.push({
      pathname: '/checkout/payment',
      params: {
        tipo_entrega: deliveryType,
        ...(id_direccion
          ? { id_direccion }
          : {}),
      },
    });
  }

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <CheckoutHeader
          title="Revisar pedido"
          step="Paso 3 de 3"
          backLabel={
            deliveryType === 'ENTREGA_DOMICILIO'
              ? 'Dirección'
              : 'Entrega'
          }
        />

        <View style={styles.section}>
          <Text style={styles.kicker}>
            TU PEDIDO
          </Text>

          <Text style={styles.title}>
            Revisa todo antes de continuar
          </Text>

          <Text style={styles.subtitle}>
            Comprueba productos, cantidades y modalidad
            de entrega antes de pasar al pago.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Productos
          </Text>

          {items.map((item) => (
            <View
              key={item.id_detalle_carrito}
              style={styles.productRow}
            >
              <View style={styles.productInfo}>
                <Text style={styles.productName}>
                  {item.producto_nombre}
                </Text>

                <Text style={styles.productMeta}>
                  {item.cantidad} × {money(item.precio)}
                </Text>
              </View>

              <Text style={styles.productSubtotal}>
                {money(item.subtotal)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Unidades
            </Text>

            <Text style={styles.summaryValue}>
              {totalUnits}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.totalValue}>
              {money(total)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Forma de entrega
          </Text>

          <Text style={styles.deliveryTitle}>
            {deliveryType === 'ENTREGA_DOMICILIO'
              ? 'Entrega a domicilio'
              : 'Recogida en almacén'}
          </Text>

          <Text style={styles.deliveryText}>
            {deliveryType === 'ENTREGA_DOMICILIO'
              ? 'El pedido se enviará a la dirección seleccionada.'
              : 'Te avisaremos cuando el pedido esté preparado para recoger.'}
          </Text>
        </View>

        {deliveryType === 'ENTREGA_DOMICILIO' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Dirección de entrega
            </Text>

            {loadingAddress ? (
              <ActivityIndicator
                color={colors.primary}
              />
            ) : address ? (
              <View style={styles.address}>
                <Text style={styles.addressName}>
                  {address.destinatario}
                </Text>

                <Text style={styles.addressText}>
                  {address.direccion_linea_1}
                </Text>

                {address.direccion_linea_2 ? (
                  <Text style={styles.addressText}>
                    {address.direccion_linea_2}
                  </Text>
                ) : null}

                <Text style={styles.addressText}>
                  {address.codigo_postal} {address.ciudad}
                </Text>

                <Text style={styles.addressText}>
                  {address.provincia} · {address.pais}
                </Text>

                <Text style={styles.addressPhone}>
                  {address.telefono}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Antes de pagar
          </Text>

          <Text style={styles.infoText}>
            La fecha estimada se calculará al confirmar
            el pedido según disponibilidad y preparación.
          </Text>
        </View>

        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Pressable
          disabled={
            items.length === 0 ||
            Boolean(error) ||
            loadingAddress
          }
          onPress={continueToPayment}
          style={[
            styles.continueButton,
            (items.length === 0 ||
              Boolean(error) ||
              loadingAddress) &&
              styles.disabled,
          ]}
        >
          <Text style={styles.continueText}>
            Continuar al pago
          </Text>

          <Text style={styles.continueArrow}>›</Text>
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

  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
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

  productRow: {
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

  productSubtotal: {
    ...typography.bodyStrong,
    color: colors.text,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },

  summaryValue: {
    ...typography.bodyStrong,
    color: colors.text,
  },

  totalLabel: {
    ...typography.subtitle,
    color: colors.text,
  },

  totalValue: {
    ...typography.title,
    color: colors.text,
  },

  deliveryTitle: {
    ...typography.bodyStrong,
    color: colors.text,
  },

  deliveryText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  address: {
    gap: spacing.xxs,
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
    marginTop: spacing.xs,
  },

  infoCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSoft,
  },

  infoTitle: {
    ...typography.subtitle,
    color: colors.text,
  },

  infoText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  error: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    ...typography.body,
    color: colors.danger,
  },

  continueButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  continueText: {
    ...typography.button,
    color: colors.white,
  },

  continueArrow: {
    color: colors.white,
    fontSize: 25,
  },

  disabled: {
    opacity: 0.45,
  },
});
