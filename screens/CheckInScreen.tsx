// Check-in — log one session, then let gating decide what happens next.
//
// Flow (single screen, multiple phases):
//   questions → submit → append + save + evaluate gate
//     ├─ ready:     "offer" phase → accept unlocks the level → "unlocked" moment
//     └─ not ready: "logged" phase (encouragement + optional safety nudge)
//
// The check-in only asks about the session just done — no "are you ready?"
// toggle. Readiness is inferred in utils/gating.ts.

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import { colors, screenBottomPadding } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';
import { Difficulty, PainLevel, SessionLogEntry, StoredProgram } from '../types/program';
import {
  advanceProgram,
  appendCheckIn,
  getWorkingLevel,
  isReadyToAdvance,
  shouldSuggestProfessional,
} from '../utils/gating';
import { getLevelName } from '../utils/programHelpers';
import { getProgram, saveProgram } from '../utils/storage';

type Phase = 'questions' | 'offer' | 'logged' | 'unlocked';

const PAIN_OPTIONS: { value: PainLevel; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'significant', label: 'Significant' },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'tooEasy', label: 'Too easy' },
  { value: 'aboutRight', label: 'About right' },
  { value: 'tooHard', label: 'Too hard' },
];

function ChipRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function CheckInScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CheckIn'>>();
  const programId = route.params?.programId;

  const [program, setProgram] = useState<StoredProgram | null>(null);
  const [phase, setPhase] = useState<Phase>('questions');
  const [showSafetyNudge, setShowSafetyNudge] = useState(false);

  const [painDuring, setPainDuring] = useState<PainLevel | null>(null);
  const [painAfter, setPainAfter] = useState<PainLevel | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  useEffect(() => {
    if (!programId) return;
    let active = true;
    getProgram(programId).then((p) => {
      if (active) setProgram(p);
    });
    return () => {
      active = false;
    };
  }, [programId]);

  const canSubmit = painDuring !== null && painAfter !== null && difficulty !== null;

  const onSubmit = async () => {
    if (!program || !canSubmit) return;
    const entry: SessionLogEntry = {
      date: new Date().toISOString(),
      level: getWorkingLevel(program),
      painDuring: painDuring as PainLevel,
      painAfter: painAfter as PainLevel,
      difficulty: difficulty as Difficulty,
    };
    const updated = appendCheckIn(program, entry);
    await saveProgram(updated);
    setProgram(updated);

    if (isReadyToAdvance(updated)) {
      setPhase('offer');
    } else {
      setShowSafetyNudge(shouldSuggestProfessional(updated));
      setPhase('logged');
    }
  };

  const onAcceptAdvance = async () => {
    if (!program) return;
    const advanced = advanceProgram(program);
    await saveProgram(advanced);
    setProgram(advanced);
    setPhase('unlocked');
  };

  const goToProgram = () => navigation.goBack();

  if (!program) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader onHome={() => navigation.navigate('Home')} />
        <View style={styles.centered}>
          <Text style={styles.title}>Program not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const workingLevel = getWorkingLevel(program);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {phase === 'questions' ? (
        <ScreenHeader
          onBack={() => navigation.goBack()}
          onHome={() => navigation.navigate('Home')}
        />
      ) : null}
      <ScrollView contentContainerStyle={styles.content}>
        {phase === 'questions' ? (
          <>
            <Text style={styles.title}>How did today go?</Text>
            <Text style={styles.subtitle}>
              A few quick questions about this session — Level {workingLevel},{' '}
              {getLevelName(program, workingLevel)}.
            </Text>

            <Text style={styles.question}>Pain during the session</Text>
            <ChipRow options={PAIN_OPTIONS} value={painDuring} onChange={setPainDuring} />

            <Text style={styles.question}>Pain afterwards</Text>
            <ChipRow options={PAIN_OPTIONS} value={painAfter} onChange={setPainAfter} />

            <Text style={styles.question}>How did it feel?</Text>
            <ChipRow options={DIFFICULTY_OPTIONS} value={difficulty} onChange={setDifficulty} />

            <View style={styles.actions}>
              <PrimaryButton label="Log session" onPress={onSubmit} disabled={!canSubmit} />
            </View>
          </>
        ) : null}

        {phase === 'offer' ? (
          <View style={styles.moment}>
            <Text style={styles.momentEmoji}>🎯</Text>
            <Text style={styles.momentTitle}>You're moving well</Text>
            <Text style={styles.subtitle}>
              Your recent sessions have been consistent, comfortable, and feeling
              easy. Ready to move up to Level {workingLevel + 1}?
            </Text>
            <View style={styles.actions}>
              <PrimaryButton label={`Unlock Level ${workingLevel + 1}`} onPress={onAcceptAdvance} />
              <PrimaryButton label="Stay here for now" variant="subtle" onPress={goToProgram} />
            </View>
          </View>
        ) : null}

        {phase === 'logged' ? (
          <View style={styles.moment}>
            <Text style={styles.momentEmoji}>✅</Text>
            <Text style={styles.momentTitle}>Session logged</Text>
            <Text style={styles.subtitle}>
              Nice work — keep at it. Consistency is what moves you forward.
            </Text>
            {showSafetyNudge ? (
              <View style={styles.nudge}>
                <Text style={styles.nudgeText}>
                  You've reported notable pain the last few sessions. If it keeps
                  up, it's worth checking in with a doctor or physiotherapist.
                </Text>
              </View>
            ) : null}
            <View style={styles.actions}>
              <PrimaryButton label="Back to program" onPress={goToProgram} />
            </View>
          </View>
        ) : null}

        {phase === 'unlocked' ? (
          <View style={styles.moment}>
            <Text style={styles.momentEmoji}>🎉</Text>
            <Text style={[styles.momentTitle, styles.celebrate]}>
              Level {workingLevel} unlocked!
            </Text>
            <Text style={styles.subtitle}>
              {getLevelName(program, workingLevel)} — new exercises are ready for you.
            </Text>
            <View style={styles.actions}>
              <PrimaryButton label="Let's go" onPress={goToProgram} />
            </View>
          </View>
        ) : null}
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
    paddingTop: 12,
    paddingBottom: screenBottomPadding,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  question: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 28,
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  chipSelected: {
    backgroundColor: colors.accent,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#0E1416',
  },
  actions: {
    marginTop: 32,
    gap: 12,
  },
  // Post-submit moments (offer / logged / unlocked). Full-width so buttons
  // stretch; text is centred via textAlign.
  moment: {
    paddingTop: 40,
  },
  momentEmoji: {
    fontSize: 52,
    textAlign: 'center',
    marginBottom: 16,
  },
  momentTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  celebrate: {
    color: colors.accentWarm,
  },
  nudge: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  nudgeText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  // subtitle is reused inside moments; actions width matches full content
});
