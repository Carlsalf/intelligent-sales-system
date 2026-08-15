import {
  Redirect,
  Tabs,
} from 'expo-router';

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
        }}
      />

      <Tabs.Screen
        name="operations"
        options={{
          title: 'Operaciones',
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
}
