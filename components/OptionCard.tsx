// Selectable option card for intake questions. Works for both single-select
// (radio behavior) and multi-select (checkbox behavior) — the parent owns the
// selection logic; this just renders a label and a selected/unselected state.
// Selected uses the cyan accent (same meaning everywhere per SCREENS.md).

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './ScreenContainer';

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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.indicator,
          mode === 'single' ? styles.radio : styles.checkbox,
          selected && styles.indicatorSelected,
        ]}
      >
        {selected ? <Text style={styles.check}>{mode === 'single' ? '●' : '✓'}</Text> : null}
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  cardSelected: {
    backgroundColor: '#2E3B40', // cyan-tinted elevated surface
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  pressed: {
    opacity: 0.85,
  },
  indicator: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.textSecondary,
  },
  radio: {
    borderRadius: 12,
  },
  checkbox: {
    borderRadius: 8,
  },
  indicatorSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  check: {
    color: '#0E1416',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
  },
  label: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 21,
  },
  labelSelected: {
    fontWeight: '600',
  },
});
