// One level on the Program screen: a tappable header (level, name, exercise
// COUNT in brackets, status marker) that expands to reveal exercise NAMES only.
// Names are tappable → Exercise Detail. Locked levels still expand (preview),
// with a note and no way to start — details live one tap deeper by design.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Exercise } from '../types/exercise';
import { LevelStatus } from '../utils/programHelpers';
import { colors } from './ScreenContainer';

const STATUS_MARK: Record<LevelStatus, string> = {
  skipped: '✓',
  unlocked: '●',
  locked: '🔒',
};

export default function LevelSection({
  level,
  name,
  exercises,
  status,
  expanded,
  onToggle,
  onSelectExercise,
}: {
  level: number;
  name: string;
  exercises: Exercise[];
  status: LevelStatus;
  expanded: boolean;
  onToggle: () => void;
  onSelectExercise: (exerciseId: string) => void;
}) {
  const locked = status === 'locked';

  return (
    <View style={[styles.card, status === 'unlocked' && styles.cardActive]}>
      <Pressable style={styles.header} onPress={onToggle}>
        <Text style={[styles.mark, locked && styles.markLocked, status === 'unlocked' && styles.markActive]}>
          {STATUS_MARK[status]}
        </Text>
        <View style={styles.headerText}>
          <Text style={styles.levelLabel}>Level {level}</Text>
          <Text style={styles.levelName}>{name}</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▴' : '▾'}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          {status === 'skipped' ? (
            <Text style={styles.note}>Earlier level — its exercises remain available.</Text>
          ) : null}
          {locked ? <Text style={styles.note}>Preview — unlock by progressing.</Text> : null}

          {exercises.length === 0 ? (
            <Text style={styles.note}>No exercises selected for this level.</Text>
          ) : (
            exercises.map((ex) => (
              <Pressable
                key={ex.id}
                style={({ pressed }) => [styles.exerciseRow, pressed && styles.exercisePressed]}
                onPress={() => onSelectExercise(ex.id)}
              >
                <Text style={[styles.exerciseName, locked && styles.exerciseNameLocked]}>
                  {ex.name}
                </Text>
                <Text style={styles.exerciseChevron}>›</Text>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardActive: {
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  mark: {
    fontSize: 15,
    color: colors.textSecondary,
    width: 20,
    textAlign: 'center',
  },
  markActive: {
    color: colors.accent,
  },
  markLocked: {
    fontSize: 14,
  },
  headerText: {
    flex: 1,
  },
  levelLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  levelName: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 2,
  },
  note: {
    color: colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.background,
  },
  exercisePressed: {
    opacity: 0.6,
  },
  exerciseName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    paddingRight: 12,
  },
  exerciseNameLocked: {
    color: colors.textSecondary,
  },
  exerciseChevron: {
    color: colors.textSecondary,
    fontSize: 20,
  },
});
