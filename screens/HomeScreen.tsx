// Home — the hub. All roads lead here. Lists the user's programs, shows a quiet
// progress reflection, and is the one place you start a new program. No header
// (it's the root); no bottom bar.
//
// Freshness comes from honestly reflecting state, not manufactured novelty: a
// time-of-day greeting + one contextual line driven by a few real states, plus
// stats that move as you log. (Copy/visual tuning is Step 7.)

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../components/PrimaryButton';
import ProgramCard from '../components/ProgramCard';
import StatTile from '../components/StatTile';
import { colors, screenBottomPadding } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';
import { SessionLogEntry, StoredProgram } from '../types/program';
import { getProgramName } from '../utils/programHelpers';
import { deleteProgram, getAllPrograms } from '../utils/storage';

const DAY_MS = 24 * 60 * 60 * 1000;

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
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
  const [programs, setPrograms] = useState<StoredProgram[]>([]);

  const load = useCallback(async () => {
    setPrograms(await getAllPrograms());
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAllPrograms().then((list) => {
        if (active) setPrograms(list);
      });
      return () => {
        active = false;
      };
    }, [])
  );

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
            await deleteProgram(program.id);
            await load();
          },
        },
      ]
    );
  };

  const hasPrograms = programs.length > 0;
  const entries = allEntries(programs);
  const thisWeek = sessionsWithin(entries, 7 * DAY_MS);
  const total = entries.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>{greeting()}</Text>

        {hasPrograms ? (
          <>
            <Text style={styles.line}>{contextualLine(programs)}</Text>

            <View style={styles.stats}>
              <StatTile value={thisWeek} label="This week" />
              <StatTile value={total} label="Total sessions" />
            </View>

            <Text style={styles.sectionLabel}>Your programs</Text>
            <View style={styles.list}>
              {programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onPress={() => navigation.navigate('Program', { programId: program.id })}
                  onLongPress={() => confirmDelete(program)}
                />
              ))}
            </View>
            <Text style={styles.hint}>Long-press a program to delete it.</Text>

            <View style={styles.newIssue}>
              <PrimaryButton
                label="New program"
                variant="subtle"
                onPress={() => navigation.navigate('RegionSelect')}
              />
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.line}>
              Regain builds you a staged exercise plan for back or neck pain — an
              exercise companion that meets you where you're starting from.
            </Text>
            <PrimaryButton
              label="Tell us what's bothering you"
              onPress={() => navigation.navigate('RegionSelect')}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: screenBottomPadding,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '700',
  },
  line: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 10,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 32,
    marginBottom: 14,
  },
  list: {
    gap: 14,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 12,
  },
  newIssue: {
    marginTop: 28,
  },
  empty: {
    marginTop: 4,
    gap: 24,
  },
});
