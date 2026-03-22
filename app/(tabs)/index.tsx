import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
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
    label: "On a date",
    sublabel: "Lär känna varandra genom att betrakta andra.",
  },
  {
    id: "group",
    label: "With frens",
    sublabel: "Fantasi och intuition i en ohelig kombination.",
  },
  {
    id: "solo",
    label: "Riding solo",
    sublabel: "Upptäck din inre värld genom utblickar och insikter.",
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
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
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
      lineHeight: 24,
      color: colors.textPrimary,
    },
    rowSublabel: {
      ...typography.caption,
      opacity: 0.8,
      color: colors.textSecondary,
    },
  });
}

function ModeRow({ mode, colors }: { mode: (typeof MODES)[0]; colors: AppColors }) {
  const router = useRouter();
  const colorScheme = useGameStore((s) => s.colorScheme);
  const styles = makeStyles(colors);
  const opacity = useRef(new Animated.Value(1)).current;

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
    <Animated.View style={{ opacity }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push(`/play/categories?mode=${mode.id}`)}
        style={styles.row}
      >
        {Platform.OS !== 'web' && colorScheme === 'dark' && (
          <BlurView style={StyleSheet.absoluteFillObject} intensity={20} tint="dark" />
        )}
        {colorScheme === 'light' && (
          <>
            <LinearGradient
              colors={[colors.accent + '15', 'transparent']}
              locations={[0, 0.6]}
              start={{ x: 1, y: 0 }}
              end={{ x: 0.2, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <LinearGradient
              colors={[colors.accent + '15', 'transparent']}
              locations={[0, 0.6]}
              start={{ x: 0, y: 1 }}
              end={{ x: 0.8, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </>
        )}
        <View style={styles.rowInner}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{mode.label}</Text>
            <Text style={styles.rowSublabel}>{mode.sublabel}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <View style={styles.modeList}>
          {MODES.map((mode) => (
            <ModeRow key={mode.id} mode={mode} colors={colors} />
          ))}
        </View>
      </View>
    </ScreenLayout>
  );
}
