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

// ─── Timing constants ────────────────────────────────────────────────────────

const SNAP_MS      = 120;
const BLINK_CLOSE  =  80;
const BLINK_OPEN   = 120;
const BLINK_HOLD   =  40;
const BLINK_DELAY  = 4200;
const BREATHE_HALF = 1400;
const WING_HALF    =  280;  // half-period of one flap cycle

// ─── FlyBody ─────────────────────────────────────────────────────────────────
//
// Draws the fly in SVG:
//   - two oval wings (left and right), slightly translucent
//   - a rounded thorax circle (upper body / head region)
//   - a tapered abdomen ellipse below the thorax
//
// All coordinates are expressed relative to the SVG viewport so the component
// scales cleanly with `size`.

interface FlyBodyProps {
  w: number;          // total SVG width
  h: number;          // total SVG height (thorax top → abdomen bottom)
  thoraxR: number;    // radius of the thorax circle
  wingW: number;      // half-width of one wing ellipse
  wingH: number;      // half-height of one wing ellipse
  bodyColor: string;
  wingColor: string;
}

function FlyBody({ w, h, thoraxR, wingW, wingH, bodyColor, wingColor }: FlyBodyProps) {
  // Thorax sits in the upper-centre of the SVG, leaving room for wings on both sides.
  const cx = w / 2;
  const thoraxCY = thoraxR + wingH * 0.35;  // overlap wings slightly behind thorax

  // Wings extend left and right from the thorax centre, angled upward.
  const wingCY = thoraxCY - thoraxR * 0.3;
  const leftWingCX  = cx - thoraxR * 0.55;
  const rightWingCX = cx + thoraxR * 0.55;

  // Abdomen: tapered ellipse below thorax.
  const abdomenCX = cx;
  const abdomenCY = thoraxCY + thoraxR * 1.35;
  const abdomenRX = thoraxR * 0.62;
  const abdomenRY = thoraxR * 0.95;

  // Abdomen stripe — a thin horizontal band across the lower abdomen.
  const stripeY = abdomenCY + abdomenRY * 0.3;
  const stripeHalfW = abdomenRX * 0.7;
  const stripeH = abdomenRY * 0.18;

  // Wing tilt: rotate wings outward and slightly upward.
  const leftWingTransform  = `rotate(-28, ${leftWingCX}, ${wingCY})`;
  const rightWingTransform = `rotate(28, ${rightWingCX}, ${wingCY})`;

  return (
    <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
      {/* Wings — drawn first so they sit behind the body */}
      <Ellipse
        cx={leftWingCX}
        cy={wingCY}
        rx={wingW}
        ry={wingH}
        fill={wingColor}
        transform={leftWingTransform}
      />
      <Ellipse
        cx={rightWingCX}
        cy={wingCY}
        rx={wingW}
        ry={wingH}
        fill={wingColor}
        transform={rightWingTransform}
      />

      {/* Abdomen */}
      <Ellipse
        cx={abdomenCX}
        cy={abdomenCY}
        rx={abdomenRX}
        ry={abdomenRY}
        fill={bodyColor}
      />
      {/* Stripe detail on abdomen */}
      <Path
        d={`M ${abdomenCX - stripeHalfW} ${stripeY} Q ${abdomenCX} ${stripeY - stripeH * 0.5} ${abdomenCX + stripeHalfW} ${stripeY} Q ${abdomenCX} ${stripeY + stripeH * 0.5} ${abdomenCX - stripeHalfW} ${stripeY} Z`}
        fill={wingColor}
        opacity={0.45}
      />

      {/* Thorax / head */}
      <Circle cx={cx} cy={thoraxCY} r={thoraxR} fill={bodyColor} />
    </Svg>
  );
}

// ─── Eye ─────────────────────────────────────────────────────────────────────
//
// Identical in structure to the ghost Eye — a rounded socket with an animated
// pupil that scans horizontally and blinks vertically.

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

function Eye({
  socketWidth,
  socketHeight,
  pupilWidth,
  pupilHeight,
  scanValue,
  blinkValue,
  socketColor,
  pupilColor,
}: EyeProps) {
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

// ─── Animated wing wrapper ────────────────────────────────────────────────────
//
// Wraps the FlyBody SVG so the wings can be animated independently via
// scaleY — this gives a simple "hovering flap" illusion without needing to
// re-render the SVG on every frame.
//
// We animate the entire body container's scaleX slightly (a squeeze-release)
// to suggest the wing beat, keeping it subtle.

interface AnimatedWingsProps {
  flapValue: SharedValue<number>;
  children: React.ReactNode;
}

function AnimatedWings({ flapValue, children }: AnimatedWingsProps) {
  const wingStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: flapValue.value }],
  }));
  return <Animated.View style={wingStyle}>{children}</Animated.View>;
}

