import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/context/AuthContext';
import { colors, radius, spacing } from '@/src/theme/tokens';

export default function AccountScreen() {
  const { customer, isLoading, logout } = useAuth();

  if (isLoading) {
    return <Screen style={styles.center}><ActivityIndicator /></Screen>;
  }

  if (!customer) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.title}>Tu cuenta de compra</Text>
          <Text style={styles.text}>Inicia sesión para gestionar tus compras, direcciones y pedidos.</Text>
          <Pressable style={styles.primary} onPress={() => router.push('/(auth)/login')}><Text style={styles.primaryText}>Iniciar sesión</Text></Pressable>
          <Pressable style={styles.secondary} onPress={() => router.push('/(auth)/register')}><Text style={styles.secondaryText}>Crear cuenta</Text></Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>CLIENTE AUTENTICADO</Text>
        <Text style={styles.title}>{customer.nombre}</Text>
        <Text style={styles.text}>{customer.email}</Text>
        <Pressable style={styles.secondary} onPress={logout}><Text style={styles.secondaryText}>Cerrar sesión</Text></Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.lg },
  center: { alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
  eyebrow: { color: colors.success, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  text: { color: colors.muted, lineHeight: 22 },
  primary: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  primaryText: { color: '#FFF', fontWeight: '800' },
  secondary: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  secondaryText: { color: colors.text, fontWeight: '800' },
});
