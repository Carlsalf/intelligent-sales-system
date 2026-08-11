import { useState } from 'react';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/context/AuthContext';
import { colors, radius, spacing } from '@/src/theme/tokens';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await register({ nombre: nombre.trim(), email: email.trim(), telefono: telefono.trim() || undefined, password });
      router.replace('/(tabs)/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Text style={styles.kicker}>NUEVO CLIENTE</Text>
            <Text style={styles.title}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>Regístrate directamente desde la aplicación. No necesitas intervención del Centro de Administración.</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre y apellidos" />
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Correo electrónico" autoCapitalize="none" keyboardType="email-address" />
            <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} placeholder="Teléfono (opcional)" keyboardType="phone-pad" />
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Contraseña" secureTextEntry />
            <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirmar contraseña" secureTextEntry />
            <Text style={styles.hint}>Mínimo 8 caracteres, con mayúscula, minúscula y número.</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable style={[styles.primary, submitting && styles.disabled]} disabled={submitting} onPress={submit}><Text style={styles.primaryText}>{submitting ? 'Creando cuenta…' : 'Crear cuenta'}</Text></Pressable>
            <Pressable onPress={() => router.replace('/(auth)/login')}><Text style={styles.link}>Ya tengo cuenta</Text></Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({ container: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg }, form: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md }, kicker: { color: colors.primary, fontWeight: '800', fontSize: 12, letterSpacing: 1.1 }, title: { fontSize: 30, color: colors.text, fontWeight: '800' }, subtitle: { color: colors.muted, lineHeight: 22 }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, fontSize: 16, color: colors.text }, hint: { color: colors.muted, fontSize: 12 }, primary: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' }, primaryText: { color: '#FFF', fontWeight: '800' }, disabled: { opacity: 0.6 }, link: { color: colors.primary, fontWeight: '700', textAlign: 'center' }, error: { color: colors.danger } });
