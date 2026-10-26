// Pill button. Variants carry meaning:
//   primary   — the one main action on a screen (sage)
//   secondary — an alternative action (quiet surface)
//   quiet     — lowest emphasis, text-only (e.g. "Skip", "Start over")
//   warm      — celebration moments only (e.g. "See Level 2")
// Pressed = scale 0.97 + one step darker (primary) / lighter (others).
// Disabled = surface-2 fill with text-3 — no opacity tricks, so it stays legible.

import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ColorToken, colors, radii, spacing } from '../../theme';
import AppText from './AppText';
import Icon, { IconName } from './Icon';
import PressableScale from './PressableScale';

type Variant = 'primary' | 'secondary' | 'quiet' | 'warm' | 'ghost'; // ghost = legacy alias of quiet

const fill: Record<Variant, string> = {
  primary: colors.primary,
  secondary: colors.surface2,
  quiet: 'transparent',
  ghost: 'transparent',
  warm: colors.warm,
};

const pressedFill: Record<Variant, string> = {
  primary: colors.primaryPressed,
  secondary: colors.surface3,
  quiet: 'rgba(255, 236, 245, 0.06)',
  ghost: 'rgba(255, 236, 245, 0.06)',
  warm: colors.warm,
};

const textColor: Record<Variant, ColorToken> = {
  primary: 'onPrimary',
  secondary: 'text1',
  quiet: 'text2',
  ghost: 'text2',
  warm: 'onWarm',
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  onRaised = false,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  onRaised?: boolean; // sitting on a surface-2 panel (e.g. a dialog): secondary steps up one surface
}) {
  const inactive = disabled || loading;
  const isQuiet = variant === 'quiet' || variant === 'ghost';
  const fg: ColorToken = inactive ? (isQuiet ? 'radioOff' : 'text3') : textColor[variant];

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      haptic="tap"
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[
        styles.button,
        isQuiet && styles.quiet,
        { backgroundColor: inactive && !isQuiet ? colors.surface2 : fill[variant] },
        onRaised && variant === 'secondary' && { backgroundColor: colors.surface3 },
      ]}
      pressedStyle={{
        backgroundColor: onRaised && variant === 'secondary' ? colors.handle : pressedFill[variant],
      }}
    >
      {loading ? (
        <ActivityIndicator color={colors[textColor[variant]]} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={22} color={colors[fg]} /> : null}
          <AppText variant="button" color={fg} style={isQuiet && styles.quietLabel}>
            {label}
          </AppText>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quiet: {
    minHeight: 48,
  },
  quietLabel: {
    fontFamily: 'Figtree_600SemiBold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
});
