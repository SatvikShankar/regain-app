// Entrance animation wrapper: content rises in softly. Pass `index` to stagger a
// list. Centralised so every screen's entrance shares one feel (tune in
// theme/motion). Reanimated respects the OS "reduce motion" setting by default.

import React, { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { durations, staggerStep } from '../../theme';

export default function FadeIn({
  children,
  index = 0,
  style,
  layout,
}: {
  children: ReactNode;
  index?: number;
  style?: StyleProp<ViewStyle>;
  layout?: React.ComponentProps<typeof Animated.View>['layout']; // pass when siblings resize, so this glides too
}) {
  return (
    <Animated.View
      style={style}
      layout={layout}
      entering={FadeInDown.duration(durations.slow)
        .delay(index * staggerStep)
        .withInitialValues({ transform: [{ translateY: 14 }] })}
    >
      {children}
    </Animated.View>
  );
}
