import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppColors, radius, spacing, typography } from '../../src/constants/theme';
import { useColors } from '../../src/hooks/useColors';

const ICONS: Record<string, [string, string]> = {
  index:    ['play-outline',         'play'],
  decks:    ['layers-outline',       'layers'],
  settings: ['settings-outline',     'settings'],
};

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.accent,
      backgroundColor: colors.bgPrimary,
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
    label: {
      ...typography.badge,
      fontSize: 9,
      lineHeight: 11,
      color: colors.textMuted,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    labelActive: {
      color: colors.accent,
    },
  });
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const colors = useColors();
  const tabStyles = makeStyles(colors);

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
              <View style={tabStyles.iconWrap}>
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
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{ flex: 1, opacity }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" options={{ title: 'Play' }} />
        <Tabs.Screen name="decks" options={{ title: 'Decks' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
    </Animated.View>
  );
}
