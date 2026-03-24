import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import FingerIcon from '../assets/icons/noun-finger-3414109.svg';
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  appName,
  dimensions as dim,
  radius,
  spacing,
  typography,
} from '../src/constants/theme';
import { useColors } from '../src/hooks/useColors';
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
    subheading: 'Intuitiva mikrohistorier\nom människor omkring oss',
    body: '',
    bottomLabel: '',
    isWelcome: true,
  },
  {
    id: '2',
    topLabel: 'VEM HÄR ÄR',
    headline: 'Ett helt nytt spel.',
    body: 'Som du redan har spelat i hela ditt liv. Du är omgiven av människor du inte känner - men vad har de att berätta, utan att säga ett ord? Vi möter ständigt omvärlden med både intuition och intellekt. Genom erfarenhet och undermedvetna fördomar drar vi snabba slutsatser om andra människors inre världar.',
    bottomLabel: 'bla bla',
  },
  {
    id: '3',
    topLabel: 'VEM HÄR ÄR',
    headline: 'Självreflektion',
    body: 'Vi tror oss veta något om främlingars bakgrunder, personligheter och liv. Men det vi tror oss kunna se säger minst lika mycket om oss själva som om de människor vi betraktar. Vad som är sant är inte det intressanta här, det är våra egna mikrohistorier som är det.',
    bottomLabel: 'lugnt och nyfiket',
  },

  {
    id: '4',
    topLabel: 'VEM HÄR ÄR',
    headline: 'Inte en tävling',
    body: 'Det finns inga rätt eller fel svar, inga vinnare eller förlorare, bara skratt, gemensam reflektion och nya perspektiv.',
    bottomLabel: 'thin-slice judgment',
  },
  {
    id: '5',
    topLabel: 'SÅ HÄR GÅR DET TILL',
    headline: 'Observera',
    body: '...människorna omkring dig. Spela med din dejt, med dina vänner eller på egen hand. Befinn er på en plats med människor omkring er. I en restaurang, tunnelbanan eller en park.',
    bottomLabel: 'svep för att börja spela',
  },
    {
    id: '6',
    topLabel: 'SÅ HÄR GÅR DET TILL',
    headline: 'Välj',
    body: '...en kategori eller blanda helt fritt. Läs frågan tillsammans, besvara den var och en.',
    bottomLabel: 'lugnt och nyfiket',
  },
    {
    id: '7',
    topLabel: 'SÅ HÄR GÅR DET TILL',
    headline: 'Motivera',
    body: '...vem som passar in och varför? Väljer ni samma person eller helt olika? Övertänk inte, men motivera gärna.',
    bottomLabel: 'lugnt och nyfiket',
  },
    {
    id: '8',
    topLabel: 'KOM IHÅG',
    headline: 'Du är en fluga på väggen.',
    body: '...den som betraktar utan att synas. Syftet är inte att göra andra obekväma, utan att sätta ord på era egna tankar. Se utan att stirra - välj utan att peka. Människorna omkring er är inte med i spelet. de är bara era livs levande projektionsytor. Det ni tror er veta om dem är mikrohistorier som ni själva vanemässigt skapar. Skillnaden mot vardagen är enkel: Här får ni syn på era sätt att se.',
    bottomLabel: 'lugnt och nyfiket',
  },
];

function SwipeHint() {
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
      <FingerIcon width={32} height={32} fill={colors.textMuted} />
    </Animated.View>
  );
}

function SlideCard({ slide }: { slide: Slide }) {
  const colors = useColors();

  if (slide.isWelcome) {
    return (
      <View style={[styles.card, styles.cardWelcome, { backgroundColor: colors.bgPrimary, borderColor: colors.textPrimary }]}>
        <Text selectable={false} style={{ color: colors.textPrimary, fontSize: 48, lineHeight: 56, textAlign: 'center' }}>{appName}</Text>
        <View style={styles.swipeHintRow}>
          <SwipeHint />
          <Text selectable={false} style={[styles.swipeHintLabel, { color: colors.textMuted }]}>svep för att börja</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.textPrimary }]}>
      <Text selectable={false} style={[styles.topLabel, { color: colors.textMuted }]}>{slide.topLabel}</Text>

      <View style={styles.cardMiddle}>
        <Text selectable={false} style={[styles.headline, { color: colors.textPrimary }]}>{slide.headline}</Text>
        <Text selectable={false} style={[styles.body, { color: colors.textMuted }]}>{slide.body}</Text>
      </View>

      <View style={styles.cardBottom} />
    </View>
  );
}

export default function OnboardingScreen() {
  const colors = useColors();
  const { from } = useLocalSearchParams<{ from?: string }>();
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
    if (from === 'settings') {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const dismiss = () => dismissRef.current();

  const goNext = () => {
    const cur = topIndexRef.current;
    const next = cur + 1;
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

      {topIndex < SLIDES.length - 1 && (
        <Pressable style={styles.skipButton} onPress={dismiss} hitSlop={12}>
          <Text selectable={false} style={[styles.skipText, { color: colors.textMuted }]}>hoppa över</Text>
        </Pressable>
      )}

      <View style={styles.dots} pointerEvents="none">
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                width: i === dotIndex ? 20 : dim.dotSize,
                backgroundColor: i === dotIndex ? colors.textPrimary : colors.textMuted,
              },
            ]}
          />
        ))}
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
  skipButton: {
    position: 'absolute',
    top: spacing.xxxl,
    right: spacing.lg,
    zIndex: 10,
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
  },
  cardBottom: {
    alignItems: 'flex-end',
  },
  mascotBottomRight: {
    alignSelf: 'flex-end',
  },
  mascotTopCenter: {
    alignSelf: 'center',
  },
  cardWelcome: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  rotatedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeHeadingGroup: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headlineWelcome: {
    ...typography.brand,
  },
  subheading: {
    ...typography.caption,
  },
  swipeHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  swipeHintLabel: {
    ...typography.caption,
    letterSpacing: 1.5,
  },
  dots: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    height: dim.dotSize,
    borderRadius: dim.dotSize / 2,
  },
});
