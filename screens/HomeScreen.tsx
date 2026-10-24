// Home — the hub. All roads lead here. Lists the user's programs, shows a quiet
// progress reflection, and is the one place you start a new program. No header
// (it's the root); no bottom bar.
//
// Freshness comes from honestly reflecting state, not manufactured novelty: a
// time-of-day greeting + one contextual line driven by a few real states, plus
// stats that move as you log. No streaks, no guilt.

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, StyleSheet, View } from 'react-native';
import ProgramCard from '../components/ProgramCard';
import StatTile from '../components/StatTile';
import AppText from '../components/primitives/AppText';
import Button from '../components/primitives/Button';
import Card from '../components/primitives/Card';
import FadeIn from '../components/primitives/FadeIn';
import IconBadge from '../components/primitives/IconBadge';
import Screen from '../components/primitives/Screen';
import { RootStackParamList } from '../navigation/types';
import { spacing } from '../theme';
import { SessionLogEntry, StoredProgram } from '../types/program';
import { getProgramName } from '../utils/programHelpers';
import { useProgramStore } from '../state/programStore';

const DAY_MS = 24 * 60 * 60 * 1000;

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

function allEntries(programs: StoredProgram[]): SessionLogEntry[] {
  return programs.flatMap((p) => p.sessionLog);
}

function sessionsWithin(entries: SessionLogEntry[], ms: number): number {
  const cutoff = Date.now() - ms;
  return entries.filter((e) => {
    const t = new Date(e.date).getTime();
    return !Number.isNaN(t) && t >= cutoff;
  }).length;
}

// One honest, state-driven line — no rotation engine, no guilt.
function contextualLine(programs: StoredProgram[]): string {
  const entries = allEntries(programs);
  if (entries.length === 0) return 'Ready for your first session?';

  const times = entries
    .map((e) => new Date(e.date).getTime())
    .filter((t) => !Number.isNaN(t));
  const last = Math.max(...times);

  if (new Date(last).toDateString() === new Date().toDateString()) {
    return "Logged today — nice. That's how progress adds up.";
  }
  const daysSince = Math.floor((Date.now() - last) / DAY_MS);
  if (daysSince >= 7) {
    return "Been a little while — your program's right here whenever you're ready.";
  }
  return 'Pick up where you left off.';
}

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // Programs come from the shared store (loaded once at app start), so Home
  // reflects check-ins and deletes instantly without re-reading storage.
  const loaded = useProgramStore((st) => st.loaded);
  const programs = useProgramStore((st) => st.programs);
  const removeProgram = useProgramStore((st) => st.remove);

  const confirmDelete = (program: StoredProgram) => {
    Alert.alert(
      'Delete program?',
      `"${getProgramName(program)}" will be permanently removed. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeProgram(program);
          },
        },
      ]
    );
  };

  const startNew = () => navigation.navigate('RegionSelect');

  // Render nothing until storage has answered, so the empty state never flashes
  // before real programs appear.
  if (!loaded) return <Screen scroll={false}>{null}</Screen>;

  const entries = allEntries(programs);
  const thisWeek = sessionsWithin(entries, 7 * DAY_MS);

  return (
    <Screen contentStyle={styles.content}>
      <FadeIn index={0}>
        <AppText variant="eyebrow" color="textTertiary">
          {todayLabel()}
        </AppText>
        <AppText variant="display" style={styles.greeting}>
          {greeting()}
        </AppText>
      </FadeIn>

      {programs.length > 0 ? (
        <>
          <FadeIn index={1}>
            <AppText color="textSecondary" style={styles.line}>
              {contextualLine(programs)}
            </AppText>
          </FadeIn>

          <FadeIn index={2} style={styles.stats}>
            <StatTile value={thisWeek} label="Sessions this week" icon="calendar" tone="accent" />
            <StatTile value={entries.length} label="Sessions in total" icon="trend" tone="lavender" />
          </FadeIn>

          <FadeIn index={3}>
            <AppText variant="eyebrow" color="textTertiary" style={styles.sectionLabel}>
              Your programs
            </AppText>
          </FadeIn>
          <View style={styles.list}>
            {programs.map((program, i) => (
              <FadeIn key={program.id} index={4 + i}>
                <ProgramCard
                  program={program}
                  onPress={() => navigation.navigate('Program', { programId: program.id })}
                  onLongPress={() => confirmDelete(program)}
                />
              </FadeIn>
            ))}
          </View>

          <FadeIn index={4 + programs.length} style={styles.newProgram}>
            <Button label="New program" icon="add" variant="secondary" onPress={startNew} />
            <AppText variant="caption" color="textTertiary" align="center">
              Tip: long-press a program to delete it.
            </AppText>
          </FadeIn>
        </>
      ) : (
        <FadeIn index={1}>
          <Card style={styles.emptyCard}>
            <IconBadge name="growth" tone="sage" size={56} />
            <AppText variant="heading">Let's get you moving again</AppText>
            <AppText color="textSecondary">
              Regain builds you a staged exercise plan for back or neck pain — an
              exercise companion that meets you where you're starting from.
            </AppText>
            <View style={styles.emptyAction}>
              <Button label="Tell us what's bothering you" onPress={startNew} />
            </View>
          </Card>
        </FadeIn>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xxl,
  },
  greeting: {
    marginTop: spacing.xxs,
  },
  line: {
    marginTop: spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  sectionLabel: {
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  newProgram: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  emptyCard: {
    marginTop: spacing.xl,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  emptyAction: {
    marginTop: spacing.sm,
  },
});
