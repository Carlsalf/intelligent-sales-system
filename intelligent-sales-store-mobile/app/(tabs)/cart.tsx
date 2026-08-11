import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { colors, spacing } from '@/src/theme/tokens';

export default function CartScreen() {
  return (
    <Screen style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Tu carrito</Text>
        <Text style={styles.text}>En el siguiente bloque migraremos aquí la lógica real de carrito y checkout del storefront actual.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { padding: spacing.lg }, content: { gap: spacing.sm }, title: { fontSize: 28, fontWeight: '800', color: colors.text }, text: { color: colors.muted, lineHeight: 22 } });
