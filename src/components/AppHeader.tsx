import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';
import EyesLogo from './EyesLogo';

interface AppHeaderProps {
  hideSettings?: boolean;
}

export default function AppHeader({ hideSettings = false }: AppHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.side} />

      <View style={styles.center}>
        <EyesLogo size={72} />
      </View>

      <View style={styles.side}>
        {!hideSettings && (
          <Pressable
            onPress={() => router.push('/(tabs)/settings')}
            hitSlop={12}
            style={styles.settingsBtn}
          >
            <Ionicons name="settings-outline" size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  side: {
    width: 28,
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  settingsBtn: {
    padding: 4,
  },
});
