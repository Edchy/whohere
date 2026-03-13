import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius } from "../../src/constants/theme";
import AppHeader from "../../src/components/AppHeader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BTN = Math.round(SCREEN_WIDTH * 0.42);

const MODES = [
  {
    id: "partner",
    label: "På\ndate",
    sublabel: "Lär känna varandra genom att betrakta andra",
    color: colors.datingTint,
    alignSelf: "flex-start" as const,
    sublabelAlign: "flex-start" as const,
  },
  {
    id: "group",
    label: "Med\nvänner",
    sublabel: "Fantasi och intuition i en ohelig kombination",
    color: colors.friendsTint,
    alignSelf: "flex-end" as const,
    sublabelAlign: "flex-end" as const,
  },
  {
    id: "solo",
    label: "På egen\nhand",
    sublabel: "Upptäck din inre värld genom utblickar och insikter",
    color: colors.soloTint,
    alignSelf: "flex-start" as const,
    sublabelAlign: "flex-start" as const,
  },
];

function ModeButton({ mode }: { mode: (typeof MODES)[0] }) {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;
  const overlay = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 40,
        bounciness: 0,
      }),
      Animated.timing(overlay, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 4,
      }),
      Animated.timing(overlay, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={[styles.modeGroup, { alignSelf: mode.alignSelf }]}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={() => router.push(`/play/categories?mode=${mode.id}`)}
          style={[styles.btn, { backgroundColor: mode.color }]}
        >
          <Animated.View
            style={[styles.btnOverlay, { opacity: overlay }]}
            pointerEvents="none"
          />
          <Text style={styles.btnLabel}>{mode.label}</Text>
        </Pressable>
      </Animated.View>

      <Text style={[styles.sublabel, { alignSelf: mode.sublabelAlign }]}>
        {mode.sublabel}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />

      <View style={styles.container}>
        <View style={styles.buttonsColumn}>
          {MODES.map((mode) => (
            <ModeButton key={mode.id} mode={mode} />
          ))}
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
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },

  buttonsColumn: {
    gap: spacing.md,
  },

  modeGroup: {
    gap: spacing.xs,
  },

  btn: {
    width: BTN,
    height: BTN,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  btnOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderRadius: radius.full,
  },

  btnLabel: {
    fontFamily: "Tanker-Regular",
    fontSize: 30,
    lineHeight: 32,
    color: colors.background,
    letterSpacing: -0.5,
    textAlign: "center",
  },

  sublabel: {
    fontSize: 11,
    fontStyle: "italic",
    letterSpacing: 0.3,
    lineHeight: 15,
    color: colors.textSecondary,
  },
});
