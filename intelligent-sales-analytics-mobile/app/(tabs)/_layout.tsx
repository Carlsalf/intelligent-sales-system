import {
  Redirect,
  Tabs,
} from 'expo-router';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useAuth,
} from '@/src/context/AuthContext';

import {
  colors,
} from '@/src/theme/tokens';

export default function TabsLayout() {
  const {
    isLoading,
    isAuthenticated,
  } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Redirect
        href="/(auth)/login"
      />
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:
          colors.primary,
        tabBarInactiveTintColor:
          colors.muted,
        tabBarHideOnKeyboard:
          true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Resumen',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="stats-chart-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="operations"
        options={{
          title: 'Operaciones',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="receipt-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
