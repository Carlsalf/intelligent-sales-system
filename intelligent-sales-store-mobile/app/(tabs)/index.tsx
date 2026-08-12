import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '@/src/components/Screen';
import {
  HeroBanner,
  ProductGrid,
} from '@/src/components/store';
import { SearchBar } from '@/src/components/ui';
import { fetchProducts } from '@/src/services/api';
import {
  colors,
  spacing,
  typography,
} from '@/src/theme/tokens';
import type { StoreProduct } from '@/src/types/store';

function normalizeProducts(
  data: StoreProduct[] | { products: StoreProduct[] },
) {
  return Array.isArray(data)
    ? data
    : data.products ?? [];
}

export default function StoreScreen() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError('');

        const result = await fetchProducts(search);

        if (active) {
          setProducts(normalizeProducts(result));
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar el catálogo',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search]);

  return (
    <Screen>
      <HeroBanner />

      <View style={styles.searchContainer}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar productos"
        />
      </View>

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator
            size="small"
            color={colors.primary}
          />

          <Text style={styles.stateText}>
            Cargando catálogo…
          </Text>
        </View>
      ) : error ? (
        <View style={styles.state}>
          <Text style={styles.error}>
            {error}
          </Text>
        </View>
      ) : (
        <ProductGrid
          products={products}
          searching={Boolean(search)}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  stateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  error: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
  },
});
