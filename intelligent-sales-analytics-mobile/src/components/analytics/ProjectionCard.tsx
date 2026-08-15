import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  colors,
  radius,
  spacing,
} from '@/src/theme/tokens';

type Props = {
  value: string;
  method: string;
};

export function ProjectionCard({
  value,
  method,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="analytics-outline"
            size={22}
            color="#4F46E5"
          />
        </View>

        <View style={styles.titleArea}>
          <Text style={styles.title}>
            Proyección comercial
          </Text>

          <Text style={styles.value}>
            {value}
          </Text>

          <Text style={styles.caption}>
            Estimación para el siguiente periodo
          </Text>
        </View>
      </View>

      <View style={styles.methodBox}>
        <View style={styles.methodHeading}>
          <Ionicons
            name="information-circle-outline"
            size={15}
            color="#6D5CE7"
          />

          <Text style={styles.methodLabel}>
            Método de cálculo
          </Text>
        </View>

        <Text style={styles.methodValue}>
          {method.replace(/\.$/, '')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F7F5FF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E5E0FF',
    padding: spacing.lg,
    gap: spacing.md,
  },

  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleArea: {
    flex: 1,
  },

  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },

  value: {
    color: '#4338CA',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    marginTop: 3,
  },

  caption: {
    color: colors.textSecondary,
    fontSize: 10.5,
    marginTop: 2,
  },

  methodBox: {
    backgroundColor:
      'rgba(255,255,255,0.72)',
    borderRadius: radius.md,
    padding: spacing.sm,
  },

  methodHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  methodLabel: {
    color: '#6D5CE7',
    fontSize: 10,
    fontWeight: '800',
  },

  methodValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
});
