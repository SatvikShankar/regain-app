// Intake — one screen that walks the branching question tree (logic lives in
// utils/intakeEngine.ts, content in data/intake/*). Renders the current question
// only; advancing/branching is decided by the engine from the SELECTED OPTION.
//
// Free text is captured per question and carried into the IntakeResult (it
// becomes context for the AI calls) but never affects branching.
//
// Back navigation (on-screen control AND Android hardware back) steps to the
// previous question with its prior answer restored. On the first question, back
// leaves intake. Nothing is persisted until COMPLETE.

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';
import OptionCard from '../components/OptionCard';
import ProgressDots from '../components/ProgressDots';
import ScreenHeader from '../components/ScreenHeader';
import AppText from '../components/primitives/AppText';
import Button from '../components/primitives/Button';
import Screen from '../components/primitives/Screen';
import { RootStackParamList } from '../navigation/types';
import { colors, durations, fonts, radii, screenGutter, spacing } from '../theme';
import { IntakeQuestion, IntakeQuestionResponse } from '../types/intake';
import {
  COMPLETE,
  RED_FLAG_DETOUR,
  AnswerMap,
  SelectedOption,
  buildIntakeResult,
  detectDetour,
  detourItems,
  estimateTotalQuestions,
  getNextQuestionId,
  getQuestionById,
  isExclusiveOption,
} from '../utils/intakeEngine';
import { getRegionContent } from '../utils/regionContent';

type Answer = { selectedOption: SelectedOption; freeText: string };

