// Home — the landing dashboard. Reads programs from storage on focus.
//   - No programs: warm greeting + a single call to action.
//   - Has programs: quick-continue cards + a light, derived progress line.
// The richer motivational snapshot is Step 6; this is the functional version.

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../components/PrimaryButton';
import ProgramCard from '../components/ProgramCard';
import { bottomNavClearance, colors } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';
import { StoredProgram } from '../types/program';
import { getAllPrograms } from '../utils/storage';

// Sessions logged across all programs in the last 7 days — derived at render.
function sessionsThisWeek(programs: StoredProgram[]): number {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let count = 0;
  for (const program of programs) {
    for (const entry of program.sessionLog) {
      const t = new Date(entry.date).getTime();
      if (!Number.isNaN(t) && t >= weekAgo) count += 1;
    }
  }
  return count;
}

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [programs, setPrograms] = useState<StoredProgram[]>([]);

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

  const hasPrograms = programs.length > 0;
  const weekCount = sessionsThisWeek(programs);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Welcome to Regain</Text>

        {hasPrograms ? (
          <>
            <Text style={styles.subtitle}>
              {weekCount > 0
                ? `${weekCount} session${weekCount === 1 ? '' : 's'} logged this week — nice work.`
                : 'Pick up where you left off.'}
            </Text>

            <View style={styles.list}>
              {programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onPress={() => navigation.navigate('Program', { programId: program.id })}
                />
              ))}
            </View>

            <View style={styles.newIssue}>
              <PrimaryButton
                label="Start another program"
                variant="subtle"
                onPress={() => navigation.navigate('RegionSelect')}
              />
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.subtitle}>
              Regain builds you a staged exercise plan for back or neck pain — an
              exercise companion that adapts to where you're starting from.
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
    paddingTop: 24,
    paddingBottom: bottomNavClearance,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  list: {
    marginTop: 24,
    gap: 14,
  },
  newIssue: {
    marginTop: 24,
  },
  empty: {
    marginTop: 12,
    gap: 24,
  },
});
