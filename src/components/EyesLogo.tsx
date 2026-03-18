import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

interface EyesLogoProps {
  size?: number;
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function EyesLogo({ size = 64 }: EyesLogoProps) {
  const eyeW = size * 0.48;
  const eyeH = size * 0.56;
  const gap = size * 0.03;
  const borderW = size * 0.035;
  const irisSize = eyeH * 0.46;
  const shineSize = irisSize * 0.28;

  const maxX = (eyeW - irisSize) / 2 - borderW * 0.5;

  const translateX = useSharedValue(0);

  const scheduleSaccade = useCallback(() => {
    const xTargets = [
      -maxX * rand(0.7, 1.0),
      -maxX * rand(0.3, 0.6),
      0,
      0,
      maxX * rand(0.3, 0.6),
      maxX * rand(0.7, 1.0),
    ];

    const targetX = pick(xTargets);
    const isHardLook = Math.abs(targetX) > maxX * 0.6;

    const snapMs = rand(150, 320);
    const holdMs = isHardLook ? rand(1800, 3500) : rand(600, 1400);
    const pauseMs = rand(800, 2200);
    const returnMs = rand(180, 350);

    translateX.value = withSequence(
      withTiming(translateX.value, { duration: pauseMs, easing: Easing.steps(1, false) }),
      withTiming(targetX, { duration: snapMs, easing: Easing.inOut(Easing.quad) }),
      withTiming(targetX, { duration: holdMs, easing: Easing.steps(1, false) }),
      withTiming(0, { duration: returnMs, easing: Easing.inOut(Easing.quad) }),
    );

    setTimeout(scheduleSaccade, pauseMs + snapMs + holdMs + returnMs);
  }, [maxX]);

  useEffect(() => {
    const timer = setTimeout(scheduleSaccade, rand(400, 1000));
    return () => clearTimeout(timer);
  }, [scheduleSaccade]);

  const irisAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.row, { gap }]}>
      <Eye eyeW={eyeW} eyeH={eyeH} borderW={borderW} irisSize={irisSize} shineSize={shineSize} irisAnimStyle={irisAnimStyle} translateX={translateX} maxX={maxX} irisColor="#000000" />
      <Eye eyeW={eyeW} eyeH={eyeH} borderW={borderW} irisSize={irisSize} shineSize={shineSize} irisAnimStyle={irisAnimStyle} translateX={translateX} maxX={maxX} irisColor="#000000" />
    </View>
  );
}

function Eye({ eyeW, eyeH, borderW, irisSize, shineSize, irisAnimStyle, translateX, maxX, irisColor }: any) {
  const shineAnimStyle = useAnimatedStyle(() => {
    const offset = interpolate(
      translateX.value,
      [-maxX, 0, maxX],
      [-(irisSize / 2 - shineSize * 0.8), 0, irisSize / 2 - shineSize * 0.8],
    );
    return { transform: [{ translateX: offset }] };
  });

  return (
    <View
      style={{
        width: eyeW,
        height: eyeH,
        borderRadius: eyeW * 0.5,
        backgroundColor: '#FAFAF8',
        borderWidth: borderW,
        borderColor: irisColor,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            width: irisSize,
            height: irisSize,
            borderRadius: irisSize / 2,
            backgroundColor: irisColor,
            alignItems: 'center',
            justifyContent: 'center',
          },
          irisAnimStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: irisSize * 0.15,
              width: shineSize,
              height: shineSize,
              borderRadius: shineSize / 2,
              backgroundColor: '#FAFAF8',
            },
            shineAnimStyle,
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
