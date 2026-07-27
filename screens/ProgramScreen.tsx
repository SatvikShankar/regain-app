// Program — the working hub for one program. ONE screen, two entry modes:
//   - preview (route.params.previewProgram): a freshly generated, unsaved
//     program → shows a Save / Redo bar. Nothing is persisted until Save.
//   - saved (route.params.programId): loaded from storage on focus → shows the
//     "Log today's session" action.
//
// Shows: name, starting level, current unlocked level, and the levels as
// collapsible sections (exercise count in brackets; tap to reveal exercise
// names; tap a name → Exercise Detail). See SCREENS.md.

import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LevelSection from '../components/LevelSection';
import PrimaryButton from '../components/PrimaryButton';
import { bottomNavClearance, colors } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';
import { StoredProgram } from '../types/program';
import {
  getLevelName,
  getLevelNumbers,
  getLevelStatus,
  getMaxUnlockedLevel,
  getProgramName,
  getSelectedExercises,
} from '../utils/programHelpers';
import { getProgram, saveProgram } from '../utils/storage';

export default function ProgramScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Program'>>();
  const previewProgram = route.params?.previewProgram;
  const programId = route.params?.programId;
  const isPreview = !!previewProgram;

  const [program, setProgram] = useState<StoredProgram | null>(previewProgram ?? null);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(
    previewProgram ? getMaxUnlockedLevel(previewProgram) : null
  );

  // Saved mode: (re)load from storage whenever the screen gains focus, so edits
  // elsewhere (future check-ins) reflect here.
  useFocusEffect(
    useCallback(() => {
      if (isPreview || !programId) return;
      let active = true;
      getProgram(programId).then((p) => {
        if (!active) return;
        setProgram(p);
        setExpandedLevel(p ? getMaxUnlockedLevel(p) : null);
      });
      return () => {
        active = false;
      };
    }, [isPreview, programId])
  );

  const onSave = async () => {
    if (!program) return;
    await saveProgram(program);
    // Land on the Programs list with the new program visible; drop the intake
    // flow from the back stack.
    navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'Programs' }] });
  };

  const onRedo = () => {
    // Discard the unsaved result and start over from region selection.
    navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'RegionSelect' }] });
  };

  if (!program) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>Program not found</Text>
          <Text style={styles.subtitle}>This program may have been deleted.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const startLevel = program.assignedStartLevel;
  const currentLevel = getMaxUnlockedLevel(program);
  const levels = getLevelNumbers(program);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {isPreview ? <Text style={styles.eyebrow}>Your new program</Text> : null}
        <Text style={styles.title}>{getProgramName(program)}</Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Starting level</Text>
            <Text style={styles.statValue}>
              {startLevel} · {getLevelName(program, startLevel)}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Current level</Text>
            <Text style={styles.statValue}>
              {currentLevel} · {getLevelName(program, currentLevel)}
            </Text>
          </View>
        </View>

        {startLevel > 1 ? (
          <Text style={styles.disclaimer}>
            You're starting at level {startLevel}. Earlier levels are marked as
            skipped, but their exercises stay available anytime.
          </Text>
        ) : null}

        <View style={styles.levels}>
          {levels.map((level) => (
            <LevelSection
              key={level}
              level={level}
              name={getLevelName(program, level)}
              exercises={getSelectedExercises(program, level)}
              status={getLevelStatus(program, level)}
              expanded={expandedLevel === level}
              onToggle={() => setExpandedLevel(expandedLevel === level ? null : level)}
              onSelectExercise={(exerciseId) =>
                navigation.navigate('ExerciseDetail', { exerciseId, region: program.region })
              }
            />
          ))}
        </View>

        <View style={styles.actions}>
          {isPreview ? (
            <>
              <PrimaryButton label="Save program" onPress={onSave} />
              <PrimaryButton label="Redo intake" variant="subtle" onPress={onRedo} />
            </>
          ) : (
            <PrimaryButton
              label="Log today's session"
              onPress={() => navigation.navigate('CheckIn', { programId: program.id })}
            />
          )}
        </View>
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
    paddingTop: 20,
    paddingBottom: bottomNavClearance,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  disclaimer: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 16,
  },
  levels: {
    marginTop: 24,
    gap: 12,
  },
  actions: {
    marginTop: 28,
    gap: 12,
  },
});
