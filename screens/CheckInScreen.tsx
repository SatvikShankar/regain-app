// Check-in — log one session, then let gating decide what happens next.
//
// Flow (single screen, multiple phases):
//   questions → submit → append + save → decide (utils/gating.ts, in order):
//     ├─ safetyCheck: two "significant" pain logs in a row → re-ask the warning
//     │   signs. Any sign → see-a-doctor screen (inform only; the program stays).
//     ├─ offer:     ready to move up → accept → "unlocked" moment
//     ├─ easeOff:   struggling → offer the level below → accept → "eased" moment
//     └─ logged:    encouragement + optional "consider seeing someone" nudge
//
// The check-in only asks about the session just done — no "are you ready?"
// toggle. Every level change is the user's informed choice; declines are
// recorded as events so gating can wait before asking again.

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Moment from '../components/Moment';
import OptionCard from '../components/OptionCard';
import ScreenHeader from '../components/ScreenHeader';
import AppText from '../components/primitives/AppText';
import Button from '../components/primitives/Button';
import Card from '../components/primitives/Card';
import Chip from '../components/primitives/Chip';
import FadeIn from '../components/primitives/FadeIn';
import Screen from '../components/primitives/Screen';
import { RootStackParamList } from '../navigation/types';
import { useProgram, useProgramStore } from '../state/programStore';
import { spacing } from '../theme';
import { Difficulty, PainLevel, SessionLogEntry, StoredProgram } from '../types/program';
import {
  advanceProgram,
  appendCheckIn,
  declineAdvance,
  declineEaseOff,
  easeOffProgram,
  getNextLevel,
  getPreviousLevel,
  getWorkingLevel,
  isReadyToAdvance,
  needsSafetyRecheck,
  recordSafetyCheck,
  shouldOfferEaseOff,
  shouldSuggestProfessional,
} from '../utils/gating';
import { successHaptic } from '../utils/haptics';
import { detectDetour, detourItems, isExclusiveOption } from '../utils/intakeEngine';
import { getLevelName, getUnlockedLevels } from '../utils/programHelpers';
import { getRegionContent } from '../utils/regionContent';

type Phase = 'questions' | 'safetyCheck' | 'offer' | 'easeOff' | 'logged' | 'unlocked' | 'eased';

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
    <View style={styles.chips} accessibilityRole="radiogroup">
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          selected={value === o.value}
          onPress={() => onChange(o.value)}
        />
      ))}
    </View>
  );
}

// What to show after a check-in (or after the safety re-check is answered).
function decideAfterLog(p: StoredProgram): Phase {
  if (needsSafetyRecheck(p)) return 'safetyCheck';
  if (isReadyToAdvance(p)) return 'offer';
  if (shouldOfferEaseOff(p)) return 'easeOff';
  return 'logged';
}

