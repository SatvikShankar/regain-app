// Generating — covers the two AI calls between the questionnaire and Program.
//
// Runs generateProgram() once, SAVES the program (there's no preview/save step
// any more), then replaces the whole new-program flow with the Program screen,
// so back from there goes Home. generateProgram never throws — on failure it
// returns the fallbacks — so this screen always moves forward and never errors.
// Shown for at least MIN_VISIBLE_MS so it never just flashes. Back is ignored.

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import GeneratingRings from '../components/GeneratingRings';
import AppText from '../components/primitives/AppText';
import Icon from '../components/primitives/Icon';
import Screen from '../components/primitives/Screen';
import { RootStackParamList } from '../navigation/types';
import { useProgramStore } from '../state/programStore';
import { colors, spacing } from '../theme';
import { generateProgram } from '../utils/ai/generateProgram';
import { buildProgramFromGenerated } from '../utils/programHelpers';
import { getRegionContent } from '../utils/regionContent';

const STATUS_LINES = [
  'Reading through your answers…',
  'Finding the right starting level…',
  'Choosing exercises that fit…',
];
const STATUS_INTERVAL_MS = 2000;
const MIN_VISIBLE_MS = 2500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function LoadingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Loading'>>();
  const save = useProgramStore((s) => s.save);
  const startedRef = useRef(false);
  const [step, setStep] = useState(0);

  // Back does nothing here — the calls are already running.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setStep((i) => Math.min(i + 1, STATUS_LINES.length - 1)), STATUS_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (startedRef.current) return; // guard against double-invoke in dev
    startedRef.current = true;

    (async () => {
      const { intakeResult } = route.params;
      const content = getRegionContent(intakeResult.region);
      if (!content) {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        return;
      }

      const [generated] = await Promise.all([generateProgram(intakeResult, content), wait(MIN_VISIBLE_MS)]);
      const program = buildProgramFromGenerated(intakeResult.region, intakeResult, generated);
      if (__DEV__) console.log('[Regain] generated program:', JSON.stringify(program, null, 2));
      await save(program);
      navigation.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: 'Program', params: { programId: program.id, justCreated: true } }],
      });
    })();
  }, [navigation, route.params, save]);

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <GeneratingRings />
      <AppText variant="title" align="center" style={styles.title}>
        {'Putting together\nyour program'}
      </AppText>
      <View style={styles.lines} accessibilityLiveRegion="polite">
        {STATUS_LINES.map((line, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <View key={line} style={[styles.line, !done && !current && styles.upcoming]}>
              <View style={styles.marker}>
                {done ? (
                  <Icon name="check" size={16} strokeWidth={2.4} color={colors.text3} />
                ) : current ? (
                  <View style={styles.dot} />
                ) : null}
              </View>
              <AppText variant="option" color={current ? 'text1' : 'text3'} style={styles.lineText}>
                {line}
              </AppText>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  title: {
    marginTop: spacing.xxxl,
  },
  lines: {
    marginTop: 28,
    gap: spacing.sm,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  upcoming: {
    opacity: 0.5,
  },
  marker: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  lineText: {
    fontSize: 15,
    lineHeight: 20,
  },
});
