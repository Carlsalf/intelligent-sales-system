import {
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme/tokens';

type CategoryChipsProps = {
  categories: string[];
  selected?: string;
  onSelect: (category: string) => void;
};

export function CategoryChips({
  categories,
  selected = '',
  onSelect,
}: CategoryChipsProps) {
  const items = ['Todos', ...categories];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {items.map((category) => {
        const value = category === 'Todos' ? '' : category;
        const active = selected === value;

        return (
          <Pressable
            key={category}
            onPress={() => onSelect(value)}
            style={[
              styles.chip,
              active && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.label,
                active && styles.labelActive,
              ]}
            >
              {category}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  labelActive: {
    color: colors.white,
  },
});
