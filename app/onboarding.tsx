import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import FingerIcon from '../assets/icons/noun-finger-3414109.svg';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ReAnimated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import EyesLogo from '../src/components/EyesLogo';
import {
  appName,
  dimensions as dim,
  fonts,
  radius,
  spacing,
  typography,
} from '../src/constants/theme';
import { useColors } from '../src/hooks/useColors';
import { useHaptics } from '../src/hooks/useHaptics';
import { useGameStore } from '../src/store/gameStore';

const ONBOARDING_KEY = '@whohere/hasSeenOnboarding';

/* ── Animation constants ─────────────────────────────────────────────────── */
const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 500;
const DISMISS_DISTANCE = SCREEN_WIDTH * 1.2;
const MAX_ROTATION = 15;
const STACK_OFFSET_Y = 6;
const STACK_SCALE_STEP = 0.04;

type Slide = {
  id: string;
  topLabel: string;
  headline: string;
  subheading?: string;
  body: string;
  bottomLabel: string;
  isWelcome?: boolean;
};

const SLIDES: Slide[] = [
  {
    id: '1',
    topLabel: '...?',
    headline: 'VEM HÄR',
    subheading: 'Intuitiva mikrohistorier om människor omkring oss',
    body: '',
    bottomLabel: '',
    isWelcome: true,
  },
  {
    id: '2',
    topLabel: 'varje dag',
    headline: 'INTRYCKEN',
    body: 'Välkommen till ett nytt spel som du omedvetet redan spelat hela ditt liv. Dagligen möter vi vår omvärld och gör blixtsnabba läsningar av de människor vi ser. Det sker intuitivt och oftast helt utan medveten reflektion, men det är väldigt sällan som vi sätter ord på dessa intryck. ',
    bottomLabel: '...',
  },
  {
    id: '3',
    topLabel: 'flugan på väggen',
    headline: 'IAKTTAGAREN',
    body: 'Genom att vara en fluga på väggen och medvetet iaktta de människor du ser just nu, kan du också få syn på något i dig själv och i det sällskap du spelar med. Det är ett kul sätt att bli varse om det förgivettagna, oavsett om det är på en date, med vänner eller på egen hand. ',
    bottomLabel: '...',
  },
  {
    id: '4',
    topLabel: 'hur man spelar',
    headline: 'UPPGIFTEN',
    body: 'Varje fråga inleds med "Vem här…?" och er uppgift är att läsa av rummet för att se vem ni tycker passar bäst in som svar på frågan. Väljer ni samma person som svar eller tycker ni helt olika? Vart går gränsen mellan knivskarp intuition och förblindande fördomar?',
    bottomLabel: '...',
  },
  {
    id: '5',
    topLabel: 'inga vinnare',
    headline: 'POÄNGEN',
    body: 'Det finns inga vinnare och inga förlorare i detta spel, faktum är att sanningen om de ni betraktar är mindre intressant än det som blir synligt i er själva. De mikrohistorier vi skapar om andra kan i själva verket berätta en hel del om vilka vi är och hur vi ser på vår omvärld.',
    bottomLabel: '...',
  },
  {
    id: '6',
    topLabel: 'kom ihåg',
    headline: 'RESPEKTEN',
    body: 'Spela med respekt för andra människors integritet, låt ingen utanför ert sällskap ana vad som pågår. Välj utan att peka - svara utan att någon utanför ert spelande sällskap hör. Att vara en fluga på väggen är ett osynligt iakttagande, så visa hänsyn och ha det så kul!',
    bottomLabel: '...',
  },
];

/* ── Sub-components (still use RN Animated for looping anims) ────────────── */

function SwipeHint({ size = 32 }: { size?: number }) {
  const colors = useColors();
  const x = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.parallel([
          Animated.timing(x, { toValue: -36, duration: 420, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.2, duration: 420, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(x, { toValue: 0, duration: 320, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
        ]),
        Animated.delay(400),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateX: x }], opacity }}>
      <FingerIcon width={size} height={size} fill={colors.textMuted} />
    </Animated.View>
  );
}

