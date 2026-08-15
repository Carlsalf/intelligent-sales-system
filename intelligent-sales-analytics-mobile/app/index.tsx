import {
  Redirect,
} from 'expo-router';

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import {
  useAuth,
} from '@/src/context/AuthContext';

import {
  colors,
} from '@/src/theme/tokens';

export default function Index() {
  const {
    isLoading,
    isAuthenticated,
  } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <Redirect
      href={
        isAuthenticated
          ? '/(tabs)'
          : '/(auth)/login'
      }
    />
  );
}

const styles =
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        colors.background,
    },
  });
