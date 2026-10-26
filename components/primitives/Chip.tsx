// Small selectable pill (44pt). Selected = sage fill with a check.

import { StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../../theme';
import AppText from './AppText';
import Icon from './Icon';
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
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={[styles.chip, selected && styles.selected]}
    >
      {selected ? <Icon name="check" size={16} strokeWidth={2.6} color={colors.onPrimary} /> : null}
      <AppText variant="label" color={selected ? 'onPrimary' : 'text2'}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface2,
  },
  selected: {
    backgroundColor: colors.primary,
  },
});
