// A program tile — used on Home (quick-continue) and the Programs list.
// Tap to open; long-press to trigger a delete (handled by the parent). All
// text is derived from the stored program at render.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StoredProgram } from '../types/program';
import { getLevelName, getMaxUnlockedLevel, getProgramName } from '../utils/programHelpers';
import { colors } from './ScreenContainer';

export default function ProgramCard({
  program,
  onPress,
  onLongPress,
}: {
  program: StoredProgram;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const currentLevel = getMaxUnlockedLevel(program);
  const levelName = getLevelName(program, currentLevel);
  const sessions = program.sessionLog.length;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text style={styles.name}>{getProgramName(program)}</Text>
        <Text style={styles.level}>
          Level {currentLevel} · {levelName}
        </Text>
        <Text style={styles.meta}>
          {sessions} session{sessions === 1 ? '' : 's'} logged
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '700',
  },
  level: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  chevron: {
    color: colors.textSecondary,
    fontSize: 26,
    marginLeft: 12,
  },
});
