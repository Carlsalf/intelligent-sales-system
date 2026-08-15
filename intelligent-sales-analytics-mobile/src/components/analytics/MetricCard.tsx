import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing } from '@/src/theme/tokens';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  subtitle: string;
  accent?: 'blue' | 'green';
  progress?: number;
};

export function MetricCard({
  icon,
  title,
  value,
  subtitle,
  accent = 'blue',
  progress,
}: Props) {
  const accentColor =
    accent === 'green'
      ? '#16A34A'
      : '#2563EB';

  const soft =
    accent === 'green'
      ? '#ECFDF3'
      : '#EFF6FF';

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: soft },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={accentColor}
        />
      </View>

      <Text style={styles.title}>
        {title}
      </Text>

      <Text
        style={[
          styles.value,
          accent === 'green' && {
            color: '#15803D',
          },
        ]}
      >
        {value}
      </Text>

      <Text style={styles.subtitle}>
        {subtitle}
      </Text>

      {typeof progress === 'number' ? (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressValue,
              {
                width: `${Math.min(
                  Math.max(progress, 0),
                  100,
                )}%`,
                backgroundColor: accentColor,
              },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 158,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  title: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  value: {
    marginTop: 5,
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 11,
  },

  progressTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    marginTop: 12,
    overflow: 'hidden',
  },

  progressValue: {
    height: '100%',
    borderRadius: 999,
  },
});
