import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/src/theme/tokens';

type EmptyCatalogProps = {
  searching?: boolean;
};

export function EmptyCatalog({
  searching = false,
}: EmptyCatalogProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {searching
          ? 'No encontramos productos'
          : 'Catálogo sin productos'}
      </Text>

      <Text style={styles.message}>
        {searching
          ? 'Prueba con otro nombre o término de búsqueda.'
          : 'No hay productos disponibles en este momento.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
