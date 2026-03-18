import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppColors, radius, spacing, typography } from '../constants/theme';
import { useColors } from '../hooks/useColors';
import { DeckMode } from '../types';

const MODES: { value: DeckMode; label: string; emoji: string; description: string }[] = [
  { value: 'solo', label: 'Solo', emoji: '🪞', description: 'Just you' },
  { value: 'partner', label: 'Partner', emoji: '🫂', description: 'Two people' },
  { value: 'group', label: 'Group', emoji: '🎉', description: '3+ people' },
];

type Props = {
  selected: DeckMode | null;
  onSelect: (mode: DeckMode) => void;
};

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    option: {
      flex: 1,
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    optionSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accent + '15',
    },
    emoji: {
      ...typography.heading,
      marginBottom: spacing.xs,
    },
    label: {
      ...typography.bodyMedium,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    labelSelected: {
      color: colors.accent,
    },
    description: {
      ...typography.caption,
      color: colors.textMuted,
    },
  });
}

export function ModeSelector({ selected, onSelect }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      {MODES.map((mode) => {
        const isSelected = selected === mode.value;
        return (
          <TouchableOpacity
            key={mode.value}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => onSelect(mode.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{mode.emoji}</Text>
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{mode.label}</Text>
            <Text style={styles.description}>{mode.description}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
