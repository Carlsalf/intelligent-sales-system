import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '@/src/theme/colors';
import { elevation } from '@/src/theme/elevation';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';

type AppCardProps = PropsWithChildren<{
  style?: ViewStyle;
}>;

export function AppCard({ children, style }: AppCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.sm,
  },
});
