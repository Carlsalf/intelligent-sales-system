import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/src/context/AuthContext';
import { CartProvider } from '@/src/context/CartContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="product/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="checkout/delivery"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="checkout/address"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="checkout/review"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="checkout/payment"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="checkout/success"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="order/[id]"
          options={{ headerShown: false }}
        />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
