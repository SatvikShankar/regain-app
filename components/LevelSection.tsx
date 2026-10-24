// One level on the Program screen: a tappable header (status badge, level,
// name, exercise count, rotating chevron) that expands to reveal exercise NAMES
// only; each name → Exercise Detail. Locked levels still expand as a preview.
// Expand/collapse animates (layout transition) so siblings glide, not jump.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Tone, colors, durations, radii, spacing, springs } from '../theme';
import { Exercise } from '../types/exercise';
import { LevelStatus } from '../utils/programHelpers';
import AppText from './primitives/AppText';
import Icon, { IconName } from './primitives/Icon';
import IconBadge from './primitives/IconBadge';
import PressableScale from './primitives/PressableScale';

const STATUS: Record<LevelStatus, { icon: IconName; tone: Tone; note?: string }> = {
  skipped: { icon: 'done', tone: 'sage', note: 'Earlier level — its exercises remain available.' },
  unlocked: { icon: 'play', tone: 'accent' },
  locked: { icon: 'locked', tone: 'neutral', note: 'Preview — unlocks as you progress.' },
};

export const levelLayoutTransition = LinearTransition.springify()
  .damping(springs.gentle.damping)
  .stiffness(springs.gentle.stiffness);

export default function LevelSection({
  level,
  name,
  exercises,
  status,
  isCurrent = false,
  expanded,
  onToggle,
  onSelectExercise,
}: {
  level: number;
  name: string;
  exercises: Exercise[];
  status: LevelStatus;
  isCurrent?: boolean;
  expanded: boolean;
  onToggle: () => void;
  onSelectExercise: (exerciseId: string) => void;
}) {
  const s = STATUS[status];
  const locked = status === 'locked';

  const rotation = useSharedValue(expanded ? 1 : 0);
  useEffect(() => {
    rotation.value = withSpring(expanded ? 1 : 0, springs.gentle);
  }, [expanded, rotation]);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <Animated.View
      layout={levelLayoutTransition}
      style={[styles.card, isCurrent && styles.cardCurrent]}
    >
      <PressableScale
        onPress={onToggle}
        haptic="selection"
        scaleTo={0.985}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`Level ${level}, ${name}`}
        style={styles.header}
      >
        <IconBadge name={s.icon} tone={s.tone} size={40} />
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <AppText variant="subheading" color={locked ? 'textSecondary' : 'textPrimary'}>
              Level {level}
            </AppText>
            {isCurrent ? (
              <View style={styles.currentPill}>
                <AppText variant="eyebrow" color="accent">
                  Current
                </AppText>
              </View>
            ) : null}
          </View>
          <AppText variant="small" color="textSecondary" numberOfLines={2}>
            {name} · {exercises.length} exercise{exercises.length === 1 ? '' : 's'}
          </AppText>
        </View>
        <Animated.View style={chevronStyle}>
          <Icon name="expand" color={colors.textTertiary} size={20} />
        </Animated.View>
      </PressableScale>

      {expanded ? (
        <Animated.View
          entering={FadeIn.duration(durations.normal)}
          exiting={FadeOut.duration(durations.fast)}
          style={styles.body}
        >
          {s.note ? (
            <AppText variant="caption" color="textTertiary" style={styles.note}>
              {s.note}
            </AppText>
          ) : null}

          {exercises.length === 0 ? (
            <AppText variant="caption" color="textTertiary">
              No exercises selected for this level.
            </AppText>
          ) : (
            exercises.map((ex) => (
              <PressableScale
                key={ex.id}
                onPress={() => onSelectExercise(ex.id)}
                haptic="tap"
                scaleTo={0.98}
                accessibilityRole="button"
                style={styles.exerciseRow}
              >
                <AppText
                  variant="bodyStrong"
                  color={locked ? 'textSecondary' : 'textPrimary'}
                  style={styles.exerciseName}
                >
                  {ex.name}
                </AppText>
                <Icon name="forward" size={18} color={colors.textTertiary} />
              </PressableScale>
            ))
          )}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardCurrent: {
    borderColor: colors.accentBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  currentPill: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  note: {
    marginBottom: spacing.xxs,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  exerciseName: {
    flex: 1,
    paddingRight: spacing.sm,
  },
});