export default function CheckInScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CheckIn'>>();
  const { programId } = route.params;

  // Read from the shared store; every write goes back through it, so Home and
  // Program reflect this check-in the moment it's saved.
  const program = useProgram(programId) ?? null;
  const save = useProgramStore((st) => st.save);
  const [phase, setPhase] = useState<Phase>('questions');

  const [painDuring, setPainDuring] = useState<PainLevel | null>(null);
  const [painAfter, setPainAfter] = useState<PainLevel | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [safetyAnswer, setSafetyAnswer] = useState<string[]>([]);

  const goToProgram = () => navigation.goBack();

  if (!program) {
    return (
      <Screen header={<ScreenHeader onBack={() => navigation.goBack()} />}>
        <AppText variant="title">Program not found</AppText>
      </Screen>
    );
  }

  const content = getRegionContent(program.region);
  const safetyQuestion = content?.intake.questions.find(
    (q) => q.id === content.intake.safetyCheckQuestionId
  );
  const workingLevel = getWorkingLevel(program);
  const nextLevel = getNextLevel(program);
  const previousLevel = getPreviousLevel(program);
  const returningToNext = nextLevel !== null && getUnlockedLevels(program).includes(nextLevel);

  const canSubmit = painDuring !== null && painAfter !== null && difficulty !== null;

  const onSubmit = async () => {
    if (!canSubmit) return;
    const entry: SessionLogEntry = {
      date: new Date().toISOString(),
      level: workingLevel,
      painDuring: painDuring as PainLevel,
      painAfter: painAfter as PainLevel,
      difficulty: difficulty as Difficulty,
    };
    const updated = appendCheckIn(program, entry);
    await save(updated);
    // Without a region checklist to show, skip straight past the re-check.
    const next = decideAfterLog(updated);
    setPhase(next === 'safetyCheck' && !safetyQuestion ? 'logged' : next);
  };

  // ---- Safety re-check ----
  const toggleSafety = (optionId: string) => {
    const opt = safetyQuestion?.options?.find((o) => o.id === optionId);
    if (!opt) return;
    if (isExclusiveOption(opt)) {
      setSafetyAnswer(safetyAnswer.includes(optionId) ? [] : [optionId]);
      return;
    }
    const withoutExclusive = safetyAnswer.filter((id) => {
      const o = safetyQuestion?.options?.find((x) => x.id === id);
      return o ? !isExclusiveOption(o) : true;
    });
    setSafetyAnswer(
      withoutExclusive.includes(optionId)
        ? withoutExclusive.filter((id) => id !== optionId)
        : [...withoutExclusive, optionId]
    );
  };

  const onSubmitSafety = async () => {
    if (!safetyQuestion) return;
    const checked = recordSafetyCheck(program);
    await save(checked);
    const reason = detectDetour(safetyQuestion, safetyAnswer);
    if (reason) {
      // Inform only: the program stays; the detour screen says so.
      navigation.replace('RedFlagDetour', {
        severity: reason,
        items: detourItems(safetyQuestion, safetyAnswer),
        fromCheckIn: true,
      });
      return;
    }
    setPhase(decideAfterLog(checked));
  };

  // ---- Level choices ----
  const onAcceptAdvance = async () => {
    await save(advanceProgram(program));
    successHaptic();
    setPhase('unlocked');
  };

  const onDeclineAdvance = async () => {
    await save(declineAdvance(program));
    goToProgram();
  };

  const onAcceptEaseOff = async () => {
    await save(easeOffProgram(program));
    setPhase('eased');
  };

  const onDeclineEaseOff = async () => {
    await save(declineEaseOff(program));
    setPhase('logged');
  };

  if (phase === 'questions') {
    const questions: { title: string; row: ReactNode }[] = [
      {
        title: 'Pain during the session',
        row: <ChipRow options={PAIN_OPTIONS} value={painDuring} onChange={setPainDuring} />,
      },
      {
        title: 'Pain right after',
        row: <ChipRow options={PAIN_OPTIONS} value={painAfter} onChange={setPainAfter} />,
      },
      {
        title: 'How did it feel?',
        row: <ChipRow options={DIFFICULTY_OPTIONS} value={difficulty} onChange={setDifficulty} />,
      },
    ];
    return (
      <Screen
        header={<ScreenHeader onBack={() => navigation.goBack()} />}
        footer={<Button label="Log session" onPress={onSubmit} disabled={!canSubmit} />}
      >
        <FadeIn index={0}>
          <AppText variant="title">How did today go?</AppText>
          <AppText color="textSecondary" style={styles.subtitle}>
            A few quick questions about this session — Level {workingLevel},{' '}
            {getLevelName(program, workingLevel)}.
          </AppText>
        </FadeIn>
        <View style={styles.questions}>
          {questions.map((q, i) => (
            <FadeIn key={q.title} index={1 + i}>
              <Card style={styles.questionCard}>
                <AppText variant="subheading">{q.title}</AppText>
                {q.row}
              </Card>
            </FadeIn>
          ))}
        </View>
      </Screen>
    );
  }

  if (phase === 'safetyCheck' && safetyQuestion) {
    return (
      <Screen
        footer={
          <Button label="Continue" onPress={onSubmitSafety} disabled={safetyAnswer.length === 0} />
        }
      >
        <FadeIn index={0}>
          <AppText variant="smallStrong" color="textSecondary">
            You've logged significant pain twice in a row, so here's a quick check.
          </AppText>
          <AppText variant="title" style={styles.safetyTitle}>
            {safetyQuestion.questionText}
          </AppText>
          <AppText variant="small" color="textSecondary">
            Tick any that apply.
          </AppText>
        </FadeIn>
        <View style={styles.questions}>
          {safetyQuestion.options?.map((opt) => (
            <OptionCard
              key={opt.id}
              label={opt.label}
              mode="multi"
              selected={safetyAnswer.includes(opt.id)}
              onPress={() => toggleSafety(opt.id)}
            />
          ))}
        </View>
      </Screen>
    );
  }

  // Post-submit moments. No header: each moment has its own way forward, and
  // hardware back still returns to the Program.
  if (phase === 'offer' && nextLevel !== null) {
    return (
      <Screen
        scroll={false}
        footer={
          <>
            <Button
              label={returningToNext ? `Return to Level ${nextLevel}` : `Unlock Level ${nextLevel}`}
              onPress={onAcceptAdvance}
            />
            <Button label="Stay here for now" variant="ghost" onPress={onDeclineAdvance} />
          </>
        }
      >
        <Moment
          icon="target"
          tone="accent"
          title="You're moving well"
          body={
            returningToNext
              ? `Your recent sessions have been steady and comfortable. Ready to go back to Level ${nextLevel}?`
              : `Your recent sessions have been consistent, comfortable, and feeling easy. Ready to move up to Level ${nextLevel}?`
          }
        />
      </Screen>
    );
  }

  if (phase === 'easeOff' && previousLevel !== null) {
    return (
      <Screen
        scroll={false}
        footer={
          <>
            <Button label={`Go back to Level ${previousLevel}`} onPress={onAcceptEaseOff} />
            <Button label={`Stay at Level ${workingLevel}`} variant="ghost" onPress={onDeclineEaseOff} />
          </>
        }
      >
        <Moment
          icon="growth"
          tone="sage"
          title="Want to ease off a little?"
          body={`Your last few sessions at Level ${workingLevel} have been tough. Spending a bit more time on Level ${previousLevel} can help you build back up. Level ${workingLevel} stays unlocked.`}
        />
      </Screen>
    );
  }

  if (phase === 'eased') {
    return (
      <Screen scroll={false} footer={<Button label="Back to program" onPress={goToProgram} />}>
        <Moment
          icon="growth"
          tone="sage"
          title={`Back to Level ${workingLevel}`}
          body={`${getLevelName(program, workingLevel)}. We'll offer Level ${workingLevel + 1} again when your sessions say you're ready.`}
        />
      </Screen>
    );
  }

  if (phase === 'unlocked') {
    return (
      <Screen
        scroll={false}
        footer={<Button label="Let's go" variant="warm" onPress={goToProgram} />}
      >
        <Moment
          icon="celebrate"
          tone="warm"
          title={`Level ${workingLevel} unlocked`}
          titleColor="warm"
          body={`${getLevelName(program, workingLevel)} — new exercises are ready for you.`}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false} footer={<Button label="Back to program" onPress={goToProgram} />}>
      <Moment
        icon="done"
        tone="sage"
        title="Session logged"
        body="Nice work — keep at it. Consistency is what moves you forward."
      >
        {shouldSuggestProfessional(program) ? (
          <Card variant="caution">
            <AppText variant="small" color="caution" align="center">
              You've reported notable pain the last few sessions. If it keeps up,
              it's worth checking in with a doctor or physiotherapist.
            </AppText>
          </Card>
        ) : null}
      </Moment>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: spacing.xs,
  },
  safetyTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  questions: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  questionCard: {
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
});