// ─── MascotFly ───────────────────────────────────────────────────────────────

interface MascotFlyProps {
  size?:  number;
  style?: StyleProp<ViewStyle>;
}

export default function MascotFly({ size = 24, style }: MascotFlyProps) {
  const colors     = useColors();
  const colorScheme = useGameStore((s) => s.colorScheme);

  // ── Geometry ──────────────────────────────────────────────────────────────
  // The SVG is a square-ish bounding box.  All sub-dimensions are derived from
  // `size` so the mascot scales uniformly.

  const thoraxR  = size * 0.52;           // radius of thorax/head circle
  const wingW    = size * 0.72;           // wing ellipse half-width
  const wingH    = size * 0.42;           // wing ellipse half-height
  const svgW     = thoraxR * 2 + wingW * 2.2; // wide enough for both wings
  const svgH     = thoraxR * 2 + size * 2.0;  // tall enough for abdomen

  // Eye sizing — flies have large compound eyes relative to head.
  const socketWidth  = thoraxR * 0.72;
  const socketHeight = thoraxR * 0.76;
  const pupilWidth   = socketWidth  * 0.78;
  const pupilHeight  = socketHeight * 0.82;
  const eyeGap       = thoraxR * 0.08;

  // Position eyes on the thorax.  The thorax circle top sits at y = thoraxR * 0.35
  // (see FlyBody), so eyeTop positions them within that circle.
  const thoraxCY     = thoraxR + wingH * 0.35;  // mirrors FlyBody
  const eyeContainerTop = thoraxCY - thoraxR * 0.55 + (thoraxR * 1.1 - socketHeight) / 2;

  // Scan travel — pupils move within socket bounds.
  const scanTravel = socketWidth * 0.18;

  // ── Shared animation values ───────────────────────────────────────────────
  const scanX   = useSharedValue(0);
  const blinkSY = useSharedValue(1);
  const breathe = useSharedValue(1);
  const flap    = useSharedValue(1);

  // ── Eye saccade ───────────────────────────────────────────────────────────
  const scheduleSaccade = useCallback(() => {
    const targets = [-scanTravel, scanTravel, -scanTravel, 0, scanTravel, 0];
    const seq: any[] = [];
    for (const target of targets) {
      const holdMs = 900 + Math.random() * 2800;
      seq.push(withTiming(target, { duration: SNAP_MS, easing: Easing.out(Easing.cubic) }));
      seq.push(withTiming(target, { duration: holdMs,  easing: Easing.steps(1, true) }));
    }
    scanX.value = withRepeat(withSequence(...seq), -1, false);
  }, [scanTravel]);

  // ── Start all animations on mount ─────────────────────────────────────────
  useEffect(() => {
    scheduleSaccade();

    // Blink
    blinkSY.value = withRepeat(
      withSequence(
        withDelay(BLINK_DELAY, withTiming(0.05, { duration: BLINK_CLOSE })),
        withTiming(0.05, { duration: BLINK_HOLD }),
        withTiming(1,    { duration: BLINK_OPEN }),
      ),
      -1,
      false,
    );

    // Breathe — very subtle scale pulse on the whole mascot.
    breathe.value = withRepeat(withTiming(1.025, { duration: BREATHE_HALF }), -1, true);

    // Wing flap — scaleX squeeze to simulate wings beating.
    // Goes from 1.0 → 1.045 → 1.0, mimicking wings pushing air downward.
    flap.value = withRepeat(
      withSequence(
        withTiming(1.045, { duration: WING_HALF,       easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0,   { duration: WING_HALF,       easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Outer breathing container ──────────────────────────────────────────────
  const containerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  // ── Colors ────────────────────────────────────────────────────────────────
  const bodyColor = colorScheme === 'light' ? '#2a2a2a' : '#1f1f1f';
  const wingColor = colorScheme === 'light' ? 'rgba(200,200,220,0.55)' : 'rgba(180,180,210,0.38)';

  return (
    <Animated.View
      style={[
        { width: svgW, height: svgH, alignItems: 'center', justifyContent: 'flex-start' },
        containerAnimStyle,
        style,
      ]}
    >
      {/* Wing-flap animated wrapper around the SVG body */}
      <AnimatedWings flapValue={flap}>
        <FlyBody
          w={svgW}
          h={svgH}
          thoraxR={thoraxR}
          wingW={wingW}
          wingH={wingH}
          bodyColor={bodyColor}
          wingColor={wingColor}
        />
      </AnimatedWings>

      {/* Eyes — positioned absolutely over the thorax circle */}
      <View
        style={{
          position: 'absolute',
          top: eyeContainerTop,
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
