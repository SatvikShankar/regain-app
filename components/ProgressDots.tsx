// Intake progress: `total` rounded segments, the first `current` filled cyan.
// Fills spring in/out on the UI thread (scaleX from the left edge). Total is
// derived from the branch length (intakeEngine.getBranchLengths) — never hardcoded.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, spacing, springs } from '../theme';

function Segment({ filled }: { filled: boolean }) {
  const progress = useSharedValue(filled ? 1 : 0);
  useEffect(() => {
    progress.value = withSpring(filled ? 1 : 0, springs.gentle);
  }, [filled, progress]);
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));
  return (
    <View style={styles.segment}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

export default function ProgressDots({ current, total }: { current: number; total: number }) {
  const safeTotal = Math.max(total, 1);
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: safeTotal, now: current }}
    >
      {Array.from({ length: safeTotal }).map((_, i) => (
        <Segment key={i} filled={i < current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs - 2,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    borderRadius: 3,
    backgroundColor: colors.accent,
    transformOrigin: 'left',
  },
});
