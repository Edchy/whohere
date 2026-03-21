import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../hooks/useColors';
import { useGameStore } from '../store/gameStore';
import AppHeader from './AppHeader';

interface Props {
  children: React.ReactNode;
  mainStyle?: object;
  backgroundColor?: string;
  showHeader?: boolean;
  noTopInset?: boolean;
}

export default function ScreenLayout({ children, mainStyle, backgroundColor, showHeader = true, noTopInset = false }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useGameStore((s) => s.colorScheme);
  const glowOpacity = colorScheme === 'dark' ? '35' : '80';

  return (
    <View style={{ flex: 1, backgroundColor: backgroundColor ?? colors.bgPrimary, paddingTop: noTopInset ? 0 : insets.top }}>
      {/* Brand glow corners, native only */}
      {!backgroundColor && Platform.OS !== 'web' && (
        <>
          <LinearGradient
            colors={[colors.accent + glowOpacity, colors.accent + '10', 'transparent']}
            locations={[0, 0.4, 0.8]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0.2, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
          <LinearGradient
            colors={[colors.accent + glowOpacity, colors.accent + '10', 'transparent']}
            locations={[0, 0.4, 0.8]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0.8, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        </>
      )}
      {showHeader && <AppHeader />}
      <View style={[{ flex: 1 }, mainStyle]}>
        {children}
      </View>
    </View>
  );
}
