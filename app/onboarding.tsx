import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
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
const SWIPE_THRESHOLD = 60;

type Slide = {
  id: string;
  topLabel: string;
  headline: string;
  subheading?: string;
  body: string;
  isWelcome?: boolean;
};

const SLIDES: Slide[] = [
  {
    id: '1',
    topLabel: '',
    headline: 'VEM$HÄR...?',
    subheading: 'Intuitiva mikrohistorier om människor omkring.',
    body: '',
    isWelcome: true,
  },
  {
    id: '2',
    topLabel: 'THE GAME',
    headline: 'Observera, välj, avslöja.',
    body: 'Ni får ett antal frågor. Rummet fullt av människor. Vem passar in på beskrivningen? Alla väljer tyst, var för sig. Sen berättar ni.',
  },
  {
    id: '3',
    topLabel: 'THE EXPERIMENT',
    headline: 'Inga vinnare, inga förlorare. ',
    body: 'Bara nya sätt att se på varandra. Det spelar ingen roll vem du väljer. Det intressanta är varför. Väjer ni samma eller olika? Varför? Det är hela grejen. Motiveringarna är det roliga, inte svaren.',
  },
  {
    id: '4',
    topLabel: 'THE INSIGHT',
    headline: 'Thin-slice judgment.',
    body: 'Vi bedömer alla främlingar hela tiden, omedvetet, automatiskt, på en bråkdel av en sekund. Hot, status, karaktär. Det sker alltid. Men vi säger det aldrig högt. ',
  },
  {
    id: '5',
    topLabel: 'THE INSIGHT',
    headline: 'Valen speglar dig.',
    body: 'Dina val avslöjar mer om dig än om dem. De blir små fönster in i hur du ser på världen, på andra människor, och kanske mest intressant av allt: hur du ser på dig själv.',
  },
  {
    id: '6',
    topLabel: 'THE RESPECT',
    headline: 'Spela osynligt.',
    body: 'Ni är spöken i rummet. Osynliga, tysta, närvarande. Främlingarna är aldrig inblandade. De pekas aldrig ut, talas aldrig till. De vet ingenting. Det här är inte övervakning eller hån. Det är empatiträning i förklädnad. Varje val leder tillbaka till dig: varför valde du just den personen?',
  },
];

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
          <FingerIcon width={32} height={32} fill={colors.textMuted} />
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
  const [index, setIndex] = useState(0);
  const [dotIndex, setDotIndex] = useState(0);

  const dragX = useRef(new Animated.Value(0)).current;
  const indexRef = useRef(index);
  indexRef.current = index;

  const dismiss = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasSeenOnboarding(true);
    router.replace('/');
  };

  const goNext = () => {
    const cur = indexRef.current;
    const next = cur + 1;
    if (next >= SLIDES.length) {
      dismiss();
      return;
    }
    Animated.timing(dragX, {
      toValue: -SCREEN_WIDTH * 1.5,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setDotIndex(next);
      setIndex(next);
      requestAnimationFrame(() => dragX.setValue(0));
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
        if (g.dx < 0) dragX.setValue(g.dx);
        else dragX.setValue(g.dx * 0.1); // slight resistance on right
      },
      onPanResponderRelease: (_, g) => {
        const goLeft = g.dx < -SWIPE_THRESHOLD || g.vx < -0.4;
        if (goLeft) {
          goNext();
        } else {
          Animated.spring(dragX, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 300,
          }).start();
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

  const nextSlide = SLIDES[index + 1];

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <View style={styles.cardArea} {...panResponder.panHandlers}>
        {/* Next card sits underneath — no animation */}
        {nextSlide && (
          <View style={styles.cardWrapper}>
            <SlideCard slide={nextSlide} />
          </View>
        )}

        {/* Top card — draggable */}
        <Animated.View style={[styles.cardWrapper, topCardStyle]}>
          <SlideCard slide={SLIDES[index]} />
        </Animated.View>
      </View>

      {index < SLIDES.length - 1 && (
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
