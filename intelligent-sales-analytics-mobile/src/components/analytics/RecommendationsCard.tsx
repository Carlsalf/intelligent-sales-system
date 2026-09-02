import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing } from '@/src/theme/tokens';

type Props = {
  items: string[];
};

const configurations = [
  {
    icon: 'cube-outline' as const,
    color: '#16A34A',
    soft: '#ECFDF3',
  },
  {
    icon: 'clipboard-outline' as const,
    color: '#D97706',
    soft: '#FFF7E6',
  },
  {
    icon: 'analytics-outline' as const,
    color: '#7C3AED',
    soft: '#F5F3FF',
  },
];

export function RecommendationsCard({
  items,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Recomendaciones
      </Text>

      <Text style={styles.caption}>
        Sugerencias basadas en la información comercial
      </Text>

      <View style={styles.list}>
        {items.map((item, index) => {
          const config =
            configurations[index % configurations.length];

          return (
            <View
              key={`${index}-${item}`}
              style={[
                styles.row,
                index < items.length - 1 &&
                  styles.rowBorder,
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: config.soft,
                  },
                ]}
              >
                <Ionicons
                  name={config.icon}
                  size={19}
                  color={config.color}
                />
              </View>

              <Text style={styles.text}>
                {item}
              </Text>

            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.lg,
  },

  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },

  caption: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  list: {
    marginTop: spacing.md,
  },

  row: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
