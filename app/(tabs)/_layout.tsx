import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../src/constants/theme';

const ICONS: Record<string, [string, string]> = {
  index:    ['play-outline',         'play'],
  decks:    ['layers-outline',       'layers'],
  settings: ['settings-outline',     'settings'],
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={tabStyles.bar}>
      {state.routes
        .map((route: any) => {
          const focused = state.routes[state.index]?.key === route.key;
          const { options } = descriptors[route.key];
          const label: string = options.title ?? route.name;
          const [iconOff, iconOn] = ICONS[route.name] ?? ['ellipse-outline', 'ellipse'];

          return (
            <TouchableOpacity
              key={route.key}
              style={tabStyles.tab}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.7}
            >
              <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
                <Ionicons
                  name={(focused ? iconOn : iconOff) as any}
                  size={22}
                  color={focused ? colors.accent : colors.textMuted}
                />
              </View>
              <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
                {label}
              </Text>
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
      <Tabs.Screen name="index" options={{ title: 'Play' }} />
      <Tabs.Screen name="decks" options={{ title: 'Decks' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
    marginBottom: 24,
    paddingBottom: 12,
    paddingTop: 12,
    paddingHorizontal: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 0,
  },
  iconWrap: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {},
  label: {
    fontSize: 9,
    fontWeight: '500',
    lineHeight: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: colors.accent,
  },
});
