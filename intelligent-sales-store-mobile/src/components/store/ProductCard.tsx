import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { StoreProduct } from '@/src/types/store';
import { Badge, Price } from '@/src/components/ui';
import {
  colors,
  elevation,
  radius,
  spacing,
  typography,
} from '@/src/theme/tokens';

type ProductCardProps = {
  product: StoreProduct;
  onPress?: (product: StoreProduct) => void;
};

export function ProductCard({
  product,
  onPress,
}: ProductCardProps) {
  const category =
    product.categoria_nombre ??
    product.categoria ??
    'Producto';

  const initial =
    product.nombre?.trim().charAt(0).toUpperCase() || 'P';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(product)}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      {product.imagen_url ? (
        <Image
          source={{ uri: product.imagen_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <View style={styles.placeholderMark}>
            <Text style={styles.placeholderText}>
              {initial}
            </Text>
          </View>

          <Text style={styles.placeholderCaption}>
            {category}
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <Badge label={category} />

        <Text
          style={styles.name}
          numberOfLines={2}
        >
          {product.nombre}
        </Text>

        {product.descripcion ? (
          <Text
            style={styles.description}
            numberOfLines={2}
          >
            {product.descripcion}
          </Text>
        ) : (
          <Text style={styles.descriptionMuted}>
            Consulta el detalle comercial del producto.
          </Text>
        )}

        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Precio</Text>
            <Price value={Number(product.precio ?? 0)} />
          </View>

          <View style={styles.detailButton}>
            <Text style={styles.detailButtonText}>
              Ver detalle
            </Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...elevation.sm,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  image: {
    width: '100%',
    height: 170,
    backgroundColor: colors.surfaceSoft,
  },
  placeholder: {
    height: 150,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  placeholderMark: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    ...typography.headline,
    color: colors.white,
  },
  placeholderCaption: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  name: {
    ...typography.title,
    color: colors.text,
    fontWeight: '800',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  descriptionMuted: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  detailButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  detailButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '800',
  },
  arrow: {
    color: colors.white,
    fontSize: 22,
    lineHeight: 22,
  },
});
