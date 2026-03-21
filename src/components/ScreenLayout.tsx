import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../hooks/useColors';
import AppHeader from './AppHeader';

interface Props {
  children: React.ReactNode;
  /** Override the default flex:1 main area, e.g. for scroll screens */
  mainStyle?: object;
  /** Override the background color */
  backgroundColor?: string;
  /** Hide the AppHeader/mascot (default: true) */
  showHeader?: boolean;
  /** Skip safe area top inset (e.g. for modals where the handle sits at the very top) */
  noTopInset?: boolean;
}

export default function ScreenLayout({ children, mainStyle, backgroundColor, showHeader = true, noTopInset = false }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: backgroundColor ?? colors.bgPrimary, paddingTop: noTopInset ? 0 : insets.top }}>
      {showHeader && <AppHeader />}
      <View style={[{ flex: 1 }, mainStyle]}>
        {children}
      </View>
    </View>
  );
}
