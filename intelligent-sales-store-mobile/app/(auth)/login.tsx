import { useState } from 'react';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/context/AuthContext';
import { colors, radius, spacing } from '@/src/theme/tokens';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    try {
      setSubmitting(true);
      setError('');
      await login(email.trim(), password);
      router.replace('/(tabs)/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.form}>
          <Text style={styles.kicker}>INTELLIGENT SALES STORE</Text>
          <Text style={styles.title}>Bienvenido de nuevo</Text>
          <Text style={styles.subtitle}>Accede para continuar con tus pedidos y compras.</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Correo electrónico" autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Contraseña" secureTextEntry />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={[styles.primary, submitting && styles.disabled]} disabled={submitting} onPress={submit}><Text style={styles.primaryText}>{submitting ? 'Ingresando…' : 'Iniciar sesión'}</Text></Pressable>
          <Pressable onPress={() => router.replace('/(auth)/register')}><Text style={styles.link}>¿Aún no tienes cuenta? Crear cuenta</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: spacing.lg }, form: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md }, kicker: { color: colors.primary, fontWeight: '800', fontSize: 12, letterSpacing: 1.1 }, title: { fontSize: 30, color: colors.text, fontWeight: '800' }, subtitle: { color: colors.muted, lineHeight: 22 }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, fontSize: 16, color: colors.text }, primary: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' }, primaryText: { color: '#FFF', fontWeight: '800' }, disabled: { opacity: 0.6 }, link: { color: colors.primary, fontWeight: '700', textAlign: 'center' }, error: { color: colors.danger } });
