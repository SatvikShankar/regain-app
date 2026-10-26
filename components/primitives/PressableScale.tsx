// The base for every tappable surface: springs to 0.97 on press-in and back on
// release, on the UI thread (Reanimated), so taps feel physical and instant even
// if JS is busy. `pressedStyle` is applied while held (e.g. one surface step
// lighter). Optional haptic. Build everything tappable on this.

import { ReactNode, useState } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { pressScale, springs } from '../../theme';
import { selectionHaptic, tapHaptic } from '../../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
  scaleTo?: number;
  haptic?: 'tap' | 'selection' | false;
};

export default function PressableScale({
  style,
  pressedStyle,
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
  const [pressed, setPressed] = useState(false);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, springs.press);
        if (pressedStyle) setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, springs.press);
        if (pressedStyle) setPressed(false);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic === 'tap') tapHaptic();
        if (haptic === 'selection') selectionHaptic();
        onPress?.(e);
      }}
      style={[style, pressed && pressedStyle, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
