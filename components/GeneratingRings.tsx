// The "working on it" visual: four soft concentric circles breathing in and out
// (scale 0.94 → 1.04 over 4s), each offset by 0.6s so the motion ripples
// outward. Runs on the UI thread, so it stays smooth while the AI calls run.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, tint } from '../theme';

const BREATH_MS = 2000; // half of the 4s cycle
const OFFSET_MS = 600;

const RINGS = [
  { size: 240, color: tint(colors.decoLavender, 0.08) },
  { size: 172, color: tint(colors.decoLavender, 0.12) },
  { size: 108, color: tint(colors.primary, 0.22) },
  { size: 52, color: colors.primary },
];

function Ring({ size, color, index }: { size: number; color: string; index: number }) {
  const breath = useSharedValue(0);
  useEffect(() => {
    breath.value = withDelay(
      index * OFFSET_MS,
      withRepeat(withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, [breath, index]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 0.94 + 0.1 * breath.value }] }));
  return (
    <Animated.View
      style={[styles.ring, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  );
}

export default function GeneratingRings() {
  return (
    <View style={styles.box} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {RINGS.map((r, i) => (
        <Ring key={r.size} size={r.size} color={r.color} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
});
