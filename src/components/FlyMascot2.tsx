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
import Svg, { Ellipse, Path, Circle } from 'react-native-svg';
import { useColors } from '../hooks/useColors';
import { useGameStore } from '../store/gameStore';

const SNAP_MS      = 120;
const BLINK_CLOSE  =  80;
const BLINK_OPEN   = 120;
const BLINK_HOLD   =  40;
const BLINK_DELAY  = 4800;
const BREATHE_HALF = 1500;

// ─── Fly body SVG ─────────────────────────────────────────────────────────────
// ViewBox 100×100. Layout:
//   Wings: two overlapping ellipses top-right, rotated ~-30°
//   Body:  dark oval, slightly tilted, centre ~(42, 58)
//   Head:  circle left of body, centre ~(28, 52)
//   Legs:  six short lines below body
//   Antennae: two curves from top of head

function FlyBody({ w, h, color }: { w: number; h: number; color: string }) {
  const sw = 2.2; // stroke width in viewBox units

  return (
    <Svg
      width={w}
      height={h}
      viewBox="0 0 100 100"
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {/* ── Wings (behind body) ── */}
      {/* Upper wing */}
      <Ellipse
        cx={60} cy={30} rx={28} ry={13}
        transform="rotate(-25 60 30)"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        opacity={0.7}
      />
      {/* Lower wing */}
      <Ellipse
        cx={66} cy={42} rx={22} ry={10}
        transform="rotate(-20 66 42)"
        fill="none"
        stroke={color}
        strokeWidth={sw}
        opacity={0.5}
      />

      {/* ── Body (dark filled oval) ── */}
      <Ellipse
        cx={54} cy={58} rx={20} ry={14}
        transform="rotate(-15 54 58)"
        fill={color}
        stroke={color}
        strokeWidth={sw * 0.5}
      />

      {/* ── Head ── */}
      <Circle
        cx={30} cy={54} r={16}
        fill={color}
        stroke={color}
        strokeWidth={sw * 0.5}
      />

      {/* ── Antennae ── */}
      <Path
        d="M 22 39 Q 14 26 10 18"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={9} cy={16} r={2.2} fill={color} />

      <Path
        d="M 34 38 Q 34 24 36 16"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={36} cy={14} r={2.2} fill={color} />

      {/* ── Legs (3 per side, from underside of body/head join) ── */}
      {/* Left legs */}
      <Path d="M 20 64 L 8 72"  stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <Path d="M 24 67 L 14 78" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <Path d="M 30 68 L 24 80" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      {/* Right legs */}
      <Path d="M 42 68 L 50 76" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <Path d="M 50 70 L 60 78" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <Path d="M 60 66 L 72 72" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
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

// ─── FlyMascot2 ───────────────────────────────────────────────────────────────

interface FlyMascot2Props {
  size?:  number;
  style?: StyleProp<ViewStyle>;
}

export default function FlyMascot2({ size = 24, style }: FlyMascot2Props) {
  const colors      = useColors();
  const colorScheme = useGameStore((s) => s.colorScheme);

  // Canvas is square; the viewBox handles all proportions
  const bodyWidth  = size * 1.4;
  const bodyHeight = size * 1.4;

  // Eyes are positioned on the head circle.
  // Head centre in viewBox: (30, 54), r=16 → in px at size*1.4/100 scale:
  const vbToPx = (bodyWidth) / 100;
  const headCx = 30 * vbToPx;
  const headCy = 54 * vbToPx;

  const socketWidth  = size * 0.28;
  const socketHeight = size * 0.30;
  const pupilWidth   = socketWidth  * 0.70;
  const pupilHeight  = socketHeight * 0.70;

  const eyeGap     = size * 0.05;
  // Eye row centred on head
  const eyeRowWidth = socketWidth * 2 + eyeGap;
  const eyeLeft    = headCx - eyeRowWidth / 2;
  const eyeTop     = headCy - socketHeight / 2 - size * 0.04;

  const scanTravel = socketWidth * 0.20;

  const scanX   = useSharedValue(0);
  const blinkSY = useSharedValue(1);
  const breathe = useSharedValue(1);

  const scheduleSaccade = useCallback(() => {
    const targets = [-scanTravel, scanTravel, -scanTravel, 0, scanTravel, 0];
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

  const bodyColor = colorScheme === 'light' ? '#2a2a2a' : colors.textPrimary;

  return (
    <Animated.View style={[{ width: bodyWidth, height: bodyHeight }, containerAnimStyle, style]}>
      <FlyBody w={bodyWidth} h={bodyHeight} color={bodyColor} />

      {/* Eyes overlaid on the head */}
      <View
        style={{
          position: 'absolute',
          top: eyeTop,
          left: eyeLeft,
          flexDirection: 'row',
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
          socketColor='#ffffff'
          pupilColor={bodyColor}
        />
        <Eye
          socketWidth={socketWidth}
          socketHeight={socketHeight}
          pupilWidth={pupilWidth}
          pupilHeight={pupilHeight}
          scanValue={scanX}
          blinkValue={blinkSY}
          socketColor='#ffffff'
          pupilColor={bodyColor}
        />
      </View>
    </Animated.View>
  );
}
