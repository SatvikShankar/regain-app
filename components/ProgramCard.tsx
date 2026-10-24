// A program widget on Home: region badge, name, current level, a level-progress
// track, and session count. Tap to open; long-press to delete (parent handles).
// Everything shown is derived from the stored program at render.

import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import { StoredProgram } from '../types/program';
import {
  getLevelName,
  getLevelNumbers,
  getProgramName,
  getWorkingLevel,
} from '../utils/programHelpers';
import { getRegion } from '../utils/regionContent';
import AppText from './primitives/AppText';
import Card from './primitives/Card';
import Icon from './primitives/Icon';
import IconBadge from './primitives/IconBadge';

export default function ProgramCard({
  program,
  onPress,
  onLongPress,
}: {
  program: StoredProgram;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const currentLevel = getWorkingLevel(program);
  const totalLevels = getLevelNumbers(program).length;
  const sessions = program.sessionLog.length;
  const name = getProgramName(program);

  return (
    <Card onPress={onPress} onLongPress={onLongPress} accessibilityLabel={`Open ${name}`}>
      <View style={styles.top}>
        <IconBadge name={getRegion(program.region)?.icon ?? 'activity'} tone="accent" />
        <View style={styles.titleBlock}>
          <AppText variant="subheading" numberOfLines={1}>
            {name}
          </AppText>
          <AppText variant="smallStrong" color="accent" numberOfLines={1}>
            Level {currentLevel} · {getLevelName(program, currentLevel)}
          </AppText>
        </View>
        <Icon name="forward" color={colors.textTertiary} />
      </View>

      {totalLevels > 0 ? (
        <View style={styles.track}>
          {Array.from({ length: totalLevels }).map((_, i) => (
            <View key={i} style={[styles.step, i < currentLevel && styles.stepReached]} />
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        <AppText variant="caption" color="textSecondary">
          Level {currentLevel} of {totalLevels}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          {sessions} session{sessions === 1 ? '' : 's'} logged
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  track: {
    flexDirection: 'row',
    gap: spacing.xxs + 2,
    marginTop: spacing.lg,
  },
  step: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceRaised,
  },
  stepReached: {
    backgroundColor: colors.accent,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
});
