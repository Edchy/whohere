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
import { useGameStore } from '../store/gameStore';

const SNAP_MS      = 120;
const BLINK_CLOSE  =  80;
const BLINK_OPEN   = 120;
const BLINK_HOLD   =  40;
const BLINK_DELAY  = 4000;
const BREATHE_HALF = 1400;

// The SVG path's natural extent after the scale(1.04167) transform baked into it.
// viewBox "0 0 800 1400" with scale(1.04167) means the content spans roughly
// x: 0–780, y: 90–1320. We expose these as our coordinate system.
//
// The shape: two upper lobes (left ~x:80–390, right ~x:400–720, both y:90–690)
// meeting at a waist (~y:650) then a lower body down to ~y:1320.
//
// Eye centres derived from the 2nd and 3rd subpaths of the SVG (the wing/eye shapes).
// Left subpath spans x:87–383, y:113–656 → centre x≈235, y≈385
// Right subpath spans x:384–567, y:112–661 → centre x≈476, y≈387
// These are in pre-scale viewBox coords (the scale(1.04167) is applied separately).
// The eye bulges are the leftmost/rightmost extremes of subpath 1 (the outer body).
// Leftmost point on-curve: ~x:11, y:774. Rightmost: ~x:765, y:863.
// Visual centre of each bulge (pre-scale coords):
const LEFT_EYE_VB  = { x: 55,  y: 820 };
const RIGHT_EYE_VB = { x: 710, y: 820 };
const VB_W = 800;
const VB_H = 1400;

// ─── Fly body ─────────────────────────────────────────────────────────────────

function FlyBody({ w, h, color }: { w: number; h: number; color: string }) {
  return (
    // We let the SVG viewBox handle all scaling — no extra transform on the path.
    <Svg
      width={w}
      height={h}
      viewBox="0 0 800 1400"
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <Path
        // Original path with scale(1.04167) already baked in via transform attr in the source.
        // We replicate that here as a group transform so the viewBox clips correctly.
        transform="scale(1.04167 1.04167)"
        d="M169.112 94.7441C184.053 93.6242 200.817 97.2388 213.831 104.383C294.579 148.712 345.691 266.053 372.503 348.032C379.247 278.627 415.169 130.839 487.669 103.232C503.74 97.0767 521.605 97.5993 537.289 104.683C571.713 120.368 594.812 163.295 607.098 197.09C656.687 333.487 648.58 523.024 588.501 654.096C597.355 654.238 604.825 654.714 613.637 655.991C661.288 663.271 704.116 689.123 732.751 727.891C761.806 767.056 772.348 814.845 765.05 862.826C757.587 909.607 731.832 951.505 693.457 979.294C657.313 1005.73 609.134 1019.22 564.63 1012.34C556.213 1021.56 542.522 1032.29 532.638 1039.95C534.41 1043.31 536.588 1046.8 538.624 1050.01C555.565 1076.71 574.636 1101.64 594.488 1126.19L580.764 1136.96C575.567 1131.24 568.675 1122.16 563.896 1116.03C547.17 1094.69 531.638 1072.45 517.371 1049.4C500.744 1058.38 490.48 1063.32 472.578 1069.64C479.677 1087.43 487.006 1105.63 493.276 1123.7C508.975 1170 522.375 1217.05 533.427 1264.67C528.211 1265.61 521.918 1267.24 516.673 1268.46C508.181 1239.92 501.522 1209.14 492.889 1179.82C483.518 1145.98 468.633 1107.1 455.677 1074.6C435.928 1079.37 421.402 1081.32 400.908 1082.21L401.03 1111.97C408.409 1119.72 421.008 1130.35 429.172 1137.47C425.12 1141.83 421.195 1146.3 417.402 1150.88C409.259 1144 400.949 1136.01 392.647 1128.86C385.033 1136.24 377.731 1143.28 370.484 1151.01C366.18 1146.91 362.026 1142.52 357.889 1138.24C366.34 1129.87 374.842 1121.55 383.397 1113.29L383.339 1082.29C364.936 1081.17 347.206 1079.02 329.43 1073.84C322.401 1099.37 308.633 1135.34 299.458 1160.18C287.604 1192.29 274.259 1229.33 260.827 1260.57L244.637 1254.37C268.128 1194.69 293.16 1130.18 312.658 1069.36C293.839 1061.89 282.835 1056.92 265.169 1046.51C252.641 1072.52 219.601 1112.76 201.212 1135C197.352 1132.45 190.817 1126.85 187.409 1123.65C211.538 1096.05 232.272 1069.4 250.379 1037.35C239.185 1027.89 229.712 1018.88 219.142 1009.78C187.155 1016.83 153.835 1014.84 122.914 1004.04C77.3045 988.427 39.8592 955.186 18.9583 911.754C-1.72471 868.636 -4.43225 819.071 11.431 773.957C27.5993 729.013 60.8539 692.263 103.97 671.692C141.099 653.929 189.893 647.725 229.174 661.5C215.759 646.401 204.199 632.91 192.936 615.931C136.578 530.205 104.32 425.875 91.7488 324.687C83.5557 258.741 79.8486 104.838 169.112 94.7441Z"
        fill={color}
      />
    </Svg>
  );
}

