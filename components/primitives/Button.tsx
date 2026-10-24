// Pill-shaped button. Variants carry meaning:
//   primary   — the one main action on a screen (cyan)
//   secondary — alternative actions (quiet surface)
//   warm      — celebratory confirmations (e.g. unlock a level)
//   ghost     — lowest emphasis, text-only
// Disabled dims and blocks; loading swaps the label for a spinner.

import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ColorToken, colors, radii, spacing } from '../../theme';
import AppText from './AppText';
import Icon, { IconName } from './Icon';
import PressableScale from './PressableScale';

type Variant = 'primary' | 'secondary' | 'warm' | 'ghost';

const fill: Record<Variant, string> = {
  primary: colors.accent,
  secondary: colors.surface,
  warm: colors.warm,
  ghost: 'transparent',
};

const textColor: Record<Variant, ColorToken> = {
  primary: 'onAccent',
  secondary: 'textPrimary',
  warm: 'onWarm',
  ghost: 'textSecondary',
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
}) {
  const inactive = disabled || loading;
  const fg = inactive && variant !== 'ghost' ? 'textTertiary' : textColor[variant];

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      haptic="tap"
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={[
        styles.button,
        { backgroundColor: fill[variant] },
        variant === 'secondary' && styles.secondary,
        inactive && variant !== 'ghost' && styles.inactive,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[textColor[variant]]} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={20} color={colors[fg]} /> : null}
          <AppText variant="button" color={fg}>
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
  secondary: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  inactive: {
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
