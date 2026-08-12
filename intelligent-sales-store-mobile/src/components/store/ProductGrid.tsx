import type { ReactElement } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import type { StoreProduct } from '@/src/types/store';
import { spacing } from '@/src/theme/tokens';
import { EmptyCatalog } from './EmptyCatalog';
import { ProductCard } from './ProductCard';

type ProductGridProps = {
  products: StoreProduct[];
  searching?: boolean;
  onProductPress?: (product: StoreProduct) => void;
  header?: ReactElement;
};

export function ProductGrid({
  products,
  searching = false,
  onProductPress,
  header,
}: ProductGridProps) {
  return (
    <FlatList
      style={styles.list}
      data={products}
      keyExtractor={(item, index) =>
        String(item.id_producto ?? item.id ?? index)
      }
      ListHeaderComponent={header}
      ListEmptyComponent={
        <EmptyCatalog searching={searching} />
      }
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={onProductPress}
        />
      )}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
    gap: spacing.md,
  },
});
