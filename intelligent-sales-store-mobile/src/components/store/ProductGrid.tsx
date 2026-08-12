import { FlatList, StyleSheet } from 'react-native';
import type { StoreProduct } from '@/src/types/store';
import { spacing } from '@/src/theme/tokens';
import { EmptyCatalog } from './EmptyCatalog';
import { ProductCard } from './ProductCard';

type ProductGridProps = {
  products: StoreProduct[];
  searching?: boolean;
  onProductPress?: (product: StoreProduct) => void;
};

export function ProductGrid({
  products,
  searching = false,
  onProductPress,
}: ProductGridProps) {
  return (
    <FlatList
      data={products}
      keyExtractor={(item, index) =>
        String(item.id_producto ?? item.id ?? index)
      }
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyCatalog searching={searching} />
      }
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={onProductPress}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 120,
    gap: spacing.md,
  },
});
