// Selectable option card for intake questions: full-width, radio (single) or
// rounded-square check (multi). The parent owns selection logic; this renders a
// label and a selected state. Selected = sage tint fill + 1.5px sage ring; the
// radio dot / check springs in. `compact` = the tighter checklist variant.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, radii, spacing, springs } from '../theme';
import AppText from './primitives/AppText';
import Icon from './primitives/Icon';
import PressableScale from './primitives/PressableScale';

export default function OptionCard({
  label,
  selected,
  onPress,
  mode = 'single',
  compact = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  mode?: 'single' | 'multi';
  compact?: boolean;
}) {
  const mark = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    mark.value = selected ? withSpring(1, springs.standard) : 0;
  }, [selected, mark]);
  const markStyle = useAnimatedStyle(() => ({
    opacity: mark.value > 0 ? 1 : 0,
    transform: [{ scale: 0.6 + 0.4 * mark.value }],
  }));

  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      scaleTo={0.98}
      accessibilityRole={mode === 'single' ? 'radio' : 'checkbox'}
      accessibilityState={{ checked: selected }}
      style={[styles.card, compact && styles.compact, selected && styles.selected]}
    >
      <View
        style={[
          styles.indicator,
          mode === 'single' ? styles.radio : styles.checkbox,
          selected && (mode === 'single' ? styles.radioOn : styles.checkboxOn),
        ]}
      >
        <Animated.View style={markStyle}>
          {mode === 'single' ? (
            <View style={styles.dot} />
          ) : (
            <Icon name="check" size={16} strokeWidth={3} color={colors.onPrimary} />
          )}
        </Animated.View>
      </View>
      <AppText variant={compact ? 'optionCompact' : 'option'} style={styles.label}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 18,
    borderRadius: radii.option,
    backgroundColor: colors.surface1,
    borderWidth: 1.5,
    borderColor: 'transparent', // constant width so selecting never shifts layout
  },
  compact: {
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
  },
  selected: {
    backgroundColor: colors.selectedFill,
    borderColor: colors.primary,
  },
  indicator: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.radioOff,
  },
  radio: {
    borderRadius: 11,
  },
  radioOn: {
    borderColor: colors.primary,
  },
  checkbox: {
    borderRadius: 8,
  },
  checkboxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  label: {
    flex: 1,
  },
});
