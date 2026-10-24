// Calm "working on it" visual: soft concentric rings that slowly breathe in and
// out around an icon. Runs entirely on the UI thread (Reanimated), so it stays
// smooth while network calls resolve. Used by the Loading screen.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme';
import Icon, { IconName } from './primitives/Icon';

const BREATH_MS = 2200;

export default function BreathingOrb({ icon = 'sparkle', size = 140 }: { icon?: IconName; size?: number }) {
  const breath = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [breath]);

  const outer = useAnimatedStyle(() => ({
    opacity: 0.35 + breath.value * 0.35,
    transform: [{ scale: 0.82 + breath.value * 0.18 }],
  }));
  const inner = useAnimatedStyle(() => ({
    transform: [{ scale: 0.94 + breath.value * 0.06 }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }, outer]}
      />
      <Animated.View
        style={[
          styles.core,
          { width: size * 0.56, height: size * 0.56, borderRadius: size * 0.28 },
          inner,
        ]}
      >
        <Icon name={icon} size={size * 0.2} color={colors.accent} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    backgroundColor: colors.accentSoft,
  },
  core: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
