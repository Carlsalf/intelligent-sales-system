import { StyleSheet, Text, View } from 'react-native';

import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme/tokens';

export function HeroBanner() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.hero}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>IS</Text>
          </View>

          <View>
            <Text style={styles.eyebrow}>
              INTELLIGENT SALES STORE
            </Text>
            <Text style={styles.context}>
              Comercio móvil integrado
            </Text>
          </View>
        </View>

        <Text style={styles.title}>
          Encuentra lo que necesitas para tu negocio.
        </Text>

        <Text style={styles.subtitle}>
          Explora productos, prepara tu compra y continúa
          cuando estés listo. El catálogo está disponible
          sin iniciar sesión.
        </Text>

        <View style={styles.featureRow}>
          <View style={styles.feature}>
            <Text style={styles.featureDot}>●</Text>
            <Text style={styles.featureText}>Compra ágil</Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureDot}>●</Text>
            <Text style={styles.featureText}>Pedido integrado</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  hero: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    overflow: 'hidden',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '900',
  },
  eyebrow: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  context: {
    ...typography.caption,
    color: '#BFDBFE',
  },
  title: {
    ...typography.headline,
    color: colors.white,
  },
  subtitle: {
    ...typography.body,
    color: '#DBEAFE',
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureDot: {
    color: colors.accent,
    fontSize: 11,
  },
  featureText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
});
