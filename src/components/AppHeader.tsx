import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../constants/theme';
import EyesLogo from './EyesLogo';

export default function AppHeader() {
  return (
    <View style={styles.container}>
      <EyesLogo size={72} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
});
