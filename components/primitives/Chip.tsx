// Small selectable pill (check-in answers, filters). Selected = cyan tint +
// border, same selected language as OptionCard.

import { StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../../theme';
import AppText from './AppText';
import PressableScale from './PressableScale';

export default function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      scaleTo={0.94}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.selected]}
    >
      <AppText variant="smallStrong" color={selected ? 'accent' : 'textPrimary'}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  selected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentBorder,
  },
});
