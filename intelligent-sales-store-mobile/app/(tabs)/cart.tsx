import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { useCallback } from 'react';
import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/context/AuthContext';
import { useCart } from '@/src/context/CartContext';
import {
  colors,
  elevation,
  radius,
  spacing,
  typography,
} from '@/src/theme/tokens';

export default function CartScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    cart,
    isLoading,
    isMutating,
    error,
    total,
    totalUnits,
    refreshCart,
    updateItem,
    removeItem,
    clearCart,
  } = useCart();

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        void refreshCart();
      }
    }, [isAuthenticated, refreshCart]),
  );

  if (!isAuthenticated) {
    return (
      <Screen style={styles.centered}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyIconText}>C</Text>
        </View>

        <Text style={styles.emptyTitle}>
          Inicia sesión para ver tu carrito
        </Text>

        <Text style={styles.emptyText}>
          Tus productos se guardarán en tu cuenta para que
          puedas continuar la compra desde tu dispositivo.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.primaryButtonText}>
            Iniciar sesión
          </Text>
        </Pressable>
      </Screen>
    );
  }

  if (isLoading && !cart) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.emptyText}>
          Cargando carrito…
        </Text>
      </Screen>
    );
  }

  const items = cart?.items ?? [];

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>
              TU COMPRA
            </Text>

            <Text style={styles.title}>
              Mi carrito
            </Text>

            <Text style={styles.subtitle}>
              {totalUnits} unidad{totalUnits === 1 ? '' : 'es'}
            </Text>
          </View>

          {items.length > 0 ? (
            <Pressable
              disabled={isMutating}
              onPress={() => {
                Alert.alert(
                  'Vaciar carrito',
                  '¿Deseas eliminar todos los productos?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Vaciar',
                      style: 'destructive',
                      onPress: () => void clearCart(),
                    },
                  ],
                );
              }}
            >
              <Text style={styles.clearText}>
                Vaciar
              </Text>
            </Pressable>
          ) : null}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>C</Text>
            </View>

            <Text style={styles.emptyTitle}>
              Tu carrito está vacío
            </Text>

            <Text style={styles.emptyText}>
              Explora el catálogo y añade los productos que
              necesites.
            </Text>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.secondaryButtonText}>
                Seguir comprando
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.items}>
              {items.map((item) => (
                <View
                  key={item.id_detalle_carrito}
                  style={styles.itemCard}
                >
                  <View style={styles.itemTop}>
                    <View style={styles.productMark}>
                      <Text style={styles.productMarkText}>
                        {item.producto_nombre
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.itemInfo}>
                      <Text style={styles.category}>
                        {item.categoria_nombre || 'Producto'}
                      </Text>

                      <Text style={styles.productName}>
                        {item.producto_nombre}
                      </Text>

                      <Text style={styles.unitPrice}>
                        {Number(item.precio)
                          .toFixed(2)
                          .replace('.', ',')}{' '}
                        € / ud.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemBottom}>
                    <View style={styles.quantitySelector}>
                      <Pressable
                        disabled={isMutating}
                        style={styles.quantityButton}
                        onPress={() =>
                          void updateItem(
                            item.id_producto,
                            item.cantidad - 1,
                          )
                        }
                      >
                        <Text style={styles.quantityButtonText}>
                          −
                        </Text>
                      </Pressable>

                      <Text style={styles.quantity}>
                        {item.cantidad}
                      </Text>

                      <Pressable
                        disabled={isMutating}
                        style={styles.quantityButton}
                        onPress={() =>
                          void updateItem(
                            item.id_producto,
                            item.cantidad + 1,
                          )
                        }
                      >
                        <Text style={styles.quantityButtonText}>
                          +
                        </Text>
                      </Pressable>
                    </View>

                    <View style={styles.subtotalBlock}>
                      <Text style={styles.subtotalLabel}>
                        Subtotal
                      </Text>

                      <Text style={styles.subtotal}>
                        {Number(item.subtotal)
                          .toFixed(2)
                          .replace('.', ',')}{' '}
                        €
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    disabled={isMutating}
                    onPress={() =>
                      Alert.alert(
                        'Eliminar producto',
                        `¿Deseas retirar "${item.producto_nombre}" del carrito?`,
                        [
                          {
                            text: 'Cancelar',
                            style: 'cancel',
                          },
                          {
                            text: 'Eliminar',
                            style: 'destructive',
                            onPress: () =>
                              void removeItem(item.id_producto),
                          },
                        ],
                      )
                    }
                  >
                    <Text style={styles.removeText}>
                      Eliminar producto
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Unidades
                </Text>

                <Text style={styles.summaryValue}>
                  {totalUnits}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>
                  Total estimado
                </Text>

                <Text style={styles.totalValue}>
                  {Number(total)
                    .toFixed(2)
                    .replace('.', ',')}{' '}
                  €
                </Text>
              </View>

              <Pressable
                style={styles.checkoutButton}
                onPress={() => {
                  Alert.alert(
                    'Checkout',
                    'El checkout se conectará en el siguiente bloque.',
                  );
                }}
              >
                <Text style={styles.checkoutButtonText}>
                  Continuar compra
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {isMutating ? (
          <View style={styles.mutating}>
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
            <Text style={styles.mutatingText}>
              Actualizando carrito…
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
    paddingBottom: 130,
    gap: spacing.lg,
  },

  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    marginTop: spacing.xxs,
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },

  clearText: {
    ...typography.bodyStrong,
    color: colors.danger,
  },

  items: {
    gap: spacing.md,
  },

  itemCard: {
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.sm,
  },

  itemTop: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  productMark: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },

  productMarkText: {
    ...typography.title,
    color: colors.primary,
  },

  itemInfo: {
    flex: 1,
    gap: spacing.xxs,
  },

  category: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },

  productName: {
    ...typography.subtitle,
    color: colors.text,
  },

  unitPrice: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  itemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  quantityButtonText: {
    fontSize: 22,
    color: colors.text,
  },

  quantity: {
    minWidth: 28,
    textAlign: 'center',
    ...typography.subtitle,
    color: colors.text,
  },

  subtotalBlock: {
    alignItems: 'flex-end',
  },

  subtotalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  subtotal: {
    ...typography.subtitle,
    color: colors.text,
  },

  removeText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '700',
  },

  summary: {
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.sm,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },

  summaryValue: {
    ...typography.bodyStrong,
    color: colors.text,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  totalLabel: {
    ...typography.subtitle,
    color: colors.text,
  },

  totalValue: {
    ...typography.title,
    color: colors.text,
  },

  checkoutButton: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },

  checkoutButtonText: {
    ...typography.button,
    color: colors.white,
  },

  emptyCard: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIconText: {
    ...typography.title,
    color: colors.primary,
  },

  emptyTitle: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
  },

  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  primaryButton: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },

  primaryButtonText: {
    ...typography.button,
    color: colors.white,
  },

  secondaryButton: {
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },

  secondaryButtonText: {
    ...typography.button,
    color: colors.text,
  },

  errorBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#FEF2F2',
  },

  errorText: {
    ...typography.body,
    color: colors.danger,
  },

  mutating: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },

  mutatingText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
