import React, { useCallback, useEffect } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { useColors } from '../hooks/useColors';
import { useGameStore } from '../store/gameStore';

const SNAP_MS      = 120;
const BLINK_CLOSE  =  80;
const BLINK_OPEN   = 120;
const BLINK_HOLD   =  40;
const BLINK_DELAY  = 4800;
const BREATHE_HALF = 1500;

// ─── Fly body SVG ─────────────────────────────────────────────────────────────
// Round head with two antennae curving up from the top.

function FlyBody({ w, h, color }: { w: number; h: number; color: string }) {
  const r = w / 2; // head is a circle
  // Antennae: left curves up-left, right curves up-right, each with a round tip
  const tipR = w * 0.06;
  const strokeW = w * 0.06;

  return (
    <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
      {/* Left antenna */}
      <Path
        d={`M ${w * 0.38} ${h * 0.20} Q ${w * 0.26} ${h * 0.06} ${w * 0.22} ${h * 0.02}`}
        stroke={color}
        strokeWidth={strokeW}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={w * 0.20} cy={h * 0.01} r={tipR} fill={color} />

      {/* Right antenna */}
      <Path
        d={`M ${w * 0.62} ${h * 0.20} Q ${w * 0.74} ${h * 0.06} ${w * 0.78} ${h * 0.02}`}
        stroke={color}
        strokeWidth={strokeW}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={w * 0.80} cy={h * 0.01} r={tipR} fill={color} />

      {/* Round head */}
      <Circle cx={r} cy={h * 0.60} r={r * 0.88} fill={color} />
    </Svg>
  );
}

// ─── Eye ─────────────────────────────────────────────────────────────────────

interface EyeProps {
  socketWidth:  number;
  socketHeight: number;
  pupilWidth:   number;
  pupilHeight:  number;
  scanValue:    SharedValue<number>;
  blinkValue:   SharedValue<number>;
  socketColor:  string;
  pupilColor:   string;
}

function Eye({ socketWidth, socketHeight, pupilWidth, pupilHeight, scanValue, blinkValue, socketColor, pupilColor }: EyeProps) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: scanValue.value },
      { scaleY: blinkValue.value },
    ],
  }));

  return (
    <View
      style={{
        width: socketWidth,
        height: socketHeight,
        borderRadius: socketWidth / 2,
        backgroundColor: socketColor,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            width: pupilWidth,
            height: pupilHeight,
            borderRadius: pupilWidth / 2,
            backgroundColor: pupilColor,
          },
          animStyle,
        ]}
      />
    </View>
  );
}

// ─── FlyMascot ────────────────────────────────────────────────────────────────

interface FlyMascotProps {
  size?:  number;
  style?: StyleProp<ViewStyle>;
}

export default function FlyMascot({ size = 24, style }: FlyMascotProps) {
  const colors      = useColors();
  const colorScheme = useGameStore((s) => s.colorScheme);

  // Body is a square canvas; the circle head sits in the lower 80%, antennae in the top 20%
  const bodyWidth  = size * 1.2;
  const bodyHeight = size * 1.4; // taller than ghost to fit antennae

  const socketWidth  = size * 0.36;
  const socketHeight = size * 0.40;
  const pupilWidth   = socketWidth  * 0.82;
  const pupilHeight  = socketHeight * 0.88;

  const eyeGap     = size * 0.08;
  // Eyes sit in the upper-middle of the circular head area
  const eyeTop     = bodyHeight * 0.38;
  const scanTravel = socketWidth * 0.22;

  const scanX   = useSharedValue(0);
  const blinkSY = useSharedValue(1);
  const breathe = useSharedValue(1);

  const scheduleSaccade = useCallback(() => {
    const targets = [
      -scanTravel,
       scanTravel,
      -scanTravel,
       0,
       scanTravel,
       0,
    ];

    const seq: any[] = [];
    for (const target of targets) {
      const holdMs = 1000 + Math.random() * 3000;
      seq.push(withTiming(target, { duration: SNAP_MS, easing: Easing.out(Easing.cubic) }));
      seq.push(withTiming(target, { duration: holdMs,  easing: Easing.steps(1, true) }));
    }

    scanX.value = withRepeat(withSequence(...seq), -1, false);
  }, [scanTravel]);

  useEffect(() => {
    scheduleSaccade();

    blinkSY.value = withRepeat(
      withSequence(
        withDelay(BLINK_DELAY, withTiming(0.05, { duration: BLINK_CLOSE })),
        withTiming(0.05, { duration: BLINK_HOLD }),
        withTiming(1,    { duration: BLINK_OPEN }),
      ),
      -1,
      false,
    );

    breathe.value = withRepeat(
      withTiming(1.02, { duration: BREATHE_HALF }),
      -1,
      true,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  return (
    <Animated.View style={[{ width: bodyWidth, height: bodyHeight }, containerAnimStyle, style]}>
      <FlyBody
        w={bodyWidth}
        h={bodyHeight}
        color={colorScheme === 'light' ? '#dfe5f3' : colors.textPrimary}
      />

      {/* Eyes sit on top of the SVG */}
      <View
        style={{
          position: 'absolute',
          top: eyeTop,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: eyeGap,
        }}
      >
        <Eye
          socketWidth={socketWidth}
          socketHeight={socketHeight}
          pupilWidth={pupilWidth}
          pupilHeight={pupilHeight}
          scanValue={scanX}
          blinkValue={blinkSY}
          socketColor='#000000'
          pupilColor={colors.accent}
        />
        <Eye
          socketWidth={socketWidth}
          socketHeight={socketHeight}
          pupilWidth={pupilWidth}
          pupilHeight={pupilHeight}
          scanValue={scanX}
          blinkValue={blinkSY}
          socketColor='#000000'
          pupilColor={colors.accent}
        />
      </View>
    </Animated.View>
  );
}
