import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../hooks/useColors';
import AppHeader from './AppHeader';

interface Props {
  children: React.ReactNode;
  /** Override the default flex:1 main area, e.g. for scroll screens */
  mainStyle?: object;
}

export default function ScreenLayout({ children, mainStyle }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <AppHeader />
      <View style={[{ flex: 1 }, mainStyle]}>
        {children}
      </View>
    </View>
  );
}