function SlideCard({ slide }: { slide: Slide }) {
  const colors = useColors();

  if (slide.isWelcome) {
    return (
      <View style={[styles.card, styles.cardWelcome, { backgroundColor: colors.bgPrimary, borderColor: colors.textPrimary }]}>
        <View style={styles.welcomeCenter}>
          <EyesLogo size={80} />
          <Text selectable={false} style={[styles.welcomeAppName, { color: colors.accent }]}>
            {appName.toUpperCase()}
          </Text>
          {slide.subheading ? (
            <Text selectable={false} style={[styles.welcomeSubheading, { color: colors.textSecondary }]}>
              {slide.subheading}
            </Text>
          ) : null}
        </View>

        <View style={styles.welcomeHintRow}>
          <SwipeHint size={20} />
          <Text selectable={false} style={[styles.welcomeHintLabel, { color: colors.textMuted }]}>
            svep för att börja
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.textPrimary }]}>
      <Text selectable={false} style={[styles.topLabel, { color: colors.textMuted }]}>{slide.topLabel}</Text>

      <View style={styles.cardMiddle}>
        <Text selectable={false} style={[styles.headline, { color: colors.textPrimary }]}>{slide.headline}</Text>
        <Text selectable={false} style={[styles.body, { color: colors.textPrimary }]}>{slide.body}</Text>
      </View>

      <View style={styles.cardBottom} />
    </View>
  );
}

function AnimatedDot({ active, colors }: { active: boolean; colors: ReturnType<typeof useColors> }) {
  const width = useRef(new Animated.Value(active ? 20 : dim.dotSize)).current;
  const bg = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(width, {
        toValue: active ? 20 : dim.dotSize,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(bg, {
        toValue: active ? 1 : 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  }, [active]);

  const backgroundColor = bg.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textMuted, colors.textPrimary],
  });

  return (
    <Animated.View style={[styles.dot, { width, backgroundColor }]} />
  );
}

function LastSlideHint({ colors }: { colors: ReturnType<typeof useColors> }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(600),
          Animated.parallel([
            Animated.timing(x, { toValue: -36, duration: 420, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(x, { toValue: 0, duration: 320, useNativeDriver: true }),
          ]),
          Animated.delay(400),
        ])
      );
      loop.start();
    });
  }, []);

  return (
    <Animated.View style={[styles.lastHintRow, { opacity }]}>
      <Animated.View style={{ transform: [{ translateX: x }] }}>
        <FingerIcon width={20} height={20} fill={colors.textMuted} />
      </Animated.View>
      <Text selectable={false} style={[styles.lastHintLabel, { color: colors.textMuted }]}>
        svep för att börja spela
      </Text>
    </Animated.View>
  );
}

/* ── Main screen ─────────────────────────────────────────────────────────── */

