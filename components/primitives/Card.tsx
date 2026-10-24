// The rounded "glassy" surface every widget sits on: a lighter plum layer with a
// hairline top-light edge and soft shadow instead of hard borders. Pass onPress
// to make the whole card tappable (with spring press feedback).

import { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../../theme';
import PressableScale from './PressableScale';

export type CardVariant = 'default' | 'raised' | 'accent' | 'warm' | 'caution';

const variantStyle: Record<CardVariant, ViewStyle> = {
  default: { backgroundColor: colors.surface },
  raised: { backgroundColor: colors.surfaceRaised },
  accent: { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder },
  warm: { backgroundColor: colors.warmSoft },
  caution: { backgroundColor: colors.cautionSoft },
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
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      default: {},
    }),
  },
});
