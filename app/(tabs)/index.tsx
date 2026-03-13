import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius } from "../../src/constants/theme";
import AppHeader from "../../src/components/AppHeader";

const MODES = [
  {
    id: "partner",
    label: "På date",
    sublabel: "Lär känna varandra",
    number: "I",
    color: colors.datingTint,
  },
  {
    id: "group",
    label: "Med vänner",
    sublabel: "Fantasi och intuition",
    number: "II",
    color: colors.friendsTint,
  },
  {
    id: "solo",
    label: "På egen hand",
    sublabel: "Din inre värld",
    number: "III",
    color: colors.soloTint,
  },
];

function ModeRow({ mode, index }: { mode: (typeof MODES)[0]; index: number }) {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }),
      Animated.timing(opacity, { toValue: 0.7, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 0 }),
      Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push(`/play/categories?mode=${mode.id}`)}
        style={styles.modeRow}
      >
        {/* Roman numeral — floats left, very small, top-aligned */}
        <Text style={[styles.numeral, { color: mode.color }]}>{mode.number}</Text>

        {/* Main label — huge editorial type */}
        <View style={styles.modeTextBlock}>
          <Text style={styles.modeLabel} numberOfLines={1} adjustsFontSizeToFit>
            {mode.label}
          </Text>
          <Text style={[styles.modeSublabel, { color: mode.color }]}>
            {mode.sublabel}
          </Text>
        </View>

        {/* Thin separator, last item omitted */}
        {index < MODES.length - 1 && <View style={styles.separator} />}
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />
      <View style={styles.container}>

        {/* BOTTOM: Mode list */}
        <View style={styles.modesSection}>
          <Text style={styles.tagline}>
            Titta dig omkring.{"\n"}Välj någon. Diskutera varför.
          </Text>
          <Text style={styles.modesSectionLabel}>Välj ett läge</Text>
          <View style={styles.modesList}>
            {MODES.map((mode, i) => (
              <ModeRow key={mode.id} mode={mode} index={i} />
            ))}
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    justifyContent: "flex-end",
  },

  tagline: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    fontStyle: "italic",
    letterSpacing: 0.2,
  },

  // — Modes —
  modesSection: {
    gap: spacing.sm,
  },
  modesSectionLabel: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 2,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  modesList: {
    gap: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  modeRow: {
    paddingVertical: spacing.md,
    paddingRight: spacing.xs,
    position: "relative",
  },
  numeral: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  modeTextBlock: {
    gap: 2,
  },
  modeLabel: {
    fontFamily: "Tanker-Regular",
    fontSize: 44,
    lineHeight: 46,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  modeSublabel: {
    fontSize: 12,
    fontStyle: "italic",
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  separator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