export default function IntakeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Intake'>>();
  const { region } = route.params;
  // The region's question tree, from the registry. Only built regions are
  // selectable, so content is always present; an empty tree renders nothing.
  const content = getRegionContent(region);
  const questions = content?.intake.questions ?? [];
  const startId = content?.intake.startQuestionId ?? '';

  const [currentId, setCurrentId] = useState(startId);
  const [history, setHistory] = useState<string[]>([]); // visited ids, excluding current
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  // Which way the question slides in: forward from the right, back from the left.
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  // Local working copy of the current question's answer.
  const [selectedOption, setSelectedOption] = useState<SelectedOption>(null);
  const [freeText, setFreeText] = useState('');

  const question = getQuestionById(questions, currentId) as IntakeQuestion;

  // Load (or initialize) the answer whenever the current question changes.
  useEffect(() => {
    const saved = answers[currentId];
    if (saved) {
      setSelectedOption(saved.selectedOption);
      setFreeText(saved.freeText);
    } else {
      setSelectedOption(question?.type === 'multiSelect' ? [] : null);
      setFreeText('');
    }
    // Only react to the question changing — not to answers updating mid-edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId]);

  // ---- Progress (derived from data, never hardcoded) ----
  const path = useMemo(() => [...history, currentId], [history, currentId]);
  // Answers ON THE CURRENT PATH only — if the user went back and changed an
  // earlier answer, answers from the abandoned branch must not steer routing.
  const pathAnswers = useMemo(() => {
    const map: AnswerMap = {};
    for (const id of history) map[id] = answers[id]?.selectedOption ?? null;
    return map;
  }, [history, answers]);
  const total = useMemo(
    () => estimateTotalQuestions(questions, startId, pathAnswers),
    [questions, startId, pathAnswers]
  );

  // ---- Validation ----
  const canContinue = (() => {
    if (!question) return false;
    if (question.type === 'freeTextOnly') return freeText.trim().length > 0;
    if (question.type === 'multiSelect') {
      return Array.isArray(selectedOption) && selectedOption.length > 0;
    }
    return selectedOption != null; // singleSelect
  })();

  // ---- Selection handlers ----
  const selectSingle = (optionId: string) => setSelectedOption(optionId);

  const toggleMulti = (optionId: string) => {
    const opt = question.options?.find((o) => o.id === optionId);
    if (!opt) return;
    const current = Array.isArray(selectedOption) ? selectedOption : [];

    if (isExclusiveOption(opt)) {
      // "None of the above" — selecting it clears everything else.
      setSelectedOption(current.includes(optionId) ? [] : [optionId]);
      return;
    }
    // A symptom — drop any exclusive option, then toggle this one.
    const withoutExclusive = current.filter((id) => {
      const o = question.options?.find((x) => x.id === id);
      return o ? !isExclusiveOption(o) : true;
    });
    setSelectedOption(
      withoutExclusive.includes(optionId)
        ? withoutExclusive.filter((id) => id !== optionId)
        : [...withoutExclusive, optionId]
    );
  };

  // ---- Advance ----
  const onContinue = () => {
    if (!canContinue) return;
    const updated: Record<string, Answer> = {
      ...answers,
      [currentId]: { selectedOption, freeText },
    };
    setAnswers(updated);

    const next = getNextQuestionId(question, selectedOption, pathAnswers);

    if (next === RED_FLAG_DETOUR) {
      const reason = detectDetour(question, selectedOption, pathAnswers) ?? 'standard';
      if (__DEV__) console.log('[Regain] detour →', reason);
      navigation.navigate('RedFlagDetour', {
        severity: reason,
        items: detourItems(question, selectedOption),
      });
      return;
    }

    if (next === COMPLETE) {
      const responses: IntakeQuestionResponse[] = path.map((id) => {
        const a = updated[id];
        const text = a?.freeText?.trim();
        return {
          questionId: id,
          selectedOption: a?.selectedOption ?? null,
          freeText: text ? text : null,
        };
      });
      const result = buildIntakeResult(region, questions, responses);
      if (__DEV__) {
        // Visible in the `npm start` terminal — the full IntakeResult that gets
        // serialized as context for the AI calls.
        console.log('[Regain] IntakeResult:', JSON.stringify(result, null, 2));
      }
      navigation.navigate('Loading', { intakeResult: result });
      return;
    }

    setDirection('forward');
    setHistory((h) => [...h, currentId]);
    setCurrentId(next);
  };

  // ---- Back (shared by the on-screen control and Android hardware back) ----
  const goToPrevious = useCallback(() => {
    if (history.length === 0) return false;
    const prev = history[history.length - 1];
    setDirection('back');
    setHistory((h) => h.slice(0, -1));
    setCurrentId(prev);
    return true;
  }, [history]);

  const onBackPress = () => {
    if (!goToPrevious()) navigation.goBack();
  };

  // Quit the whole intake and return Home, discarding answers. Nothing is saved
  // until COMPLETE, so there's nothing to clean up.
  const confirmQuit = () => {
    Alert.alert('Quit intake?', "Your answers won't be saved.", [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Quit', style: 'destructive', onPress: () => navigation.navigate('Home') },
    ]);
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => goToPrevious());
    return () => sub.remove();
  }, [goToPrevious]);

  if (!question) return null;

  const showFreeText = question.type === 'freeTextOnly' || !question.disableFreeText;
  const freeTextPlaceholder =
    question.freeTextPlaceholder ??
    (question.type === 'freeTextOnly'
      ? 'Type your answer here'
      : 'Anything else you’d like to add? (optional)');

  const entering = (direction === 'forward' ? FadeInRight : FadeInLeft).duration(durations.normal);

  return (
    <Screen
      keyboardAware
      header={
        <>
          <ScreenHeader onBack={onBackPress} onHome={confirmQuit} />
          <View style={styles.progressRow}>
            <ProgressDots current={path.length} total={total} />
          </View>
        </>
      }
      footer={<Button label="Continue" onPress={onContinue} disabled={!canContinue} />}
      contentStyle={styles.content}
    >
      <Animated.View key={currentId} entering={entering}>
        {question.introText ? (
          <AppText variant="smallStrong" color="textSecondary" style={styles.intro}>
            {question.introText}
          </AppText>
        ) : null}
        <AppText variant="eyebrow" color="textTertiary">
          Question {path.length} of {Math.max(total, path.length)}
        </AppText>
        <AppText variant="title" style={styles.questionText}>
          {question.questionText}
        </AppText>

        {question.type === 'multiSelect' ? (
          <AppText variant="small" color="textSecondary" style={styles.hint}>
            Select all that apply.
          </AppText>
        ) : null}

        {question.type !== 'freeTextOnly' ? (
          <View style={styles.options}>
            {question.options?.map((opt) => {
              const isSelected =
                question.type === 'multiSelect'
                  ? Array.isArray(selectedOption) && selectedOption.includes(opt.id)
                  : selectedOption === opt.id;
              return (
                <OptionCard
                  key={opt.id}
                  label={opt.label}
                  selected={isSelected}
                  mode={question.type === 'multiSelect' ? 'multi' : 'single'}
                  onPress={() =>
                    question.type === 'multiSelect' ? toggleMulti(opt.id) : selectSingle(opt.id)
                  }
                />
              );
            })}
          </View>
        ) : null}

        {showFreeText ? (
          <TextInput
            style={[styles.freeText, question.type === 'freeTextOnly' && styles.freeTextOnly]}
            value={freeText}
            onChangeText={setFreeText}
            placeholder={freeTextPlaceholder}
            placeholderTextColor={colors.textTertiary}
            selectionColor={colors.accent}
            cursorColor={colors.accent}
            maxFontSizeMultiplier={1.4}
            multiline
          />
        ) : null}
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressRow: {
    paddingHorizontal: screenGutter,
    paddingBottom: spacing.xs,
  },
  content: {
    paddingTop: spacing.lg,
  },
  intro: {
    marginBottom: spacing.sm,
  },
  questionText: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  hint: {
    marginTop: -spacing.md,
    marginBottom: spacing.md,
  },
  options: {
    gap: spacing.sm,
  },
  freeText: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 16,
    minHeight: 56,
    marginTop: spacing.md,
  },
  freeTextOnly: {
    minHeight: 140,
    textAlignVertical: 'top',
    marginTop: 0,
  },
});
