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
import { colors } from '../constants/theme';

const PUPIL_AMBER  = '#C8A97A';
const SOCKET_COLOR = colors.bgTertiary;
const BODY_COLOR   = colors.textPrimary;

const SNAP_MS      = 120; // fast snap to new position
const BLINK_CLOSE  =  80;
const BLINK_OPEN   = 120;
const BLINK_HOLD   =  40;
const BLINK_DELAY  = 4800;
const BREATHE_HALF = 1500;

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
            backgroundColor: PUPIL_AMBER,
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

export default function Mascot({ size = 120, style }: MascotProps) {
  const bodyWidth    = size * 1.2;
  const bodyHeight   = size * 1.0;
  const topRadius    = size * 0.50;
  const bottomRadius = size * 0.18;

  const socketWidth  = size * 0.40;
  const socketHeight = size * 0.44;
  const pupilWidth   = socketWidth  * 0.68;
  const pupilHeight  = socketHeight * 0.68;

  const eyeGap     = size * 0.10;
  const eyeTop     = bodyHeight * 0.25;
  const scanTravel = socketWidth * 0.22;

  const scanX   = useSharedValue(0);
  const blinkSY = useSharedValue(1);
  const breathe = useSharedValue(1);

  // Saccade sequence: snap to a position, hold randomly up to 2s, repeat
  const scheduleSaccade = useCallback(() => {
    const positions = [-scanTravel, scanTravel, 0, 0]; // left, right, centre (weighted)
    const targets = [
      -scanTravel, // left
       scanTravel, // right
      -scanTravel, // left
       0,          // centre
       scanTravel, // right
       0,          // centre
    ];

    let seq: any[] = [];
    for (const target of targets) {
      const holdMs = Math.random() * 2000; // 0–2000ms hold
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

  const bodyAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  return (
    <View style={[{ width: bodyWidth, height: bodyHeight, alignItems: 'center' }, style]}>
      <Animated.View
        style={[
          {
            width: bodyWidth,
            height: bodyHeight,
            backgroundColor: BODY_COLOR,
            borderTopLeftRadius:     topRadius,
            borderTopRightRadius:    topRadius,
            borderBottomLeftRadius:  bottomRadius,
            borderBottomRightRadius: bottomRadius,
          },
          bodyAnimStyle,
        ]}
      >
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
          />
          <Eye
            socketWidth={socketWidth}
            socketHeight={socketHeight}
            pupilWidth={pupilWidth}
            pupilHeight={pupilHeight}
            scanValue={scanX}
            blinkValue={blinkSY}
          />
        </View>
      </Animated.View>
    </View>
  );
}
