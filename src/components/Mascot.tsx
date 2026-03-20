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
import { useColors } from '../hooks/useColors';
import { useGameStore } from '../store/gameStore';

const SNAP_MS      = 120;
const BLINK_CLOSE  =  80;
const BLINK_OPEN   = 120;
const BLINK_HOLD   =  40;
const BLINK_DELAY  = 4800;
const BREATHE_HALF = 1500;

// ─── Ghost body SVG ──────────────────────────────────────────────────────────
// Rounded top via arc, straight sides, outward-bulging bottom corners via
// cubic bezier curves (convex corners = ghost skirt).

function GhostBody({ w, h, color, stroke, strokeWidth }: { w: number; h: number; color: string; stroke?: string; strokeWidth?: number }) {
  const r = w * 0.45; // top corner radius
  const bulge = w * 0.18; // how far the bottom corners bow outward

  // Path:
  // Start at bottom-left, go up the left side, arc across the top, down the
  // right side, then cubic-curve the bottom-right corner inward and back across
  // the bottom, cubic-curve the bottom-left corner.
  //
  // Bottom corners: control points push OUTWARD (below and to the side) to
  // create the convex "ghost skirt" flare.
  const d = [
    `M 0 ${h}`,                                          // bottom-left
    `L 0 ${r}`,                                          // up left side
    `A ${r} ${r} 0 0 1 ${r} 0`,                         // top-left arc
    `L ${w - r} 0`,                                      // top edge
    `A ${r} ${r} 0 0 1 ${w} ${r}`,                      // top-right arc
    `L ${w} ${h}`,                                       // down right side
    // bottom-right outward bulge: cubic from (w, h) curving out then to (w/2, h)
    `C ${w + bulge} ${h} ${w / 2 + bulge} ${h + bulge * 1.2} ${w / 2} ${h}`,
    // bottom-left outward bulge: cubic from (w/2, h) curving out then to (0, h)
    `C ${w / 2 - bulge} ${h + bulge * 1.2} ${-bulge} ${h} 0 ${h}`,
    'Z',
  ].join(' ');

  return (
    <Svg width={w} height={h + bulge * 1.2} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Path d={d} fill={color} stroke={stroke} strokeWidth={strokeWidth} />
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

// ─── Mascot ───────────────────────────────────────────────────────────────────

interface MascotProps {
  size?:  number;
  style?: StyleProp<ViewStyle>;
}

export default function Mascot({ size = 24, style }: MascotProps) {
  const colors = useColors();
  const colorScheme = useGameStore((s) => s.colorScheme);
  const bodyWidth  = size * 1.2;
  const bodyHeight = size * 1.0;
  const bulge      = bodyWidth * 0.18;

  const socketWidth  = size * 0.40;
  const socketHeight = size * 0.44;
  const pupilWidth   = socketWidth  * 0.82;
  const pupilHeight  = socketHeight * 0.88;

  const eyeGap     = size * 0.10;
  const eyeTop     = bodyHeight * 0.25;
  const scanTravel = socketWidth * 0.22;

  const containerHeight = bodyHeight + bulge * 1.2;

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
    const t = setTimeout(() => {
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
    }, 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  return (
    <Animated.View style={[{ width: bodyWidth, height: containerHeight }, containerAnimStyle, style]}>
      <GhostBody w={bodyWidth} h={bodyHeight} color={colorScheme === 'light' ? '#dfe5f3' : colors.textPrimary} />

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
