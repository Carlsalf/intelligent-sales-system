import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Screen } from '@/src/components/Screen';
import { useAuth } from '@/src/context/AuthContext';
import { colors, radius, spacing } from '@/src/theme/tokens';

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function passwordErrors(value: string) {
  const errors: string[] = [];

  if (value.length < 8) errors.push('8 caracteres');
  if (!/[a-z]/.test(value)) errors.push('una minúscula');
  if (!/[A-Z]/.test(value)) errors.push('una mayúscula');
  if (!/\d/.test(value)) errors.push('un número');

  return errors;
}

export default function RegisterScreen() {
  const { register } = useAuth();
  const { redirect } = useLocalSearchParams<{
    redirect?: string;
  }>();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [touched, setTouched] = useState({
    nombre: false,
    email: false,
    telefono: false,
    password: false,
    confirmPassword: false,
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const normalizedName = normalizeName(nombre);
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(telefono);

  const passwordRequirements = passwordErrors(password);

  const errors = {
    nombre:
      normalizedName.length < 2
        ? 'Introduce tu nombre y apellidos.'
        : '',

    email:
      !validEmail(normalizedEmail)
        ? 'Introduce un correo electrónico válido.'
        : '',

    telefono:
      normalizedPhone &&
      (normalizedPhone.length < 9 || normalizedPhone.length > 15)
        ? 'El teléfono debe contener entre 9 y 15 dígitos.'
        : '',

    password:
      passwordRequirements.length > 0
        ? `Falta: ${passwordRequirements.join(', ')}.`
        : '',

    confirmPassword:
      confirmPassword !== password
        ? 'Las contraseñas no coinciden.'
        : '',
  };

  const formValid = useMemo(
    () =>
      !errors.nombre &&
      !errors.email &&
      !errors.telefono &&
      !errors.password &&
      !errors.confirmPassword &&
      Boolean(confirmPassword),
    [
      errors.nombre,
      errors.email,
      errors.telefono,
      errors.password,
      errors.confirmPassword,
      confirmPassword,
    ],
  );

  async function submit() {
    setTouched({
      nombre: true,
      email: true,
      telefono: true,
      password: true,
      confirmPassword: true,
    });

    if (!formValid) return;

    try {
      setSubmitting(true);
      setError('');

      await register({
        nombre: normalizedName,
        email: normalizedEmail,
        telefono: normalizedPhone || undefined,
        password,
      });

      if (redirect) {
        router.replace(redirect as never);
        return;
      }

      router.replace('/(tabs)/account');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear la cuenta',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function fieldError(
    key: keyof typeof touched,
    message: string,
  ) {
    if (!touched[key] || !message) return null;

    return <Text style={styles.fieldError}>{message}</Text>;
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <Text style={styles.kicker}>NUEVO CLIENTE</Text>

            <Text style={styles.title}>
              Crea tu cuenta
            </Text>

            <Text style={styles.subtitle}>
              Regístrate directamente desde la aplicación.
              No necesitas intervención del Centro de Administración.
            </Text>

            <View>
              <TextInput
                style={[
                  styles.input,
                  touched.nombre &&
                    errors.nombre &&
                    styles.inputError,
                ]}
                value={nombre}
                onChangeText={setNombre}
                onBlur={() =>
                  setTouched((current) => ({
                    ...current,
                    nombre: true,
                  }))
                }
                placeholder="Nombre y apellidos"
                autoCapitalize="words"
                textContentType="name"
              />

              {fieldError('nombre', errors.nombre)}
            </View>

            <View>
              <TextInput
                style={[
                  styles.input,
                  touched.email &&
                    errors.email &&
                    styles.inputError,
                ]}
                value={email}
                onChangeText={setEmail}
                onBlur={() =>
                  setTouched((current) => ({
                    ...current,
                    email: true,
                  }))
                }
                placeholder="Correo electrónico"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
              />

              {fieldError('email', errors.email)}
            </View>

            <View>
              <TextInput
                style={[
                  styles.input,
                  touched.telefono &&
                    errors.telefono &&
                    styles.inputError,
                ]}
                value={telefono}
                onChangeText={(value) =>
                  setTelefono(normalizePhone(value))
                }
                onBlur={() =>
                  setTouched((current) => ({
                    ...current,
                    telefono: true,
                  }))
                }
                placeholder="Teléfono (opcional)"
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                maxLength={15}
              />

              {fieldError('telefono', errors.telefono)}
            </View>

            <View>
              <TextInput
                style={[
                  styles.input,
                  touched.password &&
                    errors.password &&
                    styles.inputError,
                ]}
                value={password}
                onChangeText={setPassword}
                onBlur={() =>
                  setTouched((current) => ({
                    ...current,
                    password: true,
                  }))
                }
                placeholder="Contraseña"
                secureTextEntry
                textContentType="newPassword"
              />

              {fieldError('password', errors.password)}
            </View>

            <View>
              <TextInput
                style={[
                  styles.input,
                  touched.confirmPassword &&
                    errors.confirmPassword &&
                    styles.inputError,
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onBlur={() =>
                  setTouched((current) => ({
                    ...current,
                    confirmPassword: true,
                  }))
                }
                placeholder="Confirmar contraseña"
                secureTextEntry
                textContentType="newPassword"
              />

              {fieldError(
                'confirmPassword',
                errors.confirmPassword,
              )}
            </View>

            <Text style={styles.hint}>
              Mínimo 8 caracteres, con mayúscula, minúscula y número.
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={[
                styles.primary,
                (!formValid || submitting) &&
                  styles.disabled,
              ]}
              disabled={!formValid || submitting}
              onPress={submit}
            >
              <Text style={styles.primaryText}>
                {submitting
                  ? 'Creando cuenta…'
                  : 'Crear cuenta'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.replace({
                  pathname: '/(auth)/login',
                  params: redirect
                    ? { redirect }
                    : undefined,
                })
              }
            >
              <Text style={styles.link}>
                Ya tengo cuenta
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },

  form: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },

  kicker: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.1,
  },

  title: {
    fontSize: 30,
    color: colors.text,
    fontWeight: '800',
  },

  subtitle: {
    color: colors.muted,
    lineHeight: 22,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },

  inputError: {
    borderColor: colors.danger,
  },

  fieldError: {
    marginTop: spacing.xxs,
    color: colors.danger,
    fontSize: 12,
  },

  hint: {
    color: colors.muted,
    fontSize: 12,
  },

  primary: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },

  primaryText: {
    color: '#FFF',
    fontWeight: '800',
  },

  disabled: {
    opacity: 0.45,
  },

  link: {
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
  },

  errorBox: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#FEF2F2',
  },

  error: {
    color: colors.danger,
  },
});
