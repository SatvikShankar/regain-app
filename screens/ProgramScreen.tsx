// Program — the working hub for one program. ONE screen, two entry modes:
//   - preview (route.params.previewProgram): a freshly generated, unsaved
//     program → Save / Redo pinned at the bottom. Nothing is persisted until Save.
//   - saved (route.params.programId): loaded from storage on focus → "Log
//     today's session" pinned at the bottom.
//
// Shows: name, a current-level summary widget (name + goal), light derived
// stats, and the levels as collapsible sections (tap to reveal exercise names;
// tap a name → Exercise Detail). See SCREENS.md.

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LevelSection, { levelLayoutTransition } from '../components/LevelSection';
import ScreenHeader from '../components/ScreenHeader';
import StatTile from '../components/StatTile';
import AppText from '../components/primitives/AppText';
import Button from '../components/primitives/Button';
import Card from '../components/primitives/Card';
import FadeIn from '../components/primitives/FadeIn';
import Icon from '../components/primitives/Icon';
import Screen from '../components/primitives/Screen';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';
import {
  getLevelGoal,
  getLevelName,
  getLevelNumbers,
  getLevelStatus,
  getProgramName,
  getSelectedExercises,
  getWorkingLevel,
} from '../utils/programHelpers';
import { useProgram, useProgramStore } from '../state/programStore';

export default function ProgramScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Program'>>();
  const previewProgram = route.params?.previewProgram;
  const programId = route.params?.programId;
  const isPreview = !!previewProgram;

  // Saved programs come from the shared store, so check-ins and level changes
  // show here instantly. A preview (just generated, unsaved) arrives as a param.
  const savedProgram = useProgram(programId);
  const saveToStore = useProgramStore((st) => st.save);
  const program = previewProgram ?? savedProgram ?? null;

  // The working level starts expanded; the user's choice is kept after that.
  const [expandedLevel, setExpandedLevel] = useState<number | null>(
    program ? getWorkingLevel(program) : null
  );

  const goHome = () => navigation.navigate('Home');

  const onSave = async () => {
    if (!program) return;
    await saveToStore(program);
    // Land back on Home (the hub) with the new program showing; drop the intake
    // flow from the back stack.
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const onRedo = () => {
    // Discard the unsaved result and start over from region selection.
    navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'RegionSelect' }] });
  };

  if (!program) {
    return (
      <Screen header={<ScreenHeader onHome={goHome} />}>
        <AppText variant="title">Program not found</AppText>
        <AppText color="textSecondary" style={styles.subtitle}>
          This program may have been deleted.
        </AppText>
      </Screen>
    );
  }

  const startLevel = program.assignedStartLevel;
  const currentLevel = getWorkingLevel(program);
  const levels = getLevelNumbers(program);
  const goal = getLevelGoal(program, currentLevel);
  const sessionsAtLevel = program.sessionLog.filter((e) => e.level === currentLevel).length;

  const footer = isPreview ? (
    <>
      <Button label="Save program" onPress={onSave} />
      <Button label="Redo intake" variant="ghost" onPress={onRedo} />
    </>
  ) : (
    <Button
      label="Log today's session"
      icon="check"
      onPress={() => navigation.navigate('CheckIn', { programId: program.id })}
    />
  );

  return (
    <Screen header={!isPreview ? <ScreenHeader onHome={goHome} /> : undefined} footer={footer}>
      <FadeIn index={0} style={isPreview && styles.previewTop}>
        <AppText variant="eyebrow" color={isPreview ? 'accent' : 'textTertiary'}>
          {isPreview ? 'Your new program' : 'Program'}
        </AppText>
        <AppText variant="title" style={styles.title}>
          {getProgramName(program)}
        </AppText>
      </FadeIn>

      <FadeIn index={1}>
        <Card variant="accent" style={styles.levelCard}>
          <AppText variant="eyebrow" color="accent">
            {isPreview ? 'Starting at' : 'Now working on'} · Level {currentLevel}
          </AppText>
          <AppText variant="heading">{getLevelName(program, currentLevel)}</AppText>
          {goal ? (
            <AppText variant="small" color="textSecondary">
              {goal}
            </AppText>
          ) : null}
        </Card>
      </FadeIn>

      {!isPreview ? (
        <FadeIn index={2} style={styles.stats}>
          <StatTile value={sessionsAtLevel} label="At this level" icon="target" tone="accent" />
          <StatTile
            value={program.sessionLog.length}
            label="Sessions logged"
            icon="trend"
            tone="lavender"
          />
        </FadeIn>
      ) : null}

      {startLevel > 1 ? (
        <FadeIn index={3}>
          <View style={styles.disclaimer}>
            <Icon name="info" size={18} color={colors.textTertiary} />
            <AppText variant="caption" color="textSecondary" style={styles.disclaimerText}>
              You're starting at level {startLevel}. Earlier levels are marked as
              skipped, but their exercises stay available anytime.
            </AppText>
          </View>
        </FadeIn>
      ) : null}

      <FadeIn index={4}>
        <AppText variant="eyebrow" color="textTertiary" style={styles.sectionLabel}>
          Levels
        </AppText>
      </FadeIn>
      <View style={styles.levels}>
        {levels.map((level, i) => (
          <FadeIn key={level} index={5 + i} layout={levelLayoutTransition}>
            <LevelSection
              level={level}
              name={getLevelName(program, level)}
              exercises={getSelectedExercises(program, level)}
              status={getLevelStatus(program, level)}
              isCurrent={level === currentLevel}
              expanded={expandedLevel === level}
              onToggle={() => setExpandedLevel(expandedLevel === level ? null : level)}
              onSelectExercise={(exerciseId) =>
                navigation.navigate('ExerciseDetail', { exerciseId, region: program.region })
              }
            />
          </FadeIn>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  previewTop: {
    paddingTop: spacing.xl,
  },
  title: {
    marginTop: spacing.xxs,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  levelCard: {
    marginTop: spacing.lg,
    gap: spacing.xxs,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  disclaimer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  disclaimerText: {
    flex: 1,
  },
  sectionLabel: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  levels: {
    gap: spacing.sm,
  },
});