export default function OnboardingScreen() {
  const colors = useColors();
  const haptics = useHaptics();
  const hapticsRef = useRef(haptics);
  hapticsRef.current = haptics;
  const setHasSeenOnboarding = useGameStore((s) => s.setHasSeenOnboarding);
  const [slideIndex, setSlideIndex] = useState(0);

  const dismissRef = useRef(async () => {});
  dismissRef.current = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasSeenOnboarding(true);
    router.replace('/');
  };

  const dismiss = useCallback(() => { dismissRef.current(); }, []);

  /* ── Swipe animation ─────────────────────────────────────────────────── */
  const translateX = useSharedValue(0);
  const isAnimating = useSharedValue(false);
  const isOnLastSlide = useSharedValue(false);
  const isOnFirstSlide = useSharedValue(true);

  const commitNext = useCallback(() => {
    hapticsRef.current.light();
    setSlideIndex((i) => i + 1);
  }, []);

  const commitPrev = useCallback(() => {
    hapticsRef.current.light();
    setSlideIndex((i) => i - 1);
  }, []);

  const commitDismiss = useCallback(() => {
    hapticsRef.current.light();
    dismissRef.current();
  }, []);

  // Reset shared values after React paints the new slide
  const isFirstRender = useRef(true);
  useEffect(() => {
    isOnLastSlide.value = slideIndex >= SLIDES.length - 1;
    isOnFirstSlide.value = slideIndex <= 0;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    translateX.value = 0;
    isAnimating.value = false;
  }, [slideIndex]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onUpdate((e) => {
      'worklet';
      if (isAnimating.value) return;
      // Clamp: no right swipe on first slide, no left swipe past last
      if (e.translationX > 0 && isOnFirstSlide.value) return;
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      'worklet';
      if (isAnimating.value) return;

      const swipeLeft =
        e.translationX < -SWIPE_THRESHOLD ||
        e.velocityX < -SWIPE_VELOCITY_THRESHOLD;
      const swipeRight =
        e.translationX > SWIPE_THRESHOLD ||
        e.velocityX > SWIPE_VELOCITY_THRESHOLD;

      if (swipeLeft) {
        isAnimating.value = true;
        const onLast = isOnLastSlide.value;
        translateX.value = withTiming(
          -DISMISS_DISTANCE,
          { duration: 200 },
          (finished) => {
            'worklet';
            if (finished) {
              if (onLast) {
                runOnJS(commitDismiss)();
              } else {
                runOnJS(commitNext)();
              }
            }
          }
        );
      } else if (swipeRight && !isOnFirstSlide.value) {
        isAnimating.value = true;
        translateX.value = withTiming(
          DISMISS_DISTANCE,
          { duration: 200 },
          (finished) => {
            'worklet';
            if (finished) {
              runOnJS(commitPrev)();
            }
          }
        );
      } else {
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
          mass: 0.5,
        });
      }
    });

  /* ── Animated styles ───────────────────────────────────────────────────── */
  const topCardStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: translateX.value },
        {
          rotate: `${interpolate(
            translateX.value,
            [-DISMISS_DISTANCE, 0, DISMISS_DISTANCE],
            [-MAX_ROTATION, 0, MAX_ROTATION],
            Extrapolation.CLAMP
          )}deg`,
        },
      ],
    };
  });

  const secondCardStyle = useAnimatedStyle(() => {
    'worklet';
    const progress = Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1);
    return {
      transform: [
        { translateY: interpolate(progress, [0, 1], [STACK_OFFSET_Y, 0]) },
        { scale: interpolate(progress, [0, 1], [1 - STACK_SCALE_STEP, 1]) },
      ],
    };
  });

  const thirdCardStyle = useAnimatedStyle(() => {
    'worklet';
    const progress = Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1);
    return {
      transform: [
        { translateY: interpolate(progress, [0, 1], [STACK_OFFSET_Y * 2, STACK_OFFSET_Y]) },
        { scale: interpolate(progress, [0, 1], [1 - STACK_SCALE_STEP * 2, 1 - STACK_SCALE_STEP]) },
      ],
    };
  });

  /* ── Render helpers ────────────────────────────────────────────────────── */
  function renderSlide(
    index: number,
    animStyle: ReturnType<typeof useAnimatedStyle>,
    zIndex: number,
  ) {
    if (index < 0 || index >= SLIDES.length) return null;

    return (
      <ReAnimated.View
        key={`slide-${index}`}
        style={[
          styles.cardAbsolute,
          { zIndex },
          animStyle,
        ]}
        pointerEvents={zIndex === 3 ? 'auto' : 'none'}
      >
        <SlideCard slide={SLIDES[index]} />
      </ReAnimated.View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View style={styles.cardArea}>
        <GestureDetector gesture={panGesture}>
          <ReAnimated.View style={styles.stackContainer}>
            {renderSlide(slideIndex + 2, thirdCardStyle, 1)}
            {renderSlide(slideIndex + 1, secondCardStyle, 2)}
            {renderSlide(slideIndex, topCardStyle, 3)}
          </ReAnimated.View>
        </GestureDetector>
      </View>

      <View style={styles.dots} pointerEvents="none">
        {SLIDES.map((_, i) => (
          <AnimatedDot key={i} active={i === slideIndex} colors={colors} />
        ))}
      </View>

      <View style={styles.bottomArea}>
        {slideIndex < SLIDES.length - 1 ? (
          <Pressable onPress={dismiss} hitSlop={12}>
            <Text selectable={false} style={[styles.skipText, { color: colors.textMuted }]}>hoppa över</Text>
          </Pressable>
        ) : (
          <LastSlideHint key="last-hint" colors={colors} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' ? { width: '100%', maxWidth: 480, alignSelf: 'center' as const } : {}),
  },
  cardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  stackContainer: {
    width: '100%',
    height: dim.cardHeight,
  },
  cardAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  skipText: {
    ...typography.caption,
    letterSpacing: 1,
  },
  card: {
    width: '100%',
    height: dim.cardHeight,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
    overflow: 'visible',
  },
  topLabel: {
    ...typography.badge,
    letterSpacing: 2,
  },
  cardMiddle: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  headline: {
    ...typography.display,
  },
  body: {
    ...typography.body,
    lineHeight: 28,
  },
  cardBottom: {
    alignItems: 'flex-end',
  },
  cardWelcome: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeCenter: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: spacing.md,
  },
  welcomeAppName: {
    fontFamily: fonts.B,
    fontSize: 48,
    lineHeight: 72,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  welcomeSubheading: {
    fontFamily: fonts.BC,
    fontSize: 20,
    lineHeight: 28,
    opacity: 0.6,
  },
  welcomeHintRow: {
    position: 'absolute' as const,
    bottom: spacing.xl,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  welcomeHintLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  bottomArea: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  dot: {
    height: dim.dotSize,
    borderRadius: dim.dotSize / 2,
  },
  lastHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  lastHintLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
