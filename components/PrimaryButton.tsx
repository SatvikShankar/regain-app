// Primary action button — rounded cyan fill (the app's main "go" control).
// Used for Continue, Start, etc. Disabled state dims and blocks the press.
// Visual feel gets tuned in the polish pass; the contract is stable.

import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from './ScreenContainer';

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'subtle';
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'subtle' && styles.subtle,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'subtle' ? colors.textPrimary : '#0E1416'} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'subtle' && styles.labelSubtle,
            isDisabled && styles.labelDisabled,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  subtle: {
    backgroundColor: colors.surface,
  },
  disabled: {
    backgroundColor: colors.surface,
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    color: '#0E1416',
    fontSize: 16,
    fontWeight: '700',
  },
  labelSubtle: {
    color: colors.textPrimary,
  },
  labelDisabled: {
    color: colors.textSecondary,
  },
});
