import {
  useState,
} from 'react';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  router,
} from 'expo-router';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useAuth,
} from '@/src/context/AuthContext';

import {
  colors,
  radius,
  spacing,
  typography,
} from '@/src/theme/tokens';

export default function LoginScreen() {
  const {
    login,
  } = useAuth();

  const [email, setEmail] =
    useState('gerente@pyme.com');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  async function handleLogin() {
    if (
      !email.trim() ||
      !password
    ) {
      setError(
        'Introduce tu correo y contraseña.',
      );
      return;
    }

    try {
      setLoading(true);
      setError('');

      await login(
        email,
        password,
      );

      router.replace(
        '/(tabs)',
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible iniciar sesión.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        style={styles.keyboard}
      >
        <View style={styles.container}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>
                IS
              </Text>
            </View>

            <Text style={styles.brandName}>
              Intelligent Sales
            </Text>

            <Text style={styles.brandArea}>
              Centro de Operaciones
            </Text>
          </View>

          <View style={styles.heading}>
            <Text style={styles.title}>
              Visión ejecutiva
            </Text>

            <Text style={styles.description}>
              Accede a indicadores comerciales,
              tendencias y recomendaciones para
              apoyar la toma de decisiones.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>
                Correo corporativo
              </Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="gerente@pyme.com"
                placeholderTextColor={
                  colors.muted
                }
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Contraseña
              </Text>

              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                placeholder="Introduce tu contraseña"
                placeholderTextColor={
                  colors.muted
                }
                style={styles.input}
                onSubmitEditing={() =>
                  void handleLogin()
                }
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Pressable
              disabled={loading}
              onPress={() =>
                void handleLogin()
              }
              style={({ pressed }) => [
                styles.button,
                pressed &&
                  styles.buttonPressed,
                loading &&
                  styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  color={colors.white}
                />
              ) : (
                <Text style={styles.buttonText}>
                  Acceder al centro
                </Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.footnote}>
            Acceso restringido a gerencia y
            administración.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    keyboard: {
      flex: 1,
    },

    container: {
      flex: 1,
      justifyContent:
        'center',
      paddingHorizontal:
        spacing.xl,
      gap: spacing.xl,
    },

    brand: {
      alignItems: 'center',
      gap: spacing.xs,
    },

    logo: {
      width: 66,
      height: 66,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        colors.primary,
      marginBottom: spacing.sm,
    },

    logoText: {
      fontSize: 23,
      fontWeight: '900',
      color: colors.white,
      letterSpacing: 1,
    },

    brandName: {
      ...typography.subtitle,
      color: colors.text,
    },

    brandArea: {
      ...typography.caption,
      color:
        colors.textSecondary,
      textTransform:
        'uppercase',
      letterSpacing: 1,
      fontWeight: '700',
    },

    heading: {
      gap: spacing.sm,
    },

    title: {
      ...typography.headline,
      color: colors.text,
      textAlign: 'center',
    },

    description: {
      ...typography.body,
      color:
        colors.textSecondary,
      textAlign: 'center',
    },

    form: {
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius:
        radius.xl,
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    field: {
      gap: spacing.xs,
    },

    label: {
      ...typography.bodyStrong,
      color: colors.text,
    },

    input: {
      minHeight: 54,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.md,
      paddingHorizontal:
        spacing.md,
      backgroundColor:
        colors.background,
      color: colors.text,
      fontSize: 16,
    },

    errorBox: {
      padding:
        spacing.sm,
      borderRadius:
        radius.md,
      backgroundColor:
        '#FFF1F1',
    },

    errorText: {
      ...typography.caption,
      color: colors.danger,
    },

    button: {
      minHeight: 56,
      borderRadius:
        radius.md,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        colors.primary,
      marginTop:
        spacing.xs,
    },

    buttonPressed: {
      opacity: 0.88,
    },

    buttonDisabled: {
      opacity: 0.65,
    },

    buttonText: {
      ...typography.button,
      color: colors.white,
    },

    footnote: {
      ...typography.caption,
      color:
        colors.textSecondary,
      textAlign: 'center',
    },
  });
