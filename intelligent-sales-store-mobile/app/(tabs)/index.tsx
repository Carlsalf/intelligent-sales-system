import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { fetchProducts } from '@/src/services/api';
import { colors, radius, spacing } from '@/src/theme/tokens';
import type { StoreProduct } from '@/src/types/store';

function normalizeProducts(data: StoreProduct[] | { products: StoreProduct[] }) {
  return Array.isArray(data) ? data : data.products ?? [];
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
        if (active) setProducts(normalizeProducts(result));
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'No se pudo cargar el catálogo');
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search]);

  const emptyText = useMemo(() => (search ? 'No encontramos productos para tu búsqueda.' : 'No hay productos disponibles.'), [search]);

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>CATÁLOGO</Text>
        <Text style={styles.title}>Compra simple, rápida y desde tu móvil</Text>
        <Text style={styles.subtitle}>Explora el catálogo sin iniciar sesión. Te pediremos tu cuenta al confirmar una compra.</Text>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar productos"
        placeholderTextColor={colors.muted}
        style={styles.search}
        autoCapitalize="none"
      />

      {loading ? (
        <View style={styles.state}><ActivityIndicator /><Text style={styles.stateText}>Cargando catálogo…</Text></View>
      ) : error ? (
        <View style={styles.state}><Text style={styles.error}>{error}</Text></View>
      ) : (
        <FlatList
          data={products}
          contentContainerStyle={styles.list}
          keyExtractor={(item, index) => String(item.id_producto ?? item.id ?? index)}
          ListEmptyComponent={<Text style={styles.stateText}>{emptyText}</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardBody}>
                <Text style={styles.category}>{item.categoria_nombre ?? item.categoria ?? 'Producto'}</Text>
                <Text style={styles.productName}>{item.nombre}</Text>
                {item.descripcion ? <Text style={styles.description} numberOfLines={2}>{item.descripcion}</Text> : null}
                <Text style={styles.price}>€ {Number(item.precio ?? 0).toFixed(2)}</Text>
              </View>
              <Pressable style={styles.button}><Text style={styles.buttonText}>Ver producto</Text></Pressable>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.sm },
  kicker: { color: colors.primary, fontWeight: '800', letterSpacing: 1.2, fontSize: 12 },
  title: { color: colors.text, fontSize: 28, lineHeight: 34, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  search: { margin: spacing.lg, marginBottom: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, color: colors.text, fontSize: 16 },
  list: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.md, paddingBottom: 120 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.md },
  cardBody: { gap: spacing.xs },
  category: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  productName: { color: colors.text, fontSize: 18, fontWeight: '800' },
  description: { color: colors.muted, lineHeight: 20 },
  price: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: spacing.sm },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 13, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '800' },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl },
  stateText: { color: colors.muted, textAlign: 'center' },
  error: { color: colors.danger, textAlign: 'center' },
});
