import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShadowVisible: false, tabBarHideOnKeyboard: true }}>
      <Tabs.Screen name="index" options={{ title: 'Tienda', headerTitle: 'Intelligent Sales Store' }} />
      <Tabs.Screen name="cart" options={{ title: 'Carrito', headerTitle: 'Mi carrito' }} />
      <Tabs.Screen name="account" options={{ title: 'Cuenta', headerTitle: 'Mi cuenta' }} />
    </Tabs>
  );
}
