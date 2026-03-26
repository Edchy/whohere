import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import FingerIcon from '../assets/icons/noun-finger-3414109.svg';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAPPED_WIDTH = Math.min(SCREEN_WIDTH, 480);
const CARD_WIDTH = CAPPED_WIDTH - spacing.xl * 2;

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;


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
    body: 'Varje fråga inleds med “Vem här…?” och er uppgift är att läsa av rummet för att se vem ni tycker passar bäst in som svar på frågan. Väljer ni samma person som svar eller tycker ni helt olika? Vart går gränsen mellan knivskarp intuition och förblindande fördomar?',
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
        {/* Center: logo + title + tagline */}
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

        {/* Bottom: swipe hint */}
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
    <Animated.View
      style={[styles.dot, { width, backgroundColor }]}
    />
  );
}

function AnimatedCta({ colors, onPress }: { colors: ReturnType<typeof useColors>; onPress: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Pressable
        style={[styles.ctaButton, { borderColor: colors.textPrimary }]}
        onPress={onPress}
        hitSlop={8}
      >
        <Text selectable={false} style={[styles.ctaText, { color: colors.textPrimary }]}>
          Börja spela
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const colors = useColors();
  const haptics = useHaptics();
const setHasSeenOnboarding = useGameStore((s) => s.setHasSeenOnboarding);
  const [topIndex, setTopIndex] = useState(0);
  const [dotIndex, setDotIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<'forward' | 'back'>('forward');
  const frozenUndercardIndex = useRef<number | null>(null);

  const dragX = useRef(new Animated.Value(0)).current;

  const topIndexRef = useRef(topIndex);
  topIndexRef.current = topIndex;

  const dismissRef = useRef(async () => {});
  dismissRef.current = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasSeenOnboarding(true);
    router.replace('/');
  };

  const dismiss = () => dismissRef.current();

  const goNext = () => {
    const cur = topIndexRef.current;
    const next = cur + 1;
    haptics.light();
    setSwipeDir('forward');
    setDotIndex(Math.min(next, SLIDES.length - 1));
    if (next >= SLIDES.length) {
      Animated.timing(dragX, { toValue: -SCREEN_WIDTH * 1.5, duration: 220, useNativeDriver: true }).start(() => dismissRef.current());
      return;
    }
    Animated.timing(dragX, { toValue: -SCREEN_WIDTH * 1.5, duration: 220, useNativeDriver: true }).start(() => {
      setTopIndex(next);
      requestAnimationFrame(() => dragX.setValue(0));
    });
  };

  const goPrev = () => {
    const cur = topIndexRef.current;
    const prev = cur - 1;
    if (prev < 0) return;
    haptics.light();
    setSwipeDir('back');
    setDotIndex(prev);
    frozenUndercardIndex.current = cur + 1;
    Animated.timing(dragX, { toValue: SCREEN_WIDTH * 1.5, duration: 150, useNativeDriver: true }).start(() => {
      dragX.setValue(-SCREEN_WIDTH * 1.5);
      setTopIndex(prev);
      requestAnimationFrame(() => {
        Animated.spring(dragX, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 400, mass: 0.8 }).start(() => {
          frozenUndercardIndex.current = null;
          setSwipeDir('forward');
        });
      });
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        dragX.stopAnimation();
      },
      onPanResponderMove: (_, g) => {
        if (g.dx > 0 && topIndexRef.current === 0) return;
        dragX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        const cur = topIndexRef.current;
        const goLeft = g.dx < -SWIPE_DISTANCE || g.vx < -(SWIPE_VELOCITY / 1000);
        const goRight = g.dx > SWIPE_DISTANCE || g.vx > (SWIPE_VELOCITY / 1000);
        if (goLeft) {
          goNext();
        } else if (goRight && cur > 0) {
          goPrev();
        } else {
          Animated.spring(dragX, { toValue: 0, damping: 20, stiffness: 300, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const topCardStyle = {
    transform: [
      { translateX: dragX },
      {
        rotate: dragX.interpolate({
          inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          outputRange: ['-7deg', '0deg', '7deg'],
        }),
      },
    ],
  };

  const undercardIdx = frozenUndercardIndex.current ?? topIndex + 1;
  const nextSlide: Slide | undefined = SLIDES[undercardIdx];
  const nextCardOpacity = dragX.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, -SWIPE_DISTANCE, 0, SWIPE_DISTANCE, SCREEN_WIDTH * 1.5],
    outputRange: [1, 1, 0, 1, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View style={styles.cardArea} {...panResponder.panHandlers}>
        {/* Next slide sits underneath — peeks when swiping left or right (not on welcome slide) */}
        {nextSlide && (
          <Animated.View style={[styles.cardWrapper, { opacity: nextCardOpacity }]}>
            <SlideCard slide={nextSlide} />
          </Animated.View>
        )}

        {/* Top card — draggable */}
        <Animated.View style={[styles.cardWrapper, topCardStyle]}>
          <SlideCard slide={SLIDES[topIndex]} />
        </Animated.View>
      </View>

      <View style={styles.dots} pointerEvents="none">
        {SLIDES.map((_, i) => (
          <AnimatedDot key={i} active={i === dotIndex} colors={colors} />
        ))}
      </View>

      <View style={styles.bottomArea}>
        {topIndex < SLIDES.length - 1 ? (
          <Pressable onPress={dismiss} hitSlop={12}>
            <Text selectable={false} style={[styles.skipText, { color: colors.textMuted }]}>hoppa över</Text>
          </Pressable>
        ) : (
          <AnimatedCta colors={colors} onPress={() => { haptics.success(); dismiss(); }} />
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
  cardWrapper: {
    position: 'absolute',
    width: CARD_WIDTH,
  },
  skipText: {
    ...typography.caption,
    letterSpacing: 1,
  },
  card: {
    width: CARD_WIDTH,
    height: dim.cardHeight,
    borderRadius: radius.xl,
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
    fontFamily: fonts.brand,
    fontSize: 38,
    lineHeight: 52,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  welcomeSubheading: {
    fontFamily: fonts.regular,
    fontSize: 20,
    lineHeight: 28,
    opacity: 0.6,
    textAlign: 'center',
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
  ctaButton: {
    width: CARD_WIDTH,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
