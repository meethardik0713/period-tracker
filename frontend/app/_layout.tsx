import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../src/context/AppContext';
import PinLock from '../src/components/PinLock';
import { COLORS } from '../src/utils/colors';

function RootGate() {
  const { isLoading, isLocked } = useApp();

  if (isLoading) {
    return (
      <View style={styles.loading} testID="loading-screen">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (isLocked) {
    return <PinLock />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <RootGate />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
