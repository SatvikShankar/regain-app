// A full-screen "moment" after an action (session logged, level offer, level
// unlocked): an icon that springs in, a title, a line of body copy, optional
// extra content, then actions. Tone carries meaning (warm = celebration).

import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { ColorToken, Tone, spacing, springs } from '../theme';
import AppText from './primitives/AppText';
import FadeIn from './primitives/FadeIn';
import { IconName } from './primitives/Icon';
import IconBadge from './primitives/IconBadge';

export default function Moment({
  icon,
  tone,
  title,
  titleColor = 'textPrimary',
  body,
  children,
}: {
  icon: IconName;
  tone: Tone;
  title: string;
  titleColor?: ColorToken;
  body: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.root}>
      <Animated.View
        entering={ZoomIn.springify()
          .damping(springs.bouncy.damping)
          .stiffness(springs.bouncy.stiffness)}
      >
        <IconBadge name={icon} tone={tone} size={88} />
      </Animated.View>
      <FadeIn index={2} style={styles.text}>
        <AppText variant="title" color={titleColor} align="center">
          {title}
        </AppText>
        <AppText color="textSecondary" align="center">
          {body}
        </AppText>
      </FadeIn>
      {children ? (
        <FadeIn index={4} style={styles.extra}>
          {children}
        </FadeIn>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
  },
  text: {
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  extra: {
    marginTop: spacing.xl,
    alignSelf: 'stretch',
  },
});
