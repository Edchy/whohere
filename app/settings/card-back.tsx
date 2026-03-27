import { router } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../../src/hooks/useColors';
import AppHeader from '../../src/components/AppHeader';

export default function CardBackPickerScreen() {
  const colors = useColors();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <AppHeader onBack={() => router.back()} />
    </SafeAreaView>
  );
}
