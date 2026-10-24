// Selectable option card for intake questions. Works for both single-select
// (radio) and multi-select (checkbox) — the parent owns selection logic; this
// renders a label and a selected state. Selected = cyan (same meaning everywhere).

import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { colors, radii, spacing } from '../theme';
import AppText from './primitives/AppText';
import Icon from './primitives/Icon';
import PressableScale from './primitives/PressableScale';

export default function OptionCard({
  label,
  selected,
  onPress,
  mode = 'single',
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  mode?: 'single' | 'multi';
}) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      accessibilityRole={mode === 'single' ? 'radio' : 'checkbox'}
      accessibilityState={{ checked: selected }}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View
        style={[
          styles.indicator,
          mode === 'single' ? styles.radio : styles.checkbox,
          selected && styles.indicatorSelected,
        ]}
      >
        {selected ? (
          <Animated.View entering={ZoomIn.springify().damping(14)}>
            <Icon name="check" size={15} strokeWidth={3} color={colors.onAccent} />
          </Animated.View>
        ) : null}
      </View>
      <AppText variant={selected ? 'bodyStrong' : 'body'} style={styles.label}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  cardSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentBorder,
  },
  indicator: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.track,
  },
  radio: {
    borderRadius: 13,
  },
  checkbox: {
    borderRadius: 9,
  },
  indicatorSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  label: {
    flex: 1,
  },
});
