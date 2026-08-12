import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/radius';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar',
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        focused && styles.containerFocused,
      ]}
    >
      <Text style={styles.icon}>⌕</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.input}
      />

      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpiar búsqueda"
          onPress={() => onChangeText('')}
          hitSlop={10}
          style={styles.clearButton}
        >
          <Text style={styles.clearText}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  containerFocused: {
    borderColor: colors.primary,
  },
  icon: {
    fontSize: 25,
    color: colors.textSecondary,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingVertical: 0,
  },
  clearButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
  },
  clearText: {
    color: colors.textSecondary,
    fontSize: 22,
    lineHeight: 24,
  },
});
