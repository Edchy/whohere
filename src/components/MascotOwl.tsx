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
import Svg, { Path } from 'react-native-svg';
import { colors } from '../constants/theme';

const PUPIL_COLOR  = colors.accent;
const SOCKET_COLOR = colors.bgSecondary;

const SNAP_MS      = 120;
const BLINK_CLOSE  =  80;
const BLINK_OPEN   = 120;
const BLINK_HOLD   =  40;
const BLINK_DELAY  = 4800;
const BREATHE_HALF = 1800;

// SVG viewBox is 1200×1200.
// Eye socket centres in SVG coords (measured from the paths):
//   Left eye:  cx ≈ 464, cy ≈ 350, r ≈ 118
//   Right eye: cx ≈ 736, cy ≈ 350, r ≈ 118
const SVG_SIZE     = 1200;
const EYE_L_CX     = 464;
const EYE_R_CX     = 736;
const EYE_CY       = 350;
const EYE_R        = 118; // socket radius in SVG coords

// ─── Owl SVG body (all paths except the two eye circles) ─────────────────────

const OWL_PATHS = [
  // nostrils / beak details
  "m645.52 703.22c9.9375 0 18-8.0625 18-18v-34.406c0-9.9375-8.0625-18-18-18s-18 8.0625-18 18v34.406c0 9.9375 8.0625 18 18 18z",
  "m554.44 703.22c9.9375 0 18-8.0625 18-18v-34.406c0-9.9375-8.0625-18-18-18s-18 8.0625-18 18v34.406c0 9.9375 8.0625 18 18 18z",
  // main body
  "m1122 1052.7h-301.36c109.08-180.52 203.9-479.06 58.594-647.21 6.5625-17.109 10.312-35.578 10.312-54.984 0-21.281-4.3594-41.578-12.234-60.047 64.266-46.5 96.844-117.75 96.844-212.06 0-6.9375-3.9844-13.266-10.266-16.266s-13.688-2.1094-19.078 2.25c-89.859 72.891-599.21 72.844-689.86-0.046875-5.3906-4.3594-12.797-5.2031-19.031-2.2031-6.2344 3-10.219 9.3281-10.219 16.219 0 94.359 32.578 165.61 96.844 212.06-7.875 18.469-12.188 38.766-12.188 60.047 0 19.359 3.75 37.828 10.312 54.938-145.31 168.1-50.484 466.74 58.641 647.26l-301.31 0.046874c-9.9375 0-18 8.0625-18 18s8.0625 18 18 18h411.19c6.5625 29.062 32.531 50.906 63.562 50.906 18.562 0 35.344-7.8281 47.203-20.344 11.906 12.516 28.641 20.344 47.203 20.344 31.031 0 57-21.797 63.562-50.906h411.28c9.9375 0 18-8.0625 18-18 0-9.9844-8.0625-18-18-18zm-293.76-89.344c-3.7969-17.859-8.2031-36.609-12.75-55.922-28.031-119.44-62.578-267.61-15.844-417.19 24.562-11.25 45.609-28.781 61.172-50.531 102.66 134.26 47.531 360.05-32.578 523.64zm-481.82-612.84c0-64.969 52.828-117.8 117.75-117.8 64.969 0 117.8 52.875 117.8 117.8 0 64.969-52.875 117.84-117.8 117.84-64.922 0-117.75-52.875-117.75-117.84zm253.55 72.047c12.844 24.094 31.922 44.297 55.078 58.641l-55.078 68.438-55.078-68.438c23.156-14.344 42.281-34.547 55.078-58.641zm18-72.047c0-64.969 52.875-117.8 117.8-117.8 64.969 0 117.8 52.875 117.8 117.8 0 64.969-52.875 117.84-117.8 117.84-64.922 0-117.8-52.875-117.8-117.84zm-354.79-240.52c138.37 59.766 535.6 59.766 673.69 0.046874-6.0469 65.484-31.828 114.42-77.766 148.87-28.078-37.688-72.797-62.25-123.28-62.25-58.781 0-109.92 33.188-135.79 81.797-25.875-48.609-77.016-81.797-135.79-81.797-50.484 0-95.203 24.562-123.24 62.25-46.031-34.453-71.812-83.344-77.812-148.92zm75.984 329.72c15.562 21.797 36.656 39.281 61.219 50.578 46.688 149.58 12.141 297.74-15.891 417.19-4.5 19.312-8.9062 38.062-12.75 55.875-80.062-163.6-135.24-389.44-32.578-523.64zm59.672 575.02c4.1719-28.594 11.859-61.406 20.719-99.047 26.156-111.56 61.359-261.74 21.891-413.21 7.4531 1.125 15 1.875 22.734 1.875 16.453 0 32.297-2.6719 47.156-7.4531l74.625 92.766c3.4219 4.2188 8.5781 6.7031 14.016 6.7031s10.594-2.4844 14.016-6.7031l74.625-92.766c14.859 4.7812 30.703 7.4531 47.156 7.4531 7.7812 0 15.328-0.75 22.781-1.875-39.516 151.45-4.2656 301.64 21.891 413.21 8.8125 37.641 16.547 70.453 20.719 99.047-7.5938 13.406-15.281 25.969-22.969 37.969h-65.812l0.046875-28.219c0-35.906-29.25-65.156-65.203-65.156-18.562 0-35.344 7.8281-47.203 20.344-11.906-12.516-28.641-20.344-47.203-20.344-35.953 0-65.203 29.25-65.203 65.156v28.219h-65.812c-7.6406-12-15.328-24.562-22.969-37.969zm153.94 88.828c-16.125 0-29.203-13.125-29.203-29.203v-49.875c0-16.078 13.125-29.156 29.203-29.156 16.125 0 29.203 13.078 29.203 29.156v49.875c0 16.078-13.078 29.203-29.203 29.203zm123.66-29.203c0 16.125-13.125 29.203-29.203 29.203-16.125 0-29.203-13.125-29.203-29.203l-0.046875-49.875c0-16.078 13.125-29.156 29.203-29.156 16.125 0 29.203 13.078 29.203 29.156z",
  "m599.95 810.37c9.9375 0 18-8.0625 18-18v-34.453c0-9.9375-8.0625-18-18-18s-18 8.0625-18 18v34.453c0 9.9375 8.0625 18 18 18z",
  "m508.97 810.37c9.9375 0 18-8.0625 18-18v-34.453c0-9.9375-8.0625-18-18-18s-18 8.0625-18 18v34.453c0 9.9375 8.0625 18 18 18z",
  "m691.03 810.37c9.9375 0 18-8.0625 18-18v-34.453c0-9.9375-8.0625-18-18-18s-18 8.0625-18 18v34.453c0 9.9375 8.0625 18 18 18z",
  "m645.52 917.53c9.9375 0 18-8.0625 18-18v-34.406c0-9.9375-8.0625-18-18-18s-18 8.0625-18 18v34.406c0 9.9375 8.0625 18 18 18z",
  "m554.44 917.53c9.9375 0 18-8.0625 18-18v-34.406c0-9.9375-8.0625-18-18-18s-18 8.0625-18 18v34.406c0 9.9375 8.0625 18 18 18z",
];

