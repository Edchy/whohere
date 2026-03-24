import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../hooks/useColors';
import { spacing } from '../constants/theme';

interface Props {
  children: React.ReactNode;
}

export default function ModalLayout({ children }: Props) {
  const colors = useColors();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <View style={{ alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.lg }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.accent + '60' }} />
      </View>
      {children}
    </SafeAreaView>
  );
}
