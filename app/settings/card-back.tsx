import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const CARD_BACK_KEY = '@whohere/cardBackStyle';
import { Circle, Defs, Path, Pattern, Rect, Svg } from 'react-native-svg';
import { AppColors, darkColors, radius, spacing, typography } from '../../src/constants/theme';
import { useColors } from '../../src/hooks/useColors';
import { useGameStore } from '../../src/store/gameStore';
import AppHeader from '../../src/components/AppHeader';

type CardBackStyle = 'plain' | 'pattern' | 'bubbles' | 'chevron' | 'polka' | 'tictactoe';

const OPTIONS: { id: CardBackStyle; label: string; sub: string }[] = [
  { id: 'plain',   label: 'Enfärgad',     sub: 'Ren bakgrund utan mönster' },
  { id: 'chevron', label: 'Curtain',    sub: '' },
  { id: 'bubbles', label: 'Moroccan',   sub: '' },
  { id: 'pattern', label: 'Skulls',     sub: '' },
  { id: 'polka',   label: 'Polka Dots', sub: '' },
  { id: 'tictactoe', label: 'Tic Tac Toe', sub: '' },
];

const PREVIEW_COLOR = darkColors.accent;

function PatternPreview({ id }: { id: CardBackStyle }) {
  if (id === 'plain') return null;
  if (id === 'chevron') {
    return (
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <Pattern id="prev-chevron" x="0" y="0" width="44" height="12" patternUnits="userSpaceOnUse">
            <Path d="M20 12v-2L0 0v10l4 2h16zm18 0l4-2V0L22 10v2h16zM20 0v8L4 0h16zm18 0L22 8V0h16z" fill={PREVIEW_COLOR} fillOpacity={0.15} fillRule="evenodd" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#prev-chevron)" />
      </Svg>
    );
  }
  if (id === 'bubbles') {
    return (
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <Pattern id="prev-bubbles" x="0" y="0" width="80" height="88" patternUnits="userSpaceOnUse">
            <Path d="M22 21.91V26h-2c-9.94 0-18 8.06-18 18 0 9.943 8.058 18 18 18h2v4.09c8.012.722 14.785 5.738 18 12.73 3.212-6.99 9.983-12.008 18-12.73V62h2c9.94 0 18-8.06 18-18 0-9.943-8.058-18-18-18h-2v-4.09c-8.012-.722-14.785-5.738-18-12.73-3.212 6.99-9.983 12.008-18 12.73zM54 58v4.696c-5.574 1.316-10.455 4.428-14 8.69-3.545-4.262-8.426-7.374-14-8.69V58h-5.993C12.27 58 6 51.734 6 44c0-7.732 6.275-14 14.007-14H26v-4.696c5.574-1.316 10.455-4.428 14-8.69 3.545 4.262 8.426 7.374 14 8.69V30h5.993C67.73 30 74 36.266 74 44c0 7.732-6.275 14-14.007 14H54zM42 88c0-9.94 8.06-18 18-18h2v-4.09c8.016-.722 14.787-5.738 18-12.73v7.434c-3.545 4.262-8.426 7.374-14 8.69V74h-5.993C52.275 74 46 80.268 46 88h-4zm-4 0c0-9.943-8.058-18-18-18h-2v-4.09c-8.012-.722-14.785-5.738-18-12.73v7.434c3.545 4.262 8.426 7.374 14 8.69V74h5.993C27.73 74 34 80.266 34 88h4zm4-88c0 9.943 8.058 18 18 18h2v4.09c8.012.722 14.785 5.738 18 12.73v-7.434c-3.545-4.262-8.426-7.374-14-8.69V14h-5.993C52.27 14 46 7.734 46 0h-4zM0 34.82c3.213-6.992 9.984-12.008 18-12.73V18h2c9.94 0 18-8.06 18-18h-4c0 7.732-6.275 14-14.007 14H14v4.696c-5.574 1.316-10.455 4.428-14 8.69v7.433z" fill={PREVIEW_COLOR} fillOpacity={0.15} fillRule="evenodd" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#prev-bubbles)" />
      </Svg>
    );
  }
  if (id === 'polka') return <PatternPreviewPolka />;
  if (id === 'tictactoe') return <PatternPreviewTicTacToe />;
  // pattern (circuit)
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
      <Defs>
        <Pattern id="prev-circuit" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
          <Path d="M82.42 180h-1.415L0 98.995v-2.827L6.167 90 0 83.833V81.004L81.005 0h2.827L90 6.167 96.167 0H98.996L180 81.005v2.827L173.833 90 180 96.167V98.996L98.995 180h-2.827L90 173.833 83.833 180H82.42zm0-1.414L1.413 97.58 8.994 90l-7.58-7.58L82.42 1.413 90 8.994l7.58-7.58 81.006 81.005-7.58 7.58 7.58 7.58-81.005 81.006-7.58-7.58-7.58 7.58zM175.196 0h-25.832c1.033 2.924 2.616 5.59 4.625 7.868C152.145 9.682 151 12.208 151 15c0 5.523 4.477 10 10 10 1.657 0 3 1.343 3 3v4h16V0h-4.803c.51.883.803 1.907.803 3 0 3.314-2.686 6-6 6s-6-2.686-6-6c0-1.093.292-2.117.803-3h10.394-13.685C161.18.938 161 1.948 161 3v4c-4.418 0-8 3.582-8 8s3.582 8 8 8c2.76 0 5 2.24 5 5v2h4v-4h2v4h4v-4h2v4h2V0h-4.803zm-15.783 0c-.27.954-.414 1.96-.414 3v2.2c-1.25.254-2.414.74-3.447 1.412-1.716-1.93-3.098-4.164-4.054-6.612h7.914zM180 17h-3l2.143-10H180v10zm-30.635 163c-.884-2.502-1.365-5.195-1.365-8 0-13.255 10.748-24 23.99-24H180v32h-30.635zm12.147 0c.5-1.416 1.345-2.67 2.434-3.66l-1.345-1.48c-1.498 1.364-2.62 3.136-3.186 5.14H151.5c-.97-2.48-1.5-5.177-1.5-8 0-12.15 9.84-22 22-22h8v30h-18.488zm13.685 0c-1.037-1.793-2.976-3-5.197-3-2.22 0-4.16 1.207-5.197 3h10.394zM0 148h8.01C21.26 148 32 158.742 32 172c0 2.805-.48 5.498-1.366 8H0v-32zm0 2h8c12.15 0 22 9.847 22 22 0 2.822-.53 5.52-1.5 8h-7.914c-.567-2.004-1.688-3.776-3.187-5.14l-1.346 1.48c1.09.99 1.933 2.244 2.434 3.66H0v-30zm15.197 30c-1.037-1.793-2.976-3-5.197-3-2.22 0-4.16 1.207-5.197 3h10.394zM0 32h16v-4c0-1.657 1.343-3 3-3 5.523 0 10-4.477 10-10 0-2.794-1.145-5.32-2.992-7.134C28.018 5.586 29.6 2.924 30.634 0H0v32zm0-2h2v-4h2v4h4v-4h2v4h4v-2c0-2.76 2.24-5 5-5 4.418 0 8-3.582 8-8s-3.582-8-8-8V3c0-1.052-.18-2.062-.512-3H0v30zM28.5 0c-.954 2.448-2.335 4.683-4.05 6.613-1.035-.672-2.2-1.16-3.45-1.413V3c0-1.04-.144-2.046-.414-3H28.5zM0 17h3L.857 7H0v10zM15.197 0c.51.883.803 1.907.803 3 0 3.314-2.686 6-6 6S4 6.314 4 3c0-1.093.292-2.117.803-3h10.394zM109 115c-1.657 0-3 1.343-3 3v4H74v-4c0-1.657-1.343-3-3-3-5.523 0-10-4.477-10-10 0-2.793 1.145-5.318 2.99-7.132C60.262 93.638 58 88.084 58 82c0-13.255 10.748-24 23.99-24h16.02C111.26 58 122 68.742 122 82c0 6.082-2.263 11.636-5.992 15.866C117.855 99.68 119 102.206 119 105c0 5.523-4.477 10-10 10zm0-2c-2.76 0-5 2.24-5 5v2h-4v-4h-2v4h-4v-4h-2v4h-4v-4h-2v4h-4v-4h-2v4h-4v-2c0-2.76-2.24-5-5-5-4.418 0-8-3.582-8-8s3.582-8 8-8v-4c0-2.64 1.136-5.013 2.946-6.66L72.6 84.86C70.39 86.874 69 89.775 69 93v2.2c-1.25.254-2.414.74-3.447 1.412C62.098 92.727 60 87.61 60 82c0-12.15 9.84-22 22-22h16c12.15 0 22 9.847 22 22 0 5.61-2.097 10.728-5.55 14.613-1.035-.672-2.2-1.16-3.45-1.413V93c0-3.226-1.39-6.127-3.6-8.14l-1.346 1.48C107.864 87.987 109 90.36 109 93v4c4.418 0 8 3.582 8 8s-3.582 8-8 8zM90.857 97L93 107h-6l2.143-10h1.714zM80 99c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm20 0c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6z" fill={PREVIEW_COLOR} fillOpacity={0.075} fillRule="evenodd" />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#prev-circuit)" />
    </Svg>
  );
}

