// The rounded surface every widget sits on: a lighter plum layer with a faint
// top-light edge and soft shadow, never a hard border. Pass onPress to make the
// whole card tappable (spring press + one step lighter while held).

import { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { cardPadding, colors, radii } from '../../theme';
import PressableScale from './PressableScale';

export type CardVariant = 'default' | 'raised' | 'primary' | 'caution' | 'warm' | 'accent';

const variantStyle: Record<CardVariant, ViewStyle> = {
  default: { backgroundColor: colors.surface1 },
  raised: { backgroundColor: colors.surface2 },
  primary: { backgroundColor: colors.primarySoft },
  accent: { backgroundColor: colors.primarySoft }, // legacy alias
  caution: { backgroundColor: colors.cautionSoft },
  warm: { backgroundColor: colors.warmSoft },
};

export default function Card({
  children,
  variant = 'default',
  onPress,
  onLongPress,
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const cardStyle = [styles.card, variantStyle[variant], style];
  if (onPress || onLongPress) {
    return (
      <PressableScale
        onPress={onPress}
        onLongPress={onLongPress}
        haptic="tap"
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={cardStyle}
        pressedStyle={variant === 'default' ? styles.pressed : undefined}
      >
        {children}
      </PressableScale>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: cardPadding,
    borderWidth: 1,
    borderColor: colors.highlight,
    shadowColor: colors.shadow,
    ...Platform.select({
      ios: { shadowOpacity: 0.45, shadowRadius: 22, shadowOffset: { width: 0, height: 14 } },
      default: { elevation: 6 },
    }),
  },
  pressed: {
    backgroundColor: colors.surface2,
  },
});
