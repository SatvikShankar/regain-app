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
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OptionCard from '../components/OptionCard';
import PrimaryButton from '../components/PrimaryButton';
import ProgressDots from '../components/ProgressDots';
import ScreenHeader from '../components/ScreenHeader';
import { colors, screenBottomPadding } from '../components/ScreenContainer';
import { backIntakeQuestions, backIntakeStartQuestionId } from '../data/intake/backIntake';
import { RootStackParamList } from '../navigation/types';
import { IntakeQuestion, IntakeQuestionResponse } from '../types/intake';
import {
  COMPLETE,
  RED_FLAG_DETOUR,
  SelectedOption,
  buildIntakeResult,
  detectRedFlag,
  getBranchLengths,
  getNextQuestionId,
  getQuestionById,
  isExclusiveOption,
} from '../utils/intakeEngine';

// Region → question tree. Only Back is built; Neck is scaffold-only and isn't
// reachable here yet, so we default to Back.
function getIntakeData(region: string) {
  return {
    questions: backIntakeQuestions,
    startId: backIntakeStartQuestionId,
  };
}

type Answer = { selectedOption: SelectedOption; freeText: string };

export default function IntakeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Intake'>>();
  const region = route.params?.region ?? 'back';

  const { questions, startId } = useMemo(() => getIntakeData(region), [region]);

  const [currentId, setCurrentId] = useState(startId);
  const [history, setHistory] = useState<string[]>([]); // visited ids, excluding current
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

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
  const branch = useMemo(() => {
    for (const id of path) {
      const q = getQuestionById(questions, id);
      if (q?.branch === 'diagnosed' || q?.branch === 'undiagnosed') return q.branch;
    }
    return undefined;
  }, [path, questions]);
  const lengths = useMemo(() => getBranchLengths(questions), [questions]);
  const total = branch ? lengths[branch] : Math.max(lengths.diagnosed, lengths.undiagnosed);

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

    const next = getNextQuestionId(question, selectedOption);

    if (next === RED_FLAG_DETOUR) {
      const { severity } = detectRedFlag(question, selectedOption);
      if (__DEV__) console.log('[Regain] red flag →', severity ?? 'standard');
      navigation.navigate('RedFlagDetour', { severity: severity ?? 'standard' });
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

    setHistory((h) => [...h, currentId]);
    setCurrentId(next);
  };

  // ---- Back (shared by the on-screen control and Android hardware back) ----
  const goToPrevious = useCallback(() => {
    if (history.length === 0) return false;
    const prev = history[history.length - 1];
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader onBack={onBackPress} onHome={confirmQuit} />
        <View style={styles.progressRow}>
          <ProgressDots current={path.length} total={total} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.questionText}>{question.questionText}</Text>

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
                      question.type === 'multiSelect'
                        ? toggleMulti(opt.id)
                        : selectSingle(opt.id)
                    }
                  />
                );
              })}
            </View>
          ) : null}

          {showFreeText ? (
            <TextInput
              style={[
                styles.freeText,
                question.type === 'freeTextOnly' && styles.freeTextOnly,
              ]}
              value={freeText}
              onChangeText={setFreeText}
              placeholder={freeTextPlaceholder}
              placeholderTextColor={colors.textSecondary}
              multiline
            />
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="Continue" onPress={onContinue} disabled={!canContinue} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  progressRow: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  questionText: {
    color: colors.textPrimary,
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 24,
  },
  options: {
    gap: 12,
  },
  freeText: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    color: colors.textPrimary,
    fontSize: 15,
    minHeight: 52,
    marginTop: 16,
  },
  freeTextOnly: {
    minHeight: 120,
    textAlignVertical: 'top',
    marginTop: 0,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: screenBottomPadding,
  },
});
