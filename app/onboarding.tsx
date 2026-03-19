import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import FingerIcon from '../assets/icons/noun-finger-6748636.svg';
import Mascot from '../src/components/Mascot';
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

// Per-depth offsets for the stacked deck look
const DEPTH_OFFSET_X = 10;  // each card shifts right
const DEPTH_OFFSET_Y = 12;  // each card shifts down
const DEPTH_SCALE = 0.05;   // each card shrinks by this per level


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
    topLabel: '',
    headline: 'VEM$HÄR...?',
    subheading: 'Intuitiva mikrohistorier om människor omkring.',
    body: '',
    bottomLabel: '',
    isWelcome: true,
  },
  {
    id: '2',
    topLabel: 'THE GAME',
    headline: 'Observera, välj, avslöja.',
    body: 'Ni får ett antal frågor. Rummet fullt av människor. Vem passar in på beskrivningen? Alla väljer tyst, var för sig. Sen berättar ni.',
    bottomLabel: 'bla bla',
  },
  {
    id: '3',
    topLabel: 'THE EXPERIMENT',
    headline: 'Inga vinnare, inga förlorare. ',
    body: 'Bara nya sätt att se på varandra. Det spelar ingen roll vem du väljer. Det intressanta är varför. Väjer ni samma eller olika? Varför? Det är hela grejen. Motiveringarna är det roliga, inte svaren.',
    bottomLabel: 'lugnt och nyfiket',
  },

  {
    id: '4',
    topLabel: 'THE INSIGHT',
    headline: 'Thin-slice judgment.',
    body: 'Vi bedömer alla främlingar hela tiden, omedvetet, automatiskt, på en bråkdel av en sekund. Hot, status, karaktär. Det sker alltid. Men vi säger det aldrig högt. ',
    bottomLabel: 'thin-slice judgment',
  },
  {
    id: '5',
    topLabel: 'THE INSIGHT',
    headline: 'Valen speglar dig.',
    body: 'Dina val avslöjar mer om dig än om dem. De blir små fönster in i hur du ser på världen, på andra människor, och kanske mest intressant av allt: hur du ser på dig själv.',
    bottomLabel: 'svep för att börja spela',
  },
    {
    id: '6',
    topLabel: 'THE RESPECT',
    headline: 'Spela osynligt.',
    body: 'Ni är spöken i rummet. Osynliga, tysta, närvarande. Främlingarna är aldrig inblandade. De pekas aldrig ut, talas aldrig till. De vet ingenting. Det här är inte övervakning eller hån. Det är empatiträning i förklädnad. Varje val leder tillbaka till dig: varför valde du just den personen?',
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
        <View style={styles.welcomeHeadingGroup}>
          <View style={styles.headlineRow}>
            {slide.headline.split('$').map((part, i, arr) => (
              <React.Fragment key={i}>
                <Text selectable={false} style={[styles.headlineWelcome, { color: colors.textPrimary }]}>{part}</Text>
                {i < arr.length - 1 && <Mascot size={32} style={{ marginHorizontal: spacing.sm }} />}
              </React.Fragment>
            ))}
          </View>
          {!!slide.subheading && (
            <Text selectable={false} style={[styles.subheading, { color: colors.textMuted }]}>{slide.subheading}</Text>
          )}
        </View>
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

      <View style={styles.cardBottom}>
        <Mascot size={20} style={styles.mascotBottomRight} />
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const colors = useColors();
  const setHasSeenOnboarding = useGameStore((s) => s.setHasSeenOnboarding);
  const [topIndex, setTopIndex] = useState(0);
  const [dotIndex, setDotIndex] = useState(0);

  const dragX = useRef(new Animated.Value(0)).current;
  const nextProgress = useRef(new Animated.Value(0)).current;
  // When swiping right: prevDragX starts at -SCREEN_WIDTH and follows finger
  const prevDragX = useRef(new Animated.Value(-SCREEN_WIDTH * 1.5)).current;
  const [showPrev, setShowPrev] = useState(false);

  const topIndexRef = useRef(topIndex);
  topIndexRef.current = topIndex;

  const dismissRef = useRef(async () => {});
  const commitNextRef = useRef(() => {});
  const commitPrevRef = useRef(() => {});

  dismissRef.current = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasSeenOnboarding(true);
    router.replace('/');
  };

  commitNextRef.current = () => {
    const next = topIndexRef.current + 1;
    if (next >= SLIDES.length) { dismissRef.current(); return; }
    dragX.setValue(0);
    nextProgress.setValue(0);
    prevDragX.setValue(-SCREEN_WIDTH * 1.5);
    setShowPrev(false);
    setTopIndex(next);
  };

  commitPrevRef.current = () => {
    const prev = topIndexRef.current - 1;
    if (prev < 0) return;
    dragX.setValue(0);
    nextProgress.setValue(0);
    prevDragX.setValue(-SCREEN_WIDTH * 1.5);
    setShowPrev(false);
    setTopIndex(prev);
  };

  const dismiss = () => dismissRef.current();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        dragX.stopAnimation();
        nextProgress.stopAnimation();
        prevDragX.stopAnimation();
      },
      onPanResponderMove: (_, g) => {
        const cur = topIndexRef.current;
        const isFirst = cur === 0;
        const isLast = cur === SLIDES.length - 1;
        if (g.dx < 0) {
          setShowPrev(false);
          if (isLast) {
            dragX.setValue(g.dx);
            nextProgress.setValue(Math.min(1, -g.dx / (SCREEN_WIDTH * 0.55)));
          } else {
            dragX.setValue(g.dx);
            nextProgress.setValue(Math.min(1, -g.dx / (SCREEN_WIDTH * 0.55)));
          }
        } else {
          if (isFirst) {
            dragX.setValue(g.dx * 0.08);
          } else {
            setShowPrev(true);
            dragX.setValue(g.dx);
            prevDragX.setValue(-SCREEN_WIDTH + g.dx);
          }
        }
      },
      onPanResponderRelease: (_, g) => {
        const cur = topIndexRef.current;
        const isFirst = cur === 0;
        const isLast = cur === SLIDES.length - 1;
        const goLeft = g.dx < -SWIPE_DISTANCE || g.vx < -(SWIPE_VELOCITY / 1000);
        const goRight = !isFirst && (g.dx > SWIPE_DISTANCE || g.vx > (SWIPE_VELOCITY / 1000));

        if (goLeft) {
          if (isLast) {
            dismissRef.current();
            Animated.timing(dragX, { toValue: -SCREEN_WIDTH * 1.5, duration: 240, useNativeDriver: true }).start();
          } else {
            setDotIndex(cur + 1);
            Animated.parallel([
              Animated.timing(dragX, { toValue: -SCREEN_WIDTH * 1.5, duration: 240, useNativeDriver: true }),
              Animated.spring(nextProgress, { toValue: 1, damping: 18, stiffness: 220, useNativeDriver: true }),
            ]).start(() => commitNextRef.current());
          }
        } else if (goRight) {
          setDotIndex(cur - 1);
          Animated.parallel([
            Animated.timing(dragX, { toValue: SCREEN_WIDTH * 1.5, duration: 240, useNativeDriver: true }),
            Animated.timing(prevDragX, { toValue: 0, duration: 240, useNativeDriver: true }),
          ]).start(() => commitPrevRef.current());
        } else {
          Animated.parallel([
            Animated.spring(dragX, { toValue: 0, damping: 20, stiffness: 300, useNativeDriver: true }),
            Animated.spring(nextProgress, { toValue: 0, damping: 20, stiffness: 300, useNativeDriver: true }),
            Animated.spring(prevDragX, { toValue: -SCREEN_WIDTH * 1.5, damping: 20, stiffness: 300, useNativeDriver: true }),
          ]).start(() => setShowPrev(false));
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

  const prevCardAnimStyle = {
    transform: [{ translateX: prevDragX }],
  };

  const prevSlide = SLIDES[topIndex - 1];
  // Cards behind the top card — render from deepest to shallowest
  const behindSlides = SLIDES.slice(topIndex + 1, topIndex + 4);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View style={styles.cardArea} {...panResponder.panHandlers}>
        {/* Stack of cards behind — deepest first so they render under */}
        {[...behindSlides].reverse().map((slide, reversedDepth) => {
          const depth = behindSlides.length - reversedDepth; // 1 = closest behind
          // As top card is dragged left, the next card (depth=1) animates toward depth=0
          const isNext = depth === 1;
          const translateX = isNext
            ? nextProgress.interpolate({ inputRange: [0, 1], outputRange: [DEPTH_OFFSET_X * depth, 0] })
            : DEPTH_OFFSET_X * depth;
          const translateY = isNext
            ? nextProgress.interpolate({ inputRange: [0, 1], outputRange: [DEPTH_OFFSET_Y * depth, 0] })
            : DEPTH_OFFSET_Y * depth;
          const scale = isNext
            ? nextProgress.interpolate({ inputRange: [0, 1], outputRange: [1 - DEPTH_SCALE * depth, 1] })
            : 1 - DEPTH_SCALE * depth;

          return (
            <Animated.View
              key={slide.id}
              style={[styles.cardWrapper, { transform: [{ translateX }, { translateY }, { scale }] }]}
            >
              <SlideCard slide={slide} />
            </Animated.View>
          );
        })}

        {/* Prev card — slides in from left when swiping right */}
        {showPrev && prevSlide && (
          <Animated.View style={[styles.cardWrapper, prevCardAnimStyle]}>
            <SlideCard slide={prevSlide} />
          </Animated.View>
        )}

        {/* Top card */}
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
    justifyContent: 'center',
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
    justifyContent: 'space-between',
  },
  welcomeHeadingGroup: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
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
