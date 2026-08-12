import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/src/theme/tokens';

export function HeroBanner() {
  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>CATÁLOGO</Text>

      <Text style={styles.title}>
        Compra simple, rápida y desde tu móvil
      </Text>

      <Text style={styles.subtitle}>
        Explora el catálogo sin iniciar sesión. Te pediremos tu cuenta al confirmar una compra.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  kicker: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    ...typography.headline,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
