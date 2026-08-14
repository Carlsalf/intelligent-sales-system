import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme/tokens';

type CheckoutHeaderProps = {
  title: string;
  step?: string;
  backLabel?: string;
};

export function CheckoutHeader({
  title,
  step,
  backLabel = 'Atrás',
}: CheckoutHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backArrow}>‹</Text>
        <Text style={styles.backLabel}>{backLabel}</Text>
      </Pressable>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>

        {step ? (
          <Text style={styles.step}>{step}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },

  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 42,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },

  backArrow: {
    fontSize: 30,
    lineHeight: 30,
    color: colors.text,
  },

  backLabel: {
    ...typography.bodyStrong,
    color: colors.text,
  },

  titleBlock: {
    gap: spacing.xxs,
  },

  title: {
    ...typography.title,
    color: colors.text,
  },

  step: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