// ─── Eye ──────────────────────────────────────────────────────────────────────

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

  const bodyColor = colorScheme === 'light' ? '#2a2a2a' : colors.textPrimary;

  // Render the fly at `size` width, preserving the 800:1400 aspect ratio.
  const bodyW = size;
  const bodyH = size * (VB_H / VB_W); // = size * 1.75

  // Map viewBox eye-centre coords → pixel coords on the rendered body.
  // The path has scale(1.04167) applied inside the viewBox, so we account for that.
  const scale = 1.04167;
  const pxPerVbX = bodyW / VB_W;
  const pxPerVbY = bodyH / VB_H;

  const socketW = size * 0.26;
  const socketH = size * 0.44;
  const pupilW  = socketW * 0.55;
  const pupilH  = socketH * 0.50;

  const leftEyePx  = { x: LEFT_EYE_VB.x  * scale * pxPerVbX, y: LEFT_EYE_VB.y  * scale * pxPerVbY };
  const rightEyePx = { x: RIGHT_EYE_VB.x * scale * pxPerVbX, y: RIGHT_EYE_VB.y * scale * pxPerVbY };

  const scanTravel = socketW * 0.20;
  const scanX   = useSharedValue(0);
  const blinkSY = useSharedValue(1);
  const breathe = useSharedValue(1);

  const scheduleSaccade = useCallback(() => {
    const targets = [-scanTravel, scanTravel, -scanTravel, 0, scanTravel, 0];
    const seq: any[] = [];
    for (const t of targets) {
      const hold = 1000 + Math.random() * 3000;
      seq.push(withTiming(t, { duration: SNAP_MS, easing: Easing.out(Easing.cubic) }));
      seq.push(withTiming(t, { duration: hold,    easing: Easing.steps(1, true) }));
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
    <Animated.View style={[{ width: bodyW, height: bodyH }, containerAnimStyle, style]}>
      <FlyBody w={bodyW} h={bodyH} color={bodyColor} />

      {/* Left eye */}
      <View style={{ position: 'absolute', top: leftEyePx.y - socketH / 2, left: leftEyePx.x - socketW / 2 }}>
        <Eye
          socketWidth={socketW}
          socketHeight={socketH}
          pupilWidth={pupilW}
          pupilHeight={pupilH}
          scanValue={scanX}
          blinkValue={blinkSY}
          socketColor='#000000'
          pupilColor={colors.accent}
        />
      </View>

      {/* Right eye */}
      <View style={{ position: 'absolute', top: rightEyePx.y - socketH / 2, left: rightEyePx.x - socketW / 2 }}>
        <Eye
          socketWidth={socketW}
          socketHeight={socketH}
          pupilWidth={pupilW}
          pupilHeight={pupilH}
          scanValue={scanX}
          blinkValue={blinkSY}
          socketColor='#000000'
          pupilColor={colors.accent}
        />
      </View>
    </Animated.View>
  );
}
