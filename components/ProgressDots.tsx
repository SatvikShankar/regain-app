// Intake progress indicator. Renders `total` segments; the first `current` of
// them fill with the cyan accent. Total is derived from the branch length (see
// intakeEngine.getBranchLengths) — never hardcoded.

import { StyleSheet, View } from 'react-native';
import { colors } from './ScreenContainer';

export default function ProgressDots({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const safeTotal = Math.max(total, 1);
  return (
    <View style={styles.row}>
      {Array.from({ length: safeTotal }).map((_, i) => (
        <View
          key={i}
          style={[styles.segment, i < current ? styles.filled : styles.empty]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
  },
  filled: {
    backgroundColor: colors.accent,
  },
  empty: {
    backgroundColor: colors.surface,
  },
});
