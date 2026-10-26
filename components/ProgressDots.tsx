// Questionnaire progress: `total` rounded segments. Answered ones are sage; the
// current one is half-strength sage; the rest are empty tracks. Fills spring in
// on the UI thread. `total` comes from estimateTotalQuestions — never hardcoded.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, springs } from '../theme';

function Segment({ fill }: { fill: 0 | 0.5 | 1 }) {
  const level = useSharedValue(fill);
  useEffect(() => {
    level.value = withSpring(fill, springs.standard);
  }, [fill, level]);
  const style = useAnimatedStyle(() => ({ opacity: level.value }));
  return (
    <View style={styles.segment}>
      <Animated.View style={[styles.fill, style]} />
    </View>
  );
}

export default function ProgressDots({ current, total }: { current: number; total: number }) {
  const safeTotal = Math.max(total, current, 1);
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: safeTotal, now: current }}
    >
      {Array.from({ length: safeTotal }).map((_, i) => (
        <Segment key={i} fill={i < current - 1 ? 1 : i === current - 1 ? 0.5 : 0} />
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
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface3,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    backgroundColor: colors.primary,
  },
});
