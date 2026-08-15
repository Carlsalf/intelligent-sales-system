import { StyleSheet, Text, View } from 'react-native';

import {
  colors,
  radius,
  spacing,
} from '@/src/theme/tokens';

type RankingItem = {
  label: string;
  value: string;
  secondary?: string;
};

type Props = {
  title: string;
  subtitle?: string;
  items: RankingItem[];
};

export function RankingCard({
  title,
  subtitle,
  items,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}

      <View style={styles.list}>
        {items.map((item, index) => (
          <View
            key={`${index}-${item.label}`}
            style={[
              styles.row,
              index < items.length - 1 &&
                styles.rowBorder,
            ]}
          >
            <View style={styles.rank}>
              <Text style={styles.rankText}>
                {index + 1}
              </Text>
            </View>

            <View style={styles.info}>
              <Text
                style={styles.label}
                numberOfLines={1}
              >
                {item.label}
              </Text>

              {item.secondary ? (
                <Text style={styles.secondary}>
                  {item.secondary}
                </Text>
              ) : null}
            </View>

            <Text
              style={styles.value}
              numberOfLines={1}
            >
              {item.value}
            </Text>
          </View>
        ))}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },

  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 3,
  },

  list: {
    marginTop: spacing.sm,
  },

  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 9,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },

  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rankText: {
    color: '#2563EB',
    fontWeight: '900',
    fontSize: 12,
  },

  info: {
    flex: 1,
    minWidth: 0,
  },

  label: {
    color: colors.text,
    fontSize: 12.5,
    fontWeight: '800',
  },

  secondary: {
    color: colors.textSecondary,
    fontSize: 10.5,
    marginTop: 2,
  },

  value: {
    color: colors.text,
    fontSize: 11.5,
    fontWeight: '900',
    textAlign: 'right',
    marginLeft: 6,
  },
});
