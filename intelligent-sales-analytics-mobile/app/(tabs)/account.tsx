import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/src/context/AuthContext';

import {
  colors,
  radius,
  spacing,
} from '@/src/theme/tokens';

function initials(value?: string | null) {
  if (!value) {
    return 'GE';
  }

  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join('');
}

function roleLabel(value?: string | null) {
  if (!value) {
    return 'Usuario';
  }

  const normalized = value.toLowerCase();

  if (normalized === 'gerente') {
    return 'Gerencia';
  }

  if (normalized === 'admin') {
    return 'Administración';
  }

  return value;
}

export default function AccountScreen() {
  const {
    user,
    logout,
  } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Deseas salir del Centro de Operaciones?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            void logout();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>
            INTELLIGENT SALES
          </Text>

          <Text style={styles.title}>
            Perfil
          </Text>

          <Text style={styles.subtitle}>
            Identidad y acceso al Centro de Operaciones
          </Text>
        </View>

        <View style={styles.identityCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {initials(user?.nombre)}
            </Text>
          </View>

          <View style={styles.identityInfo}>
            <Text style={styles.name}>
              {user?.nombre ?? 'Usuario'}
            </Text>

            <Text style={styles.email}>
              {user?.email ?? 'Sin correo'}
            </Text>

            <View style={styles.roleBadge}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color="#15803D"
              />

              <Text style={styles.roleText}>
                {roleLabel(user?.rol)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Acceso corporativo
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="person-outline"
                size={19}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Usuario
              </Text>

              <Text style={styles.infoValue}>
                {user?.nombre ?? 'No disponible'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="mail-outline"
                size={19}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Correo
              </Text>

              <Text style={styles.infoValue}>
                {user?.email ?? 'No disponible'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="business-outline"
                size={19}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Rol
              </Text>

              <Text style={styles.infoValue}>
                {roleLabel(user?.rol)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIcon}>
              <Ionicons
                name="cloud-done-outline"
                size={22}
                color="#16A34A"
              />
            </View>

            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>
                Sesión protegida
              </Text>

              <Text style={styles.statusText}>
                Acceso autenticado mediante token seguro.
              </Text>
            </View>

            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>
                Activa
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.systemCard}>
          <Text style={styles.sectionTitle}>
            Sistema
          </Text>

          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>
              Aplicación
            </Text>

            <Text style={styles.systemValue}>
              Intelligent Sales Analytics
            </Text>
          </View>

          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>
              Entorno
            </Text>

            <Text style={styles.systemValue}>
              Centro de Operaciones
            </Text>
          </View>

          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>
              Plataforma
            </Text>

            <Text style={styles.systemValue}>
              iOS
            </Text>
          </View>
        </View>

        <View
          style={styles.logoutButton}
          onTouchEnd={handleLogout}
        >
          <View style={styles.logoutIcon}>
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#B91C1C"
            />
          </View>

          <Text style={styles.logoutText}>
            Cerrar sesión
          </Text>
        </View>

        <Text style={styles.footerNote}>
          El acceso a esta aplicación está restringido a
          usuarios autorizados de gerencia y administración.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 42,
    gap: spacing.lg,
  },

  header: {
    gap: 4,
  },

  brand: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  title: {
    color: colors.text,
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.lg,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
  },

  avatarText: {
    color: '#2563EB',
    fontSize: 25,
    fontWeight: '900',
  },

  identityInfo: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
  },

  email: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  roleBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.sm,
    backgroundColor: '#ECFDF3',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  roleText: {
    color: '#15803D',
    fontSize: 10.5,
    fontWeight: '800',
  },

  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: spacing.lg,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: colors.textSecondary,
    fontSize: 10.5,
  },

  infoValue: {
    color: colors.text,
    fontSize: 12.5,
    fontWeight: '800',
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF2F6',
  },

  statusCard: {
    backgroundColor: '#ECFDF3',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#CFEFD9',
    padding: spacing.lg,
  },

  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '900',
  },

  statusText: {
    color: colors.textSecondary,
    fontSize: 10.5,
    marginTop: 3,
  },

  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },

  onlineText: {
    color: '#15803D',
    fontSize: 9.5,
    fontWeight: '800',
  },

  systemCard: {
    backgroundColor: '#F7F5FF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E5E0FF',
    padding: spacing.lg,
    gap: spacing.sm,
  },

  systemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 5,
  },

  systemLabel: {
    color: colors.textSecondary,
    fontSize: 10.5,
  },

  systemValue: {
    flex: 1,
    color: colors.text,
    fontSize: 10.5,
    fontWeight: '800',
    textAlign: 'right',
  },

  logoutButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
  },

  logoutIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },

  logoutText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '900',
  },

  footerNote: {
    color: '#64748B',
    fontSize: 9.5,
    lineHeight: 14,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
