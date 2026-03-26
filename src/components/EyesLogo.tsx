import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface EyesLogoProps {
  size?: number;
}

// ─── Fly compound eye colors ──────────────────────────────────────────────────
const BRAND          = '#e82c07';   // brand red-orange
const EYE_BASE       = '#1A1A1A';   // near-black eye surface
const EYE_BORDER     = '#0A0A0A';   // near-black border
const FACET_LIGHT    = BRAND;       // brand color facet highlight
const FACET_DARK     = '#2A2A2A';   // dark grey facet shadow
const PSEUDOPUPIL    = '#FFFFFF';   // the moving centre spot

// ─── Utility ──────────────────────────────────────────────────────────────────
function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Hexagonal facet grid ─────────────────────────────────────────────────────
// Renders a grid of small circles packed in offset rows to approximate the
// hexagonal compound-eye texture. Entirely static — the movement comes from
// the pseudo-pupil layer above.

interface FacetGridProps {
  eyeW: number;
  eyeH: number;
}

function FacetGrid({ eyeW, eyeH }: FacetGridProps) {
  const facetD   = eyeW * 0.13;   // diameter of each facet circle
  const facetR   = facetD / 2;
  const colCount = Math.ceil(eyeW / facetD) + 2;
  const rowCount = Math.ceil(eyeH / (facetD * 0.86)) + 2;  // 0.86 ≈ sin(60°) row spacing

  const facets: React.ReactElement[] = [];

  for (let row = 0; row < rowCount; row++) {
    const isOdd  = row % 2 === 1;
    const offsetX = isOdd ? facetD * 0.5 : 0;
    const y      = row * facetD * 0.86 - facetR;

    for (let col = 0; col < colCount; col++) {
      const x = col * facetD - facetR + offsetX;
      // Alternate between light and dark facets for a subtle texture variation
      const useDark = (row + col) % 3 === 0;

      facets.push(
        <View
          key={`${row}-${col}`}
          style={{
            position:        'absolute',
            left:            x,
            top:             y,
            width:           facetD,
            height:          facetD,
            borderRadius:    facetR,
            backgroundColor: useDark ? FACET_DARK : FACET_LIGHT,
            borderWidth:     0.5,
            borderColor:     EYE_BORDER,
            opacity:         0.2,
          }}
        />
      );
    }
  }

  return (
    <View
      style={{
        position: 'absolute',
        top:      0,
        left:     0,
        width:    eyeW,
        height:   eyeH,
        overflow: 'hidden',
        borderRadius: eyeW * 0.5,
      }}
      pointerEvents="none"
    >
      {facets}
    </View>
  );
}

// ─── Single eye ───────────────────────────────────────────────────────────────

interface EyeProps {
  eyeW:          number;
  eyeH:          number;
  borderW:       number;
  pupilSize:     number;
  irisAnimStyle: object;
}

function Eye({ eyeW, eyeH, borderW, pupilSize, irisAnimStyle }: EyeProps) {
  return (
    <View
      style={{
        width:           eyeW,
        height:          eyeH,
        borderRadius:    eyeW * 0.5,
        backgroundColor: EYE_BASE,
        borderWidth:     borderW,
        borderColor:     '#FFFFFF',
        alignItems:      'center',
        justifyContent:  'center',
        overflow:        'hidden',
        // Subtle inner shadow effect via a slightly darker radial look
        // achieved by layering a translucent dark ring inside
      }}
    >
      {/* Pseudo-pupil — behind the facet grid */}
      <Animated.View
        style={[
          {
            width:           pupilSize,
            height:          pupilSize,
            borderRadius:    pupilSize / 2,
            backgroundColor: PSEUDOPUPIL,
            shadowColor:     '#000',
            shadowOffset:    { width: 0, height: 0 },
            shadowOpacity:   0.8,
            shadowRadius:    pupilSize * 0.3,
          },
          irisAnimStyle,
        ]}
      />

      {/* Compound facet texture — on top of pupil */}
      <FacetGrid eyeW={eyeW} eyeH={eyeH} />

      {/* Radial darkening around the edge (limbus equivalent) */}
      <View
        style={{
          position:        'absolute',
          top:             0,
          left:            0,
          width:           eyeW,
          height:          eyeH,
          borderRadius:    eyeW * 0.5,
          borderWidth:     eyeW * 0.12,
          borderColor:     'rgba(0,0,0,0.45)',
        }}
        pointerEvents="none"
      />
    </View>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function EyesLogo({ size = 64 }: EyesLogoProps) {
  // Fly eyes are nearly circular and very large — closer to 1:1 ratio
  const eyeW    = size * 0.50;
  const eyeH    = size * 0.52;
  const gap     = size * 0.01;   // close together
  const borderW = size * 0.025;
  // Pseudo-pupil is a smaller dark spot — about 28% of eye height
  const pupilSize = eyeH * 0.55;

  const maxX = ((eyeW - pupilSize) / 2 - borderW * 0.5) * 2.5;

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

    const targetX    = pick(xTargets);
    const isHardLook = Math.abs(targetX) > maxX * 0.6;

    const snapMs  = rand(150, 320);
    const holdMs  = isHardLook ? rand(1800, 3500) : rand(600, 1400);
    const pauseMs = rand(800, 2200);
    const returnMs = rand(180, 350);

    translateX.value = withSequence(
      withTiming(translateX.value, { duration: pauseMs,  easing: Easing.steps(1, false) }),
      withTiming(targetX,          { duration: snapMs,   easing: Easing.inOut(Easing.quad) }),
      withTiming(targetX,          { duration: holdMs,   easing: Easing.steps(1, false) }),
      withTiming(0,                { duration: returnMs, easing: Easing.inOut(Easing.quad) }),
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
      <Eye
        eyeW={eyeW}
        eyeH={eyeH}
        borderW={borderW}
        pupilSize={pupilSize}
        irisAnimStyle={irisAnimStyle}
      />
      <Eye
        eyeW={eyeW}
        eyeH={eyeH}
        borderW={borderW}
        pupilSize={pupilSize}
        irisAnimStyle={irisAnimStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
  },
});
