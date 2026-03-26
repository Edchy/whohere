import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PlayArrowSvg from '../../assets/icons/noun-arrow-8300346.svg';
import LayersSvg from '../../assets/icons/noun-pattern-8300370.svg';
import AsteriskSvg from '../../assets/icons/noun-asterisk-8300387.svg';
import { AppColors, radius, spacing, typography } from '../../src/constants/theme';
import { useColors } from '../../src/hooks/useColors';
import { useGameStore } from '../../src/store/gameStore';

// Persists across mounts so the fade only plays once per app session
let hasAnimatedIn = false;

const ICONS: Record<string, [string, string]> = {
  index:    ['play-outline',     'play'],
  decks:    ['layers-outline',   'layers'],
  settings: ['settings-outline', 'settings'],
};

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    // Outer wrapper — floats over screen content, passes touches through transparent area
    barWrapper: {
      position: 'absolute',
      bottom: 28,
      left: spacing.lg,
      right: spacing.lg,
    },
    // The visible pill — clips blur + overlays to rounded shape
    barContainer: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.accent + '59', // ~35% opacity
    },
    // Thin bright line at the very top of the pill for a glass-rim highlight
    topHighlight: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.textPrimary + '2E',
    },
    // Row that holds the actual tab buttons
    tabsRow: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: spacing.md,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      gap: 0,
    },
    iconWrap: {
      width: 44,
      height: 44,
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
  const colorScheme = useGameStore((s) => s.colorScheme);
  const tabStyles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={tabStyles.barWrapper} pointerEvents="box-none">
      <View style={tabStyles.barContainer}>
        {/* Frosted glass base */}
        {Platform.OS !== 'web' && (
          <BlurView style={StyleSheet.absoluteFillObject} intensity={40} tint={colorScheme === 'dark' ? 'dark' : 'light'} />
        )}

        {/* Glass-rim highlight at top edge */}
        <View style={tabStyles.topHighlight} />

        {/* Tab buttons row */}
        <View style={tabStyles.tabsRow}>
          {state.routes.map((route: any) => {
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
                accessibilityLabel={label}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
              >
                <View style={tabStyles.iconWrap}>
                  {route.name === 'index' ? (
                    <PlayArrowSvg
                      width={16}
                      height={16}
                      fill={focused ? colors.accent : colors.textMuted}
                    />
                  ) : route.name === 'decks' ? (
                    <LayersSvg
                      width={22}
                      height={22}
                      fill={focused ? colors.accent : colors.textMuted}
                    />
                  ) : route.name === 'settings' ? (
                    <AsteriskSvg
                      width={22}
                      height={22}
                      fill={focused ? colors.accent : colors.textMuted}
                    />
                  ) : (
                    <Ionicons
                      name={(focused ? iconOn : iconOff) as any}
                      size={22}
                      color={focused ? colors.accent : colors.textMuted}
                    />
                  )}
                </View>
                <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const opacity = useRef(new Animated.Value(hasAnimatedIn ? 1 : 0)).current;

  useEffect(() => {
    if (hasAnimatedIn) return;
    hasAnimatedIn = true;
    Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{ flex: 1, opacity }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
      >
        <Tabs.Screen name="index" options={{ title: 'Play' }} />
        <Tabs.Screen name="decks" options={{ title: 'Decks' }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      </Tabs>
    </Animated.View>
  );
}
