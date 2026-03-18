import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  dimensions as dim,
  fonts,
  radius,
  spacing,
  typography,
} from '../src/constants/theme';
import { useGameStore } from '../src/store/gameStore';

const ONBOARDING_KEY = '@whohere/hasSeenOnboarding';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.xl * 2;

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;

// Per-depth offsets for the stacked deck look
const DEPTH_OFFSET_X = 10;  // each card shifts right
const DEPTH_OFFSET_Y = 12;  // each card shifts down
const DEPTH_SCALE = 0.05;   // each card shrinks by this per level

const TEXT_PRIMARY = '#FFFFFF';
const TEXT_MUTED = 'rgba(255,255,255,0.4)';

type Slide = {
  id: string;
  topLabel: string;
  headline: string;
  body: string;
  bottomLabel: string;
};

const SLIDES: Slide[] = [
  {
    id: '1',
    topLabel: 'LOREM IPSUM',
    headline: 'Lorem ipsum dolor sit amet.',
    body: 'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    bottomLabel: 'lorem ipsum',
  },
  {
    id: '2',
    topLabel: 'LOREM IPSUM',
    headline: 'Ut enim ad minim veniam.',
    body: 'Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    bottomLabel: 'lorem ipsum',
  },
  {
    id: '3',
    topLabel: 'LOREM IPSUM',
    headline: 'Duis aute irure dolor.',
    body: 'In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    bottomLabel: 'lorem ipsum',
  },
  {
    id: '4',
    topLabel: 'LOREM IPSUM',
    headline: 'Excepteur sint occaecat.',
    body: 'Cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    bottomLabel: 'lorem ipsum',
  },
  {
    id: '5',
    topLabel: 'LOREM IPSUM',
    headline: 'Sed ut perspiciatis unde.',
    body: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
    bottomLabel: 'lorem ipsum',
  },
];

function SlideCard({ slide }: { slide: Slide }) {
  return (
    <View style={styles.card}>
      <Text selectable={false} style={styles.topLabel}>{slide.topLabel}</Text>

      <View style={styles.cardMiddle}>
        <Text selectable={false} style={styles.headline}>{slide.headline}</Text>
        <Text selectable={false} style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.cardBottom}>
        <Text selectable={false} style={styles.bottomLabel}>{slide.bottomLabel}</Text>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const setHasSeenOnboarding = useGameStore((s) => s.setHasSeenOnboarding);
  const [topIndex, setTopIndex] = useState(0);

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
            // Navigate immediately so home screen loads underneath the flying card
            dismissRef.current();
            Animated.timing(dragX, { toValue: -SCREEN_WIDTH * 1.5, duration: 240, useNativeDriver: true }).start();
          } else {
            Animated.parallel([
              Animated.timing(dragX, { toValue: -SCREEN_WIDTH * 1.5, duration: 240, useNativeDriver: true }),
              Animated.spring(nextProgress, { toValue: 1, damping: 18, stiffness: 220, useNativeDriver: true }),
            ]).start(() => commitNextRef.current());
          }
        } else if (goRight) {
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
    <View style={styles.container}>
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
          <Text selectable={false} style={styles.skipText}>hoppa över</Text>
        </Pressable>
      )}


      <View style={styles.dots} pointerEvents="none">
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                width: i === topIndex ? 20 : dim.dotSize,
                backgroundColor: i === topIndex ? TEXT_PRIMARY : TEXT_MUTED,
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
    backgroundColor: '#000000',
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
    fontFamily: fonts.ui,
    fontSize: 12,
    letterSpacing: 1,
    color: TEXT_MUTED,
  },
  card: {
    width: CARD_WIDTH,
    height: dim.cardHeight,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: '#000000',
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  topLabel: {
    fontFamily: fonts.ui,
    fontSize: 10,
    letterSpacing: 2,
    color: TEXT_MUTED,
  },
  cardMiddle: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xxxl,
  },
  headline: {
    ...typography.heading,
    fontFamily: fonts.question,
    fontSize: 28,
    color: TEXT_PRIMARY,
    lineHeight: 36,
  },
  body: {
    ...typography.body,
    fontFamily: fonts.copy,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 26,
  },
  cardBottom: {
    gap: spacing.sm,
  },
  bottomLabel: {
    fontFamily: fonts.ui,
    fontSize: 10,
    letterSpacing: 1.5,
    color: TEXT_MUTED,
    textAlign: 'right',
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
