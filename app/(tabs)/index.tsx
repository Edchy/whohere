import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { animation, AppColors, radius, spacing, typography } from "../../src/constants/theme";
import ScreenLayout from "../../src/components/ScreenLayout";
import { useColors } from "../../src/hooks/useColors";
import deckIcons from "../../src/constants/deckIcons";

const MODES = [
  {
    id: "partner",
    label: "On a date",
    sublabel: "Lär känna varandra genom att betrakta andra.",
    svgIcon: "noun-wine-1064743",
  },
  {
    id: "group",
    label: "With frens",
    sublabel: "Fantasi och intuition i en ohelig kombination.",
    svgIcon: "noun-wine-3811155",
  },
  {
    id: "solo",
    label: "Riding solo",
    sublabel: "Upptäck din inre värld genom utblickar och insikter.",
    svgIcon: "noun-wine-glass-1047711",
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
    mascotWrap: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    modeList: {
      gap: spacing.sm,
    },
    row: {
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgSecondary,
    },
    rowInner: {
      flexDirection: "row",
      alignItems: "center",
    },
    rowIconWrap: {
      marginRight: spacing.md,
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

  const SvgIcon = deckIcons[mode.svgIcon];

  return (
    <Animated.View style={{ opacity }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push(`/play/categories?mode=${mode.id}`)}
        style={styles.row}
      >
        <View style={styles.rowInner}>
          {SvgIcon && (
            <View style={styles.rowIconWrap}>
              <SvgIcon width={40} height={40} fill={colors.textPrimary} />
            </View>
          )}
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