function PatternPreviewTicTacToe() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
      <Defs>
        <Pattern id="prev-tictactoe" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
          <Path d="M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z" fill={PREVIEW_COLOR} fillOpacity={0.15} fillRule="evenodd" />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#prev-tictactoe)" />
    </Svg>
  );
}

function PatternPreviewPolka() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
      <Defs>
        <Pattern id="prev-polka" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <Circle cx="3" cy="3" r="3" fill={PREVIEW_COLOR} fillOpacity={0.15} />
          <Circle cx="13" cy="13" r="3" fill={PREVIEW_COLOR} fillOpacity={0.15} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#prev-polka)" />
    </Svg>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxxl,
      gap: spacing.lg,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    option: {
      width: '47%',
      borderRadius: radius.lg,
      borderWidth: 2,
      overflow: 'hidden',
    },
    preview: {
      height: 120,
      backgroundColor: '#101010',
    },
    label: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      ...typography.caption,
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });
}

export default function CardBackPickerScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const cardBackStyle = useGameStore((s) => s.cardBackStyle);
  const setCardBackStyle = useGameStore((s) => s.setCardBackStyle);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {OPTIONS.map((opt) => {
            const selected = cardBackStyle === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.option, { borderColor: selected ? colors.accent : 'transparent' }]}
                onPress={() => {
                  setCardBackStyle(opt.id);
                  AsyncStorage.setItem(CARD_BACK_KEY, opt.id);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.preview}>
                  <PatternPreview id={opt.id} />
                </View>
                <Text style={[styles.label, { color: selected ? colors.accent : colors.textSecondary }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
