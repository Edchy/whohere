import React, { useCallback, useEffect } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useColors } from '../hooks/useColors';

const SNAP_MS      = 120;
const BLINK_CLOSE  =  80;
const BLINK_OPEN   = 120;
const BLINK_HOLD   =  40;
const BLINK_DELAY  = 4800;
const BREATHE_HALF = 1500;

// ─── SVG paths (viewBox 0 0 1200 1200) ────────────────────────────────────────
// Eye sub-paths removed — they're replaced by animated View overlays.
// Original had 4 sub-paths: body, eye1, eye2, mouth.
// Mouth m offset recalculated to be relative to body start after eyes removed.
//
// Body start:  (967.27, 341.02)
// Eye1 start:  body_start + (-211.88, -116.95) = (755.39, 224.07)
// Eye2 start:  eye1_start + (-350.39,   93.75) = (405.00, 317.82)
// Mouth start: eye2_start + ( 419.30,  163.59) = (824.30, 481.41)
// Mouth relative to body start: (824.30-967.27, 481.41-341.02) = (-142.97, 140.39)

const PATH_BODY =
  'm967.27 341.02c-6.5625-43.594-19.453-64.922-44.297-93.516-16.172-24.375-35.625-46.641-57.422-66.562-72.188-90-300-142.27-309.61-144.38h-0.23438c-54.375-9.375-98.906-0.9375-135.94 25.312-31.875 22.734-52.969 54.844-71.484 83.203-15.234 22.969-28.125 43.125-43.828 52.969-35.859 22.969-42.656 55.078-49.922 88.828-4.6875 21.562-9.375 43.594-21.562 66.094-25.781 47.578-12.188 110.16-1.4062 160.08 3.0469 14.297 6.0938 27.891 7.9688 39.844 7.0312 46.406 36.328 70.781 47.344 79.922 1.4062 1.1719 2.8125 2.3438 3.2812 2.8125 18.047 36.094 50.156 105.7 64.219 168.05 8.4375 37.5-3.75 88.828-16.641 143.44-18.516 78.281-37.969 159.38 7.9688 201.8 14.531 13.594 27.188 18.047 37.5 18.047 8.4375 0 15.469-3.0469 20.859-6.7969 37.266-25.781 51.328-125.62 26.484-187.5-17.578-43.828-14.531-115.78 7.0312-160.31 8.4375-17.344 18.75-28.594 30.234-32.812 6.5625 3.75 13.125 9.375 19.922 17.109 1.6406 12.422 2.5781 26.25 3.0469 41.016 0.23438 11.016-5.3906 26.25-11.719 42.422-11.953 31.406-26.953 70.781-0.23438 97.734 18.516 18.75 49.688 20.625 73.828 4.6875 24.375-16.172 42.891-52.5 21.094-105.7-11.719-28.594-16.172-54.141-13.594-76.172 12.656 6.3281 26.953 10.312 42.891 11.484 27.188 46.641 37.5 102.89 26.953 147.66-1.1719 4.9219-2.3438 10.078-3.75 15-11.953 47.578-26.953 107.11 30.469 137.81 26.25 14.062 55.781 11.25 76.641-7.5 24.141-21.562 40.547-67.969 14.297-134.3-24.375-61.641-23.906-136.41-18.75-190.08 6.5625 0.9375 13.594 3.0469 21.094 5.3906 22.5 7.0312 50.391 15.469 63.984-21.797 10.078-27.656 18.281-34.219 26.484-37.031 2.5781 33.516-13.125 81.562-28.125 124.22-16.172 45.703-5.1562 106.17 23.203 129.38 15.469 12.656 34.688 13.125 54.375 1.4062 28.125-16.875 44.531-46.875 47.344-86.484 2.8125-42.188-9.8438-83.203-17.812-103.83-15.234-39.609 5.8594-123.28 19.688-169.69 0.9375-2.5781 1.6406-4.9219 2.1094-7.2656 6.7969-21.797 12.188-36.797 12.656-38.203 18.75-43.594 28.359-89.531 28.359-136.88-0.23438-33.281-5.1562-66.797-15-98.906zm-142.97 140.39c-1.4062 20.156-10.312 32.578-10.312 45.703 0.70312 8.9062 2.1094 17.344 4.4531 23.672 9.6094 25.312-27.422 46.172-26.484 28.594 1.1719-17.578-22.734 27.656-24.844 43.125s-21.797 39.609-38.203 35.391-27.422 14.531-45.234 19.922-45.234 34.922-85.312 18.984-53.906-37.266-79.219-28.125-69.609-33.516-73.125-51.562c-3.0469-15.703-38.672-47.344-46.875-71.719-0.46875-2.1094-7.7344-11.719-6.7969-25.781s9.375-56.25 5.1562-60.469c0 0 3.2812-13.359 14.531-4.6875s-0.46875 19.453 8.2031 36.328-0.46875 54.844 19.922 63.984 15.234 15.469 35.625 29.297c20.391 14.062 46.172 37.734 72.656 44.531s75.234 29.531 93.047 16.406c17.578-13.125 77.578-7.0312 85.781-45.234 7.9688-38.203 28.828-28.594 37.5-36.797s24.375-18.047 23.906-40.312 13.359-75 20.625-69.375 16.641 6.3281 15 28.125z';

// Eye center positions as fractions of the 1200×1200 viewBox
// Eye1 (right): start (755, 224), center estimate ~(790, 265) → 65.8%, 22.1%
// Eye2 (left):  start (405, 318), center estimate ~(435, 355) → 36.3%, 29.6%
const EYE1_CX_PCT = 0.658;
const EYE1_CY_PCT = 0.221;
const EYE2_CX_PCT = 0.363;
const EYE2_CY_PCT = 0.296;

// ─── Eye (identical to Mascot) ────────────────────────────────────────────────

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

// ─── MeltsMascot ─────────────────────────────────────────────────────────────

interface MeltsMascotProps {
  size?:  number;
  style?: StyleProp<ViewStyle>;
  color?: string;
}

export default function MeltsMascot({ size = 48, style, color }: MeltsMascotProps) {
  const colors    = useColors();
  const fillColor = color ?? '#ffffff';

  const socketWidth  = size * 0.10;
  const socketHeight = size * 0.11;
  const pupilWidth   = socketWidth  * 0.82;
  const pupilHeight  = socketHeight * 0.88;
  const scanTravel   = socketWidth  * 0.22;

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
    <Animated.View style={[{ width: size, height: size }, containerAnimStyle, style]}>
      <Svg width={size} height={size} viewBox="0 0 1200 1200" style={{ position: 'absolute' }}>
        <Path d={PATH_BODY} fill={fillColor} />
      </Svg>

      {/* Eye 1 (right) */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: size * EYE1_CX_PCT - socketWidth / 2,
          top:  size * EYE1_CY_PCT - socketHeight / 2,
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
      </View>

      {/* Eye 2 (left) */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: size * EYE2_CX_PCT - socketWidth / 2,
          top:  size * EYE2_CY_PCT - socketHeight / 2,
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
      </View>
    </Animated.View>
  );
}
