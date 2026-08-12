import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/src/components/Screen';
import {
  CategoryChips,
  HeroBanner,
  ProductGrid,
} from '@/src/components/store';
import {
  SearchBar,
  SectionHeader,
} from '@/src/components/ui';
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

function getCategory(product: StoreProduct) {
  return (
    product.categoria_nombre ??
    product.categoria ??
    'Producto'
  );
}

export default function StoreScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<StoreProduct[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCatalogReference() {
      try {
        const result = await fetchProducts();

        if (active) {
          setCatalogProducts(normalizeProducts(result));
        }
      } catch {
        // La carga principal mostrará el error correspondiente.
      }
    }

    loadCatalogReference();

    return () => {
      active = false;
    };
  }, []);

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

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        catalogProducts
          .map(getCategory)
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b, 'es'));
  }, [catalogProducts]);

  const visibleProducts = useMemo(() => {
    if (!selectedCategory) return products;

    return products.filter(
      (product) =>
        getCategory(product) === selectedCategory,
    );
  }, [products, selectedCategory]);

  const catalogHeader = (
    <View>
      <HeroBanner />

      <View style={styles.searchContainer}>
        <SearchBar
          value={search}
          onChangeText={(value) => {
            setSearch(value);

            if (value.trim()) {
              setSelectedCategory('');
            }
          }}
          placeholder="Buscar productos"
        />
      </View>

      {categories.length > 0 ? (
        <View style={styles.categories}>
          <View style={styles.categoriesHeader}>
            <SectionHeader
              title="Categorías"
              subtitle="Explora el catálogo por tipo de producto"
            />
          </View>

          <CategoryChips
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </View>
      ) : null}

      <View style={styles.catalogHeader}>
        <SectionHeader
          title="Productos"
          subtitle={
            loading
              ? 'Actualizando catálogo…'
              : `${visibleProducts.length} producto${
                  visibleProducts.length === 1 ? '' : 's'
                } disponible${
                  visibleProducts.length === 1 ? '' : 's'
                }`
          }
        />
      </View>
    </View>
  );

  return (
    <Screen>
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
          products={visibleProducts}
          searching={Boolean(search || selectedCategory)}
          header={catalogHeader}
          onProductPress={(product) => {
            const productId =
              product.id_producto ?? product.id;

            if (productId) {
              router.push({
                pathname: '/product/[id]',
                params: { id: String(productId) },
              });
            }
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  categories: {
    paddingTop: spacing.lg,
    gap: spacing.md,
  },

  categoriesHeader: {
    paddingHorizontal: spacing.lg,
  },

  catalogHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
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
