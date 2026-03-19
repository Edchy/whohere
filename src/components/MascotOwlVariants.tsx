/**
 * Owl mascot variants — same eye style/animation as the ghost,
 * owl SVG outline as the body shape.
 */
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
const SOCKET_COLOR = colors.bgTertiary;
const BODY_COLOR   = colors.textPrimary;

const SNAP_MS      = 120;
const BLINK_CLOSE  =  80;
const BLINK_OPEN   = 120;
const BLINK_HOLD   =  40;
const BLINK_DELAY  = 4800;
const BREATHE_HALF = 1500;
const SVG_SIZE     = 1200;

// ─── Eye — identical to Mascot.tsx ───────────────────────────────────────────

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
    <View style={{
      width: socketWidth, height: socketHeight,
      borderRadius: socketWidth / 2,
      backgroundColor: SOCKET_COLOR,
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <Animated.View style={[{
        width: pupilWidth, height: pupilHeight,
        borderRadius: pupilWidth / 2,
        backgroundColor: PUPIL_COLOR,
      }, animStyle]} />
    </View>
  );
}

// ─── Config ───────────────────────────────────────────────────────────────────

interface OwlConfig {
  paths: string[];
  fillRule?: 'nonzero' | 'evenodd';
  // Eye centre positions in SVG coords (0–1200), used to position eyes
  leftEye:  { cx: number; cy: number };
  rightEye: { cx: number; cy: number };
}

// ─── Base ─────────────────────────────────────────────────────────────────────

interface OwlMascotProps {
  config: OwlConfig;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

function OwlMascot({ config, size = 100, style }: OwlMascotProps) {
  const scale = size / SVG_SIZE;

  // Ghost-identical eye sizing
  const socketWidth  = size * 0.40;
  const socketHeight = size * 0.44;
  const pupilWidth   = socketWidth  * 0.82;
  const pupilHeight  = socketHeight * 0.88;
  const scanTravel   = socketWidth  * 0.22;

  // Eye positions — centred on the SVG eye coords
  const lLeft = config.leftEye.cx  * scale - socketWidth  / 2;
  const lTop  = config.leftEye.cy  * scale - socketHeight / 2;
  const rLeft = config.rightEye.cx * scale - socketWidth  / 2;
  const rTop  = config.rightEye.cy * scale - socketHeight / 2;

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
      ), -1, false,
    );
    breathe.value = withRepeat(withTiming(1.02, { duration: BREATHE_HALF }), -1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, breatheStyle, style]}>
      {/* Layer 1: SVG outline filled white — body shape */}
      <Svg width={size} height={size} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        style={{ position: 'absolute', top: 0, left: 0 }}>
        {config.paths.map((d, i) => (
          <Path key={i} d={d} fill={BODY_COLOR} fillRule={config.fillRule ?? 'nonzero'} />
        ))}
      </Svg>

      {/* Layer 2: eyes centred on original SVG eye positions */}
      <View style={{ position: 'absolute', top: lTop, left: lLeft }}>
        <Eye socketWidth={socketWidth} socketHeight={socketHeight}
          pupilWidth={pupilWidth} pupilHeight={pupilHeight}
          scanValue={scanX} blinkValue={blinkSY} />
      </View>
      <View style={{ position: 'absolute', top: rTop, left: rLeft }}>
        <Eye socketWidth={socketWidth} socketHeight={socketHeight}
          pupilWidth={pupilWidth} pupilHeight={pupilHeight}
          scanValue={scanX} blinkValue={blinkSY} />
      </View>
    </Animated.View>
  );
}

// ─── Variant configs ──────────────────────────────────────────────────────────

