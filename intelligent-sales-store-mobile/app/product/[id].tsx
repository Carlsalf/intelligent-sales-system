import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Screen } from '@/src/components/Screen';
import { Badge, Price } from '@/src/components/ui';
import { fetchProductById } from '@/src/services/api';
import {
  colors,
  elevation,
  radius,
  spacing,
  typography,
} from '@/src/theme/tokens';
import type { StoreProduct } from '@/src/types/store';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      const productId = Number(id);

      if (!Number.isInteger(productId) || productId <= 0) {
        setError('Producto no válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const result = await fetchProductById(productId);

        if (active) {
          setProduct(result);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar el producto',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Screen>
        <View style={styles.state}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.stateText}>Cargando producto…</Text>
        </View>
      </Screen>
    );
  }

  if (error || !product) {
    return (
      <Screen>
        <View style={styles.state}>
          <Text style={styles.error}>
            {error || 'Producto no disponible'}
          </Text>

          <Pressable
            onPress={() => router.back()}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>
              Volver al catálogo
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const category =
    product.categoria_nombre ??
    product.categoria ??
    'Producto';

  const initial =
    product.nombre.trim().charAt(0).toUpperCase() || 'P';

  const total =
    Number(product.precio ?? 0) * quantity;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.navigation}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver al catálogo"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <Text style={styles.navigationTitle}>
            Detalle del producto
          </Text>

          <View style={styles.navigationSpacer} />
        </View>

        {product.imagen_url ? (
          <Image
            source={{ uri: product.imagen_url }}
            resizeMode="cover"
            style={styles.productImage}
          />
        ) : (
          <View style={styles.productVisual}>
            <View style={styles.productMark}>
              <Text style={styles.productMarkText}>
                {initial}
              </Text>
            </View>

            <Text style={styles.productVisualCategory}>
              {category}
            </Text>
          </View>
        )}

        <View style={styles.productCard}>
          <Badge label={category} />

          <Text style={styles.productName}>
            {product.nombre}
          </Text>

          <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>Precio</Text>
            <Price value={Number(product.precio ?? 0)} />
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Sobre este producto
            </Text>

            <Text style={styles.description}>
              {product.descripcion ||
                'Producto disponible en el catálogo de Intelligent Sales Store.'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.quantitySection}>
            <View>
              <Text style={styles.sectionTitle}>
                Cantidad
              </Text>
              <Text style={styles.quantityHelp}>
                Selecciona las unidades que necesitas
              </Text>
            </View>

            <View style={styles.quantitySelector}>
              <Pressable
                onPress={() =>
                  setQuantity((current) =>
                    Math.max(1, current - 1),
                  )
                }
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </Pressable>

              <Text style={styles.quantityValue}>
                {quantity}
              </Text>

              <Pressable
                onPress={() =>
                  setQuantity((current) => current + 1)
                }
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
          >
            <View>
              <Text style={styles.addButtonTitle}>
                Añadir al carrito
              </Text>

              <Text style={styles.addButtonSubtitle}>
                {quantity} unidad{quantity === 1 ? '' : 'es'}
              </Text>
            </View>

            <Text style={styles.addButtonPrice}>
              {total.toFixed(2).replace('.', ',')} €
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  navigation: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backIcon: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 34,
  },
  navigationTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  navigationSpacer: {
    width: 44,
  },
  productImage: {
    height: 300,
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSoft,
  },
  productVisual: {
    height: 270,
    marginHorizontal: spacing.lg,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: '#EFF6FF',
  },
  productMark: {
    width: 104,
    height: 104,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    ...elevation.md,
  },
  productMarkText: {
    ...typography.display,
    color: colors.white,
  },
  productVisualCategory: {
    ...typography.subtitle,
    color: colors.primaryDark,
  },
  productCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.sm,
  },
  productName: {
    ...typography.headline,
    color: colors.text,
  },
  priceBlock: {
    gap: spacing.xxs,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  quantitySection: {
    gap: spacing.md,
  },
  quantityHelp: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quantityButton: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  quantityValue: {
    minWidth: 42,
    textAlign: 'center',
    ...typography.title,
    color: colors.text,
  },
  addButton: {
    minHeight: 76,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
  },
  addButtonPressed: {
    opacity: 0.88,
  },
  addButtonTitle: {
    ...typography.button,
    color: colors.white,
  },
  addButtonSubtitle: {
    ...typography.caption,
    color: '#DBEAFE',
    marginTop: spacing.xxs,
  },
  addButtonPrice: {
    ...typography.subtitle,
    color: colors.white,
  },
  state: {
    flex: 1,
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
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
