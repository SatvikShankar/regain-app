// Round icon-only button (header back/home, small actions). Always pass an
// accessibilityLabel — there's no visible text for screen readers to read.

import { StyleSheet } from 'react-native';
import { colors } from '../../theme';
import Icon, { IconName } from './Icon';
import PressableScale from './PressableScale';

export default function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'filled',
}: {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: 'filled' | 'ghost';
}) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="tap"
      scaleTo={0.9}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.button, variant === 'filled' && styles.filled]}
    >
      <Icon name={icon} size={22} color={colors.textPrimary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
