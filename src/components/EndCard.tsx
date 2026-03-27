import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppColors, dimensions, fonts, radius, spacing, typography } from '../constants/theme';

type EndCardProps = {
  variant: 'paywall' | 'completion';
  onUnlock: () => void;
  onReplay: () => void;
  onHome: () => void;
  colors: AppColors;
};

function PulseMark({ style }: { style: object }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(scale, {
        toValue: 1.15,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.Text style={[style, { transform: [{ scale }] }]}>✦</Animated.Text>
  );
}

export function EndCard({ variant, onUnlock, onReplay, onHome, colors }: EndCardProps) {
  const s = makeStyles(colors);

  if (variant === 'paywall') {
    return (
      <View style={s.container}>
        <View style={s.content}>
          <Text style={s.mark}>✦</Text>
          <Text style={s.title}>Det finns fler kort.</Text>
        </View>
        <View style={s.actions}>
          <Pressable style={s.primaryBtn} onPress={onUnlock} accessibilityLabel="Lås upp premium — 69 kr" accessibilityRole="button">
            <Text style={s.primaryBtnText}>Lås upp — 69 kr</Text>
          </Pressable>
          <Pressable style={s.secondaryBtn} onPress={onHome} accessibilityLabel="Avsluta ändå" accessibilityRole="button">
            <Text style={s.secondaryBtnText}>Dra åt helvete</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.content}>
        <PulseMark style={s.mark} />
        <Text style={s.title}>Det var allt.</Text>
        <Text style={s.body}>Ni vet lite mer om varandra nu.</Text>
      </View>
      <View style={s.actions}>
        <Pressable style={s.primaryBtn} onPress={onReplay} accessibilityLabel="Spela igen" accessibilityRole="button">
          <Text style={s.primaryBtnText}>Spela igen</Text>
        </Pressable>
        <Pressable style={s.secondaryBtn} onPress={onHome} accessibilityLabel="Gå hem" accessibilityRole="button">
          <Text style={s.secondaryBtnText}>Gå hem</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.lg,
      justifyContent: 'space-between',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
    },
    mark: {
      fontSize: 32,
      color: colors.textOnCard,
    },
    title: {
      fontFamily: fonts.bold,
      fontSize: 24,
      lineHeight: 30,
      color: colors.textOnCard,
      textAlign: 'center',
      letterSpacing: -0.3,
    },
    body: {
      fontFamily: fonts.regular,
      fontSize: 16,
      lineHeight: 24,
      color: colors.textOnCard,
      textAlign: 'center',
    },
    actions: {
      gap: spacing.sm,
      paddingBottom: spacing.md,
    },
    primaryBtn: {
      backgroundColor: colors.textOnCard,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    primaryBtnText: {
      fontFamily: fonts.bold,
      fontSize: 16,
      letterSpacing: 0.3,
      color: colors.bgCard,
    },
    secondaryBtn: {
      paddingVertical: spacing.sm,
      alignItems: 'center',
      minHeight: dimensions.buttonHeight,
      justifyContent: 'center',
    },
    secondaryBtnText: {
      fontFamily: fonts.regular,
      fontSize: 16,
      color: colors.textOnCard,
    },
  });
}
