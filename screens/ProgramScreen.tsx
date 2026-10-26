// Program — the working hub for one program (read from the shared store, so
// check-ins and level changes show instantly). Programs are saved the moment
// they're generated; on that first visit (`justCreated`) a banner confirms it
// and offers "Redo the questions" (confirm → delete → Region Select).
// Back → Home. (Full visual redesign lands in Block 4.)
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
import Dialog from '../components/primitives/Dialog';
import FadeIn from '../components/primitives/FadeIn';
import Icon from '../components/primitives/Icon';
import Screen from '../components/primitives/Screen';
import { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../theme';
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
  const { programId, justCreated } = route.params;
  const program = useProgram(programId) ?? null;
  const removeProgram = useProgramStore((st) => st.remove);
  const [redoOpen, setRedoOpen] = useState(false);

  // The working level starts expanded; the user's choice is kept after that.
  const [expandedLevel, setExpandedLevel] = useState<number | null>(
    program ? getWorkingLevel(program) : null
  );

  const goHome = () => navigation.popToTop();

  // Delete this just-made program and start the questions again.
  const onRedo = async () => {
    setRedoOpen(false);
    if (program) await removeProgram(program);
    navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'RegionSelect' }] });
  };

  if (!program) {
    return (
      <Screen header={<ScreenHeader onBack={goHome} backLabel="Back to Home" />}>
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

  const footer = (
    <Button
      label="Log today's session"
      icon="add"
      onPress={() => navigation.navigate('CheckIn', { programId: program.id })}
    />
  );

  return (
    <Screen header={<ScreenHeader onBack={goHome} backLabel="Back to Home" />} footer={footer}>
      {justCreated ? (
        <FadeIn index={0} style={styles.banner}>
          <View style={styles.bannerCheck}>
            <Icon name="check" size={18} strokeWidth={2.6} color={colors.onPrimary} />
          </View>
          <View style={styles.bannerText}>
            <AppText variant="label">Saved to your programs</AppText>
            <AppText
              variant="captionStrong"
              color="text2"
              style={styles.redoLink}
              onPress={() => setRedoOpen(true)}
              accessibilityRole="button"
            >
              Not quite right? Redo the questions
            </AppText>
          </View>
        </FadeIn>
      ) : null}
      <FadeIn index={0}>
        <AppText variant="eyebrow" color={justCreated ? 'primary' : 'textTertiary'}>
          {justCreated ? 'Your new program' : 'Program'}
        </AppText>
        <AppText variant="title" style={styles.title}>
          {getProgramName(program)}
        </AppText>
      </FadeIn>

      <FadeIn index={1}>
        <Card variant="accent" style={styles.levelCard}>
          <AppText variant="eyebrow" color="accent">
            {justCreated ? 'Starting at' : 'Now working on'} · Level {currentLevel}
          </AppText>
          <AppText variant="heading">{getLevelName(program, currentLevel)}</AppText>
          {goal ? (
            <AppText variant="small" color="textSecondary">
              {goal}
            </AppText>
          ) : null}
        </Card>
      </FadeIn>

      {!justCreated ? (
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

      <Dialog
        visible={redoOpen}
        icon="rename"
        title="Redo the questions?"
        body="This program will be deleted and you'll start the questions again."
        onDismiss={() => setRedoOpen(false)}
        actions={[
          { label: 'Delete and redo', variant: 'secondary', onPress: onRedo },
          { label: 'Keep it', variant: 'primary', onPress: () => setRedoOpen(false) },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: 14,
    marginBottom: spacing.md,
    borderRadius: radii.option,
    backgroundColor: colors.primarySoft,
  },
  bannerCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
    gap: 2,
  },
  redoLink: {
    textDecorationLine: 'underline',
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
