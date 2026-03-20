import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../hooks/useColors';
import AppHeader from './AppHeader';

interface Props {
  children: React.ReactNode;
  /** Override the default flex:1 main area, e.g. for scroll screens */
  mainStyle?: object;
  /** Safe area edges to inset (default: all). Pass ['bottom'] for modals. */
  edges?: React.ComponentProps<typeof SafeAreaView>['edges'];
}

export default function ScreenLayout({ children, mainStyle, edges }: Props) {
  const colors = useColors();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={edges}>
      <AppHeader />
      <View style={[{ flex: 1 }, mainStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
}
