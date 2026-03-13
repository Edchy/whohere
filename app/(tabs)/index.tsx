import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, spacing } from "../../src/constants/theme";
import ScreenLayout from "../../src/components/ScreenLayout";

const MODES = [
  {
    id: "partner",
    label: "På date",
    sublabel: "Lär känna varandra genom att betrakta andra.",
    color: colors.accent,
  },
  {
    id: "group",
    label: "Med vänner",
    sublabel: "Fantasi och intuition i en ohelig kombination.",
    color: colors.accent,
  },
  {
    id: "solo",
    label: "På egen hand",
    sublabel: "Upptäck din inre värld genom utblickar och insikter.",
    color: colors.accent,
  },
];

function ModeRow({ mode, index }: { mode: (typeof MODES)[0]; index: number }) {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(opacity, {
      toValue: 0.75,
      duration: 60,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const isLast = index === MODES.length - 1;

  return (
    <Animated.View style={{ opacity }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push(`/play/categories?mode=${mode.id}`)}
        style={[styles.row, { backgroundColor: mode.color }, !isLast && styles.rowGap]}
      >
        <View style={styles.rowInner}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{mode.label}</Text>
            <Text style={styles.rowSublabel}>{mode.sublabel}</Text>
          </View>
          <Text style={styles.rowArrow}>→</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  return (
    <ScreenLayout>
      <View style={styles.container}>
        <View style={styles.modeList}>
          {MODES.map((mode, index) => (
            <ModeRow key={mode.id} mode={mode} index={index} />
          ))}
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },

  modeList: {
    gap: spacing.sm,
  },

  row: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },

  rowGap: {},

  rowInner: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowText: {
    flex: 1,
    gap: 5,
  },

  rowLabel: {
    fontFamily: "Supreme-Extrabold",
    fontSize: 38,
    lineHeight: 48,
    letterSpacing: -1,
    color: colors.background,
  },

  rowSublabel: {
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.2,
    fontStyle: "italic",
    color: colors.background,
    opacity: 0.9,
  },

  rowArrow: {
    fontSize: 22,
    color: colors.background,
    opacity: 0.6,
  },
});
