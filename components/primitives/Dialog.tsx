// Centered confirm dialog — replaces the platform's native alert so it looks the
// same on Android and iOS. Scales in (0.94 → 1, standard spring) over a solid
// scrim and fades out on close. The SAFE choice is the primary (sage) button;
// a destructive choice is secondary. Back, and tapping the scrim, = the safe
// choice (`onDismiss`).

import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, durations, radii, screenGutter, spacing, springs } from '../../theme';
import AppText from './AppText';
import Button from './Button';
import Icon, { IconName } from './Icon';

export interface DialogAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Dialog({
  visible,
  icon,
  title,
  body,
  actions,
  onDismiss,
}: {
  visible: boolean;
  icon?: IconName;
  title: string;
  body?: string;
  actions: DialogAction[];   // shown top to bottom; put the safe (primary) choice last
  onDismiss: () => void;     // back / scrim tap — must be the safe choice
}) {
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withSpring(1, springs.standard);
    } else if (mounted) {
      progress.value = withTiming(0, { duration: durations.fast });
      const t = setTimeout(() => setMounted(false), durations.fast);
      return () => clearTimeout(t);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrimStyle = useAnimatedStyle(() => ({ opacity: Math.min(progress.value, 1) }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: Math.min(progress.value, 1),
    transform: [{ scale: 0.94 + 0.06 * progress.value }],
  }));

  if (!mounted) return null;

  return (
    <Modal transparent visible statusBarTranslucent navigationBarTranslucent onRequestClose={onDismiss}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, scrimStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityLabel="Dismiss" />
      </Animated.View>
      <View style={styles.center} pointerEvents="box-none">
        <Animated.View style={[styles.card, cardStyle]} accessibilityRole="alert">
          {icon ? (
            <View style={styles.iconTile}>
              <Icon name={icon} color={colors.text2} />
            </View>
          ) : null}
          <AppText variant="heading" style={styles.title}>
            {title}
          </AppText>
          {body ? (
            <AppText variant="bodySmall" color="text2">
              {body}
            </AppText>
          ) : null}
          <View style={styles.actions}>
            {actions.map((a) => (
              <Button
                key={a.label}
                label={a.label}
                variant={a.variant ?? 'primary'}
                onRaised
                onPress={a.onPress}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: colors.scrim,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: screenGutter,
  },
  card: {
    backgroundColor: colors.surface2,
    borderRadius: 32,
    padding: spacing.xl,
    gap: spacing.sm,
    elevation: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 24 },
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surface1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Figtree_700Bold',
  },
  actions: {
    marginTop: spacing.xs - 2,
    gap: spacing.xxs,
  },
});
