// Intake — one screen that walks the branching question tree (logic in
// utils/intakeEngine.ts, content in data/regions/<region>/intake.ts). Renders the
// current question only; where to go next is decided by the engine from the
// SELECTED OPTIONS (this answer + earlier ones on the current path).
//
// Free text is captured per question and carried into the IntakeResult (it
// becomes context for the AI calls) but never affects routing.
//
// Navigation: back (header or Android back) steps to the previous question with
// its answer restored; on the first question it returns to Region Select. ✕ asks
// to confirm, then quits to Home. Nothing is persisted until COMPLETE.
//
// Motion: the current question slides 24px out and fades, then the next springs
// in from the other side (reversed when going back).

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import OptionCard from '../components/OptionCard';
import ProgressDots from '../components/ProgressDots';
import ScreenHeader from '../components/ScreenHeader';
import AppText from '../components/primitives/AppText';
import Button from '../components/primitives/Button';
import Dialog from '../components/primitives/Dialog';
import IconButton from '../components/primitives/IconButton';
import Screen from '../components/primitives/Screen';
import TextField from '../components/primitives/TextField';
import { RootStackParamList } from '../navigation/types';
import { colors, durations, questionSlide, spacing, springs } from '../theme';
import { IntakeQuestion, IntakeQuestionResponse } from '../types/intake';
import {
  AnswerMap,
  COMPLETE,
  RED_FLAG_DETOUR,
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

const DEFAULT_NOTE_PLACEHOLDER = "e.g. it's worse after long days at my desk";
const SLIDE_OUT_MS = 140;

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
  const [quitOpen, setQuitOpen] = useState(false);

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

  // ---- Question transition ----
  const shift = useSharedValue(0); // px; 0 = in place
  const opacity = useSharedValue(1);
  const transitioning = useRef(false);
  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: shift.value }],
  }));

  // Slide the current question out, swap state, then spring the new one in.
  const transition = (dir: 'forward' | 'back', swap: () => void) => {
    if (transitioning.current) return;
    transitioning.current = true;
    const out = dir === 'forward' ? -questionSlide : questionSlide;
    shift.value = withTiming(out, { duration: SLIDE_OUT_MS });
    opacity.value = withTiming(0, { duration: SLIDE_OUT_MS });
    setTimeout(() => {
      swap();
      shift.value = -out;
      shift.value = withSpring(0, { ...springs.standard, damping: 24 });
      opacity.value = withTiming(1, { duration: durations.normal });
      transitioning.current = false;
    }, SLIDE_OUT_MS);
  };

  // ---- Validation ----
  const isChoice = question?.type !== 'freeTextOnly';
  const hasChoice = Array.isArray(selectedOption) ? selectedOption.length > 0 : selectedOption != null;
  const canContinue = question
    ? question.type === 'freeTextOnly'
      ? freeText.trim().length > 0
      : hasChoice
    : false;

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
    if (!canContinue || transitioning.current) return;
    const updated: Record<string, Answer> = {
      ...answers,
      [currentId]: { selectedOption, freeText },
    };
    setAnswers(updated);

    const next = getNextQuestionId(question, selectedOption, pathAnswers);

    if (next === RED_FLAG_DETOUR) {
      const reason = detectDetour(question, selectedOption, pathAnswers) ?? 'standard';
      if (__DEV__) console.log('[Regain] detour →', reason);
      // Replace the questionnaire: back from the doctor screen goes Home.
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Home' },
          { name: 'RedFlagDetour', params: { severity: reason, items: detourItems(question, selectedOption) } },
        ],
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
      if (__DEV__) console.log('[Regain] IntakeResult:', JSON.stringify(result, null, 2));
      navigation.navigate('Loading', { intakeResult: result });
      return;
    }

    transition('forward', () => {
      setHistory((h) => [...h, currentId]);
      setCurrentId(next);
    });
  };

  // ---- Back (shared by the header control and Android back) ----
  const goToPrevious = useCallback(() => {
    if (history.length === 0) return false;
    const prev = history[history.length - 1];
    transition('back', () => {
      setHistory((h) => h.slice(0, -1));
      setCurrentId(prev);
    });
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const onBackPress = () => {
    if (!goToPrevious()) navigation.goBack();
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => goToPrevious());
    return () => sub.remove();
  }, [goToPrevious]);

  // Quit the whole questionnaire, discarding answers (nothing was saved).
  const quit = () => {
    setQuitOpen(false);
    navigation.popToTop();
  };

  if (!question) return null;

  const showNote = question.type === 'singleSelect' && !question.disableFreeText;
  const notePlaceholder = question.freeTextPlaceholder ?? DEFAULT_NOTE_PLACEHOLDER;
  const isMulti = question.type === 'multiSelect';
  const regularOptions = question.options?.filter((o) => !o.exclusive) ?? [];
  const exclusiveOptions = question.options?.filter((o) => o.exclusive) ?? [];
  const isSelected = (id: string) =>
    isMulti ? Array.isArray(selectedOption) && selectedOption.includes(id) : selectedOption === id;
  const renderOption = (id: string, label: string) => (
    <OptionCard
      key={id}
      label={label}
      selected={isSelected(id)}
      mode={isMulti ? 'multi' : 'single'}
      compact={isMulti}
      onPress={() => (isMulti ? toggleMulti(id) : selectSingle(id))}
    />
  );

  return (
    <Screen
      keyboardAware
      header={
        <ScreenHeader
          onBack={onBackPress}
          backLabel="Previous question"
          center={
            <View style={styles.progress}>
              <ProgressDots current={path.length} total={total} />
              <AppText variant="micro" color="text3">
                {path.length} of {Math.max(total, path.length)}
              </AppText>
            </View>
          }
          right={<IconButton icon="close" onPress={() => setQuitOpen(true)} accessibilityLabel="Quit questions" />}
        />
      }
      footer={<Button label="Continue" onPress={onContinue} disabled={!canContinue} />}
      contentStyle={styles.content}
    >
      <Animated.View style={contentStyle}>
        <View style={styles.heading}>
          {question.introText ? (
            <AppText variant="captionStrong" color="text2">
              {question.introText}
            </AppText>
          ) : null}
          <AppText variant="title">{question.questionText}</AppText>
          {isMulti ? (
            <AppText variant="caption" color="text3">
              Tick any that apply.
            </AppText>
          ) : null}
        </View>

        {isChoice ? (
          <View style={isMulti ? styles.checklist : styles.options} accessibilityRole={isMulti ? undefined : 'radiogroup'}>
            {regularOptions.map((o) => renderOption(o.id, o.label))}
            {exclusiveOptions.length ? <View style={styles.divider} /> : null}
            {exclusiveOptions.map((o) => renderOption(o.id, o.label))}
          </View>
        ) : (
          <View style={styles.freeTextOnly}>
            <TextField
              size="large"
              multiline
              value={freeText}
              onChangeText={setFreeText}
              accessibilityLabel={question.questionText}
            />
            {question.freeTextPlaceholder ? (
              <AppText variant="caption" color="text3" style={styles.hint}>
                {question.freeTextPlaceholder} Your own words are fine.
              </AppText>
            ) : null}
          </View>
        )}

        {showNote && hasChoice ? (
          <Animated.View
            entering={FadeInDown.springify().stiffness(springs.expand.stiffness).damping(springs.expand.damping)}
            layout={LinearTransition.springify().stiffness(springs.expand.stiffness).damping(springs.expand.damping)}
            style={styles.note}
          >
            <View style={styles.noteLabel}>
              <AppText variant="label">Anything else you'd like to add?</AppText>
              <AppText variant="caption" color="text3">
                Optional
              </AppText>
            </View>
            <TextField
              multiline
              value={freeText}
              onChangeText={setFreeText}
              placeholder={notePlaceholder}
              accessibilityLabel="Anything else you'd like to add? Optional"
            />
          </Animated.View>
        ) : null}
      </Animated.View>

      <Dialog
        visible={quitOpen}
        icon="close"
        title="Leave the questions?"
        body="Your answers so far won't be kept."
        onDismiss={() => setQuitOpen(false)}
        actions={[
          { label: 'Leave', variant: 'secondary', onPress: quit },
          { label: 'Keep going', variant: 'primary', onPress: () => setQuitOpen(false) },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    paddingTop: spacing.lg,
  },
  heading: {
    gap: 10,
    marginBottom: spacing.xl,
  },
  options: {
    gap: 10,
  },
  checklist: {
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xxs,
    marginHorizontal: spacing.xs,
  },
  freeTextOnly: {
    gap: 10,
  },
  hint: {
    paddingHorizontal: spacing.xxs,
  },
  note: {
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  noteLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: spacing.xxs,
  },
});
