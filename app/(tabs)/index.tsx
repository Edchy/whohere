import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { animation, colors, fonts, radius, spacing, typography } from "../../src/constants/theme";
import ScreenLayout from "../../src/components/ScreenLayout";

const MODES = [
  {
    id: "partner",
    label: "På date",
    sublabel: "Lär känna varandra genom att betrakta andra.",
    bg: "#000000",
    text: "#FFFFFF",
  },
  {
    id: "group",
    label: "Med vänner",
    sublabel: "Fantasi och intuition i en ohelig kombination.",
    bg: "#000000",
    text: "#FFFFFF",
  },
  {
    id: "solo",
    label: "På egen hand",
    sublabel: "Upptäck din inre värld genom utblickar och insikter.",
    bg: "#000000",
    text: "#FFFFFF",
  },
];

function ModeRow({ mode, index }: { mode: (typeof MODES)[0]; index: number }) {
  const router = useRouter();
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

  const isLast = index === MODES.length - 1;

  return (
    <Animated.View style={{ opacity }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push(`/play/categories?mode=${mode.id}`)}
        style={[styles.row, { backgroundColor: mode.bg }, !isLast && styles.rowGap]}
      >
        <View style={styles.rowInner}>
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: mode.text }]}>{mode.label}</Text>
            <Text style={[styles.rowSublabel, { color: mode.text }]}>{mode.sublabel}</Text>
          </View>
          <Text style={[styles.rowArrow, { color: mode.text }]}>→</Text>
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
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },

  modeList: {
    gap: spacing.sm,
  },

  row: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#333333',
  },

  rowGap: {},

  rowInner: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowText: {
    flex: 1,
    gap: 2,
  },

  rowLabel: {
    ...typography.display,
    textTransform: 'uppercase',
    lineHeight: 24,
  },

  rowSublabel: {
    ...typography.caption,
    opacity: 0.8,
  },

  rowArrow: {
    ...typography.body,
    opacity: 0.6,
  },
});
