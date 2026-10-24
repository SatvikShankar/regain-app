// The base for every tappable surface: springs down slightly on press and back
// on release, on the UI thread (Reanimated), so taps feel physical and instant
// even if JS is busy. Optional haptic on press. Everything tappable should be
// built on this so press feel stays consistent app-wide.

import { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { pressScale, springs } from '../../theme';
import { selectionHaptic, tapHaptic } from '../../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  scaleTo?: number;
  haptic?: 'tap' | 'selection' | false;
};

export default function PressableScale({
  style,
  children,
  scaleTo = pressScale,
  haptic = false,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, springs.press);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, springs.press);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic === 'tap') tapHaptic();
        if (haptic === 'selection') selectionHaptic();
        onPress?.(e);
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
