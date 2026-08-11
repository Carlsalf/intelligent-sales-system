import { StyleSheet, Text } from 'react-native';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';

type PriceProps = {
  value: number;
};

export function Price({ value }: PriceProps) {
  return (
    <Text style={styles.price}>
      {new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
      }).format(value)}
    </Text>
  );
}

const styles = StyleSheet.create({
  price: {
    ...typography.title,
    color: colors.text,
  },
});
