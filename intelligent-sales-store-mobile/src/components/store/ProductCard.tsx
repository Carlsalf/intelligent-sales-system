import { StyleSheet, Text, View } from 'react-native';
import type { StoreProduct } from '@/src/types/store';
import { AppButton, AppCard, Badge, Price } from '@/src/components/ui';
import { colors, spacing, typography } from '@/src/theme/tokens';

type ProductCardProps = {
  product: StoreProduct;
  onPress?: (product: StoreProduct) => void;
};

export function ProductCard({ product, onPress }: ProductCardProps) {
  const category =
    product.categoria_nombre ??
    product.categoria ??
    'Producto';

  return (
    <AppCard style={styles.card}>
      <View style={styles.content}>
        <Badge label={category} />

        <Text style={styles.name}>
          {product.nombre}
        </Text>

        {product.descripcion ? (
          <Text style={styles.description} numberOfLines={2}>
            {product.descripcion}
          </Text>
        ) : null}

        <Price value={Number(product.precio ?? 0)} />
      </View>

      <AppButton
        label="Ver producto"
        onPress={() => onPress?.(product)}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  content: {
    gap: spacing.sm,
  },
  name: {
    ...typography.subtitle,
    color: colors.text,
    fontWeight: '800',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
