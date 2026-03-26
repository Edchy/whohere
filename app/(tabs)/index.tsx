import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { animation, AppColors, radius, spacing, typography } from "../../src/constants/theme";
import ScreenLayout from "../../src/components/ScreenLayout";
import { useColors } from "../../src/hooks/useColors";
import { useGameStore } from "../../src/store/gameStore";

const MODES = [
  {
    id: "partner",
    label: "På date",
    sublabel: "Lär känna varandra genom att betrakta andra.",
  },
  {
    id: "group",
    label: "Med vänner",
    sublabel: "Fantasi och intuition i en ohelig kombination.",
  },
  {
    id: "solo",
    label: "På egen hand",
    sublabel: "Få syn på dig själv genom utblickar och insikter.",
  },
];

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      gap: spacing.sm,
    },
    modeList: {
      gap: spacing.sm,
    },
    row: {
      overflow: 'hidden',
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.accent + '18',
    },
    rowInner: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    rowText: {
      flex: 1,
      gap: 2,
    },
    rowLabel: {
      ...typography.display,
      textTransform: 'uppercase',
    },
    rowSublabel: {
      ...typography.caption,
      color: colors.textSecondary,
    },
  });
}

function ModeRow({ mode, colors, index }: { mode: (typeof MODES)[0]; colors: AppColors; index: number }) {
  const router = useRouter();
  const colorScheme = useGameStore((s) => s.colorScheme);
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const opacity = useRef(new Animated.Value(1)).current;

  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceOpacity, {
        toValue: 1,
        duration: 300,
        delay: index * 80,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(entranceY, {
        toValue: 0,
        duration: 300,
        delay: index * 80,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn = () => {
    Animated.timing(opacity, {
      toValue: 0.75,
      duration: animation.press,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: animation.base,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ opacity: entranceOpacity, transform: [{ translateY: entranceY }] }}>
    <Animated.View style={{ opacity }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push(`/play/categories?mode=${mode.id}`)}
        style={styles.row}
        accessibilityLabel={`${mode.label} — ${mode.sublabel}`}
        accessibilityRole="button"
      >
        {Platform.OS !== 'web' && colorScheme === 'dark' && (
          <BlurView style={StyleSheet.absoluteFillObject} intensity={20} tint="dark" />
        )}
        {colorScheme === 'light' && (
          <>
            <LinearGradient
              colors={[colors.accent + '10', 'transparent']}
              locations={[0, 0.6]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0.2, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <LinearGradient
              colors={[colors.accent + '10', 'transparent']}
              locations={[0, 0.6]}
              start={{ x: 0, y: 1 }}
              end={{ x: 0.8, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </>
        )}
        <View style={styles.rowInner}>
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{mode.label}</Text>
            <Text style={styles.rowSublabel}>{mode.sublabel}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <View style={styles.modeList}>
          {MODES.map((mode, i) => (
            <ModeRow key={mode.id} mode={mode} colors={colors} index={i} />
          ))}
        </View>
      </View>
    </ScreenLayout>
  );
}
