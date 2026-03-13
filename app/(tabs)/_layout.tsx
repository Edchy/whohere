import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../src/constants/theme';

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={tabStyles.bar}>
      {state.routes.filter((route: any) => route.name !== 'settings').map((route: any) => {
        const { options } = descriptors[route.key];
        const focused = state.routes[state.index]?.key === route.key;
        const label: string = options.title ?? route.name;

        return (
          <TouchableOpacity
            key={route.key}
            style={tabStyles.tab}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.6}
          >
            <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
              {label}
            </Text>
            {focused && <View style={tabStyles.dot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Spela' }} />
      <Tabs.Screen name="decks" options={{ title: 'Kortlekar' }} />
      <Tabs.Screen name="settings" options={{ title: 'Inställningar' }} />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 28,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: 4,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: colors.accent,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
});