// 2 — noun-owl-4212372
const OWL_2: OwlConfig = {
  leftEye:  { cx: 348, cy: 633 },
  rightEye: { cx: 852, cy: 633 },
  paths: [
    "m1070.4 427.2 21.602-338.4c1.1992-9.6016-3.6016-18-12-22.801s-18-3.6016-25.199 1.1992l-210 144c-75.602-38.398-159.6-58.801-244.8-58.801s-170.4 20.398-244.8 58.801l-208.8-144c-7.1992-4.8008-18-6-25.199-1.1992-8.3984 4.8008-13.199 13.199-13.199 22.801l21.602 338.4c-45.602 80.402-69.602 172.8-69.602 266.4v372c0 39.602 32.398 72 72 72h936c39.602 0 72-32.398 72-72v-372c0-93.602-24-186-69.602-266.4zm9.6016 194.4c0 126-102 228-228 228s-228-102-228-228 102-228 228-228 228 102 228 228zm-373.2 234-106.8 124.8-106.8-124.8c46.801-28.801 84-72 106.8-122.4 22.801 50.402 60 93.602 106.8 122.4zm-367.2-596.4c7.1992 4.8008 16.801 6 25.199 1.1992 72-39.602 153.6-60 235.2-60 81.602 0 163.2 20.398 234 60 8.3984 4.8008 18 3.6016 25.199-1.1992l181.2-124.8-16.801 270c-46.801-37.199-106.8-60-171.6-60-111.6 0-208.8 67.199-252 163.2-43.199-96-140.4-163.2-252-163.2-64.801 0-124.8 22.801-171.6 60l-16.801-270zm8.3984 134.4c126 0 228 102 228 228s-102 228-228 228-228-102-228-228 102-228 228-228zm744 672c0 13.199-10.801 24-24 24h-936c-13.199 0-24-10.801-24-24v-308.4c48 84 136.8 140.4 240 140.4 36 0 69.602-7.1992 100.8-19.199l133.2 154.8c4.8008 6 10.801 8.3984 18 8.3984s13.199-2.3984 18-8.3984l133.2-154.8c31.199 12 66 19.199 100.8 19.199 103.2 0 192-56.398 240-140.4z",
  ],
};

// 3 — noun-owl-5017570
const OWL_3: OwlConfig = {
  leftEye:  { cx: 397, cy: 678 },
  rightEye: { cx: 803, cy: 678 },
  paths: [
    "m961.16 341.75c32.008-44.293 83.551-143.08 2.8203-242.95v0.003907c-2.8398-3.5195-6.8555-5.8945-11.309-6.6836-4.4531-0.78516-9.043 0.066406-12.914 2.3984l-250.8 150.48h-177.85l-250.86-150.48c-3.8711-2.3359-8.4609-3.1875-12.914-2.3984-4.4531 0.78906-8.4727 3.1602-11.309 6.6836-80.73 99.867-29.188 198.65 2.8203 242.95-312.56 254.77-131.94 765.91 272.27 766.4l177.79 0.003906c404.16-0.60547 584.88-511.5 272.26-766.41zm-272.26 728.91h-177.8c-82.887 0.003906-163.66-26.133-230.84-74.684-67.18-48.555-117.34-117.05-143.34-195.76-26.004-78.703-26.531-163.6-1.5-242.62 25.027-79.016 74.332-148.13 140.91-197.51 4.1484-3.0859 6.8398-7.7461 7.4336-12.879 0.59766-5.1367-0.95312-10.289-4.2852-14.242-26.918-31.988-80.75-113-23.934-197.54l240.88 144.52c2.9844 1.793 202.78 2.4922 207.16 0l240.88-144.52c56.816 84.539 2.9844 165.55-23.934 197.54h0.007813c-3.3008 3.9688-4.832 9.1133-4.2344 14.234 0.59375 5.125 3.2617 9.7812 7.3828 12.887 303.25 224.32 142.41 710.15-234.78 710.57z",
  ],
};

// ─── Exports ──────────────────────────────────────────────────────────────────

interface Props { size?: number; style?: StyleProp<ViewStyle> }

export function OwlMascot2({ size, style }: Props) { return <OwlMascot config={OWL_2} size={size} style={style} />; }
export function OwlMascot3({ size, style }: Props) { return <OwlMascot config={OWL_3} size={size} style={style} />; }
