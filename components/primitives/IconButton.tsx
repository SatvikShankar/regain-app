// Round 44pt icon-only button (headers, small actions). `filled` sits on a
// surface-1 circle; `plain` is just the icon (e.g. ⋮ inside a card). Always pass
// an accessibilityLabel — there's no visible text for screen readers.

import { StyleSheet } from 'react-native';
import { colors, radii, touchTarget } from '../../theme';
import Icon, { IconName } from './Icon';
import PressableScale from './PressableScale';

export default function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'filled',
  size = touchTarget,
}: {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: 'filled' | 'raised' | 'plain';
  size?: number;
}) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="tap"
      scaleTo={0.92}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.button,
        { width: size, height: size },
        variant === 'filled' && styles.filled,
        variant === 'raised' && styles.raised,
      ]}
      pressedStyle={variant === 'plain' ? styles.plainPressed : styles.raised}
    >
      <Icon name={icon} size={22} color={variant === 'plain' ? colors.text3 : colors.text1} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    backgroundColor: colors.surface1,
  },
  raised: {
    backgroundColor: colors.surface2,
  },
  plainPressed: {
    backgroundColor: colors.surface2,
  },
});
