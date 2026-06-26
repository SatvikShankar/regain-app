// Placeholder screen scaffold for Step 1.
// Provides the dark warm-plum background, safe-area padding, a screen title,
// and a lightweight nav button so the empty screens are walkable on device.
// This is NOT the final design system — the real theme, PrimaryButton, and
// polished surfaces come in the later build steps (see SCREENS.md).

import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Minimal shared palette for the skeleton. Final hex values are tuned on-device
// during the polish pass; these just establish the warm-dark direction now.
export const colors = {
  background: '#1E1420', // deep aubergine / dark plum
  surface: '#2C1F30',
  accent: '#5FB6C4', // muted cyan — primary/active
  accentWarm: '#E8A87C', // warm pastel — celebratory only
  danger: '#E0A4B0', // distinct "see a doctor" tone — not an alarm red
  textPrimary: '#F2ECEF',
  textSecondary: '#A99BA8',
};

// Vertical space the floating bottom nav occupies. Screens add this much bottom
// padding so their content/controls never sit underneath the bar.
export const bottomNavClearance = 104;

export function ScreenContainer({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.children}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

export function LinkButton({
  label,
  onPress,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'subtle';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'subtle' && styles.buttonSubtle,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text
        style={[styles.buttonLabel, variant === 'subtle' && styles.buttonLabelSubtle]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: bottomNavClearance,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 8,
    lineHeight: 21,
  },
  children: {
    marginTop: 28,
    gap: 12,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: 'center',
  },
  buttonSubtle: {
    backgroundColor: colors.surface,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonLabel: {
    color: '#0E1416',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonLabelSubtle: {
    color: colors.textPrimary,
  },
});