function OwlSvg({ w, h, fillColor }: { w: number; h: number; fillColor: string }) {
  return (
    <Svg
      width={w}
      height={h}
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {OWL_PATHS.map((d, i) => (
        <Path key={i} d={d} fill={fillColor} />
      ))}
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
}

function Eye({ socketWidth, socketHeight, pupilWidth, pupilHeight, scanValue, blinkValue }: EyeProps) {
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
        backgroundColor: SOCKET_COLOR,
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
            backgroundColor: PUPIL_COLOR,
          },
          animStyle,
        ]}
      />
    </View>
  );
}

// ─── MascotOwl ────────────────────────────────────────────────────────────────

interface MascotOwlProps {
  size?:  number;
  style?: StyleProp<ViewStyle>;
}

export default function MascotOwl({ size = 120, style }: MascotOwlProps) {
  const w = size;
  const h = size; // viewBox is square

  // Scale factor from SVG coords to rendered px
  const scale = w / SVG_SIZE;

  // Eye socket size in px — match the SVG eye circles
  const socketSize  = EYE_R * 2 * scale;
  const pupilWidth  = socketSize * 0.82;
  const pupilHeight = socketSize * 0.88;

  // Eye positions in px (top-left of each socket)
  const eyeLLeft = EYE_L_CX * scale - socketSize / 2;
  const eyeRLeft = EYE_R_CX * scale - socketSize / 2;
  const eyeTop   = EYE_CY   * scale - socketSize / 2;

  const scanTravel = socketSize * 0.18;

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

  return (
    <Animated.View style={[{ width: w, height: h }, containerAnimStyle, style]}>
      {/* Owl body SVG */}
      <OwlSvg w={w} h={h} fillColor={colors.textPrimary} />

      {/* Left eye */}
      <View style={{ position: 'absolute', top: eyeTop, left: eyeLLeft }}>
        <Eye
          socketWidth={socketSize}
          socketHeight={socketSize}
          pupilWidth={pupilWidth}
          pupilHeight={pupilHeight}
          scanValue={scanX}
          blinkValue={blinkSY}
        />
      </View>

      {/* Right eye */}
      <View style={{ position: 'absolute', top: eyeTop, left: eyeRLeft }}>
        <Eye
          socketWidth={socketSize}
          socketHeight={socketSize}
          pupilWidth={pupilWidth}
          pupilHeight={pupilHeight}
          scanValue={scanX}
          blinkValue={blinkSY}
        />
      </View>
    </Animated.View>
  );
}
