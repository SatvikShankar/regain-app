// Loading / Generating — covers the two AI calls between intake and Program.
//
// Runs generateProgram() once on mount, then REPLACES itself with the Program
// screen (replace, so Back doesn't return here). generateProgram never throws —
// on any failure it returns the fallbacks (lowest level + all exercises) — so
// this screen always moves forward and never blocks or errors.
//
// Visual: a breathing orb + gently rotating status lines, so the wait feels
// intentional rather than stuck.

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import BreathingOrb from '../components/BreathingOrb';
import AppText from '../components/primitives/AppText';
import Screen from '../components/primitives/Screen';
import { RootStackParamList } from '../navigation/types';
import { durations, spacing } from '../theme';
import { generateProgram } from '../utils/ai/generateProgram';
import { buildProgramFromGenerated } from '../utils/programHelpers';
import { getRegionContent } from '../utils/regionContent';

const STATUS_LINES = [
  'Reading through your answers…',
  'Finding the right starting level…',
  'Choosing exercises that fit…',
];
const STATUS_INTERVAL_MS = 1800;

export default function LoadingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Loading'>>();
  const startedRef = useRef(false);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setLineIndex((i) => Math.min(i + 1, STATUS_LINES.length - 1)),
      STATUS_INTERVAL_MS
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (startedRef.current) return; // guard against double-invoke in dev
    startedRef.current = true;

    (async () => {
      const { intakeResult } = route.params;
      const content = getRegionContent(intakeResult.region);
      if (!content) {
        navigation.replace('Program', {});
        return;
      }

      const generated = await generateProgram(intakeResult, content);
      const previewProgram = buildProgramFromGenerated(intakeResult.region, intakeResult, generated);
      if (__DEV__) {
        // Visible in the `npm start` terminal — handy for confirming the AI
        // result (assigned level + selected IDs) live during development.
        console.log('[Regain] generated program:', JSON.stringify(previewProgram, null, 2));
      }
      // Preview: shown on the Program screen with Save / Redo — NOT yet saved.
      navigation.replace('Program', { previewProgram });
    })();
  }, [navigation, route.params]);

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <BreathingOrb />
      <AppText variant="title" align="center" style={styles.title}>
        Putting together your program
      </AppText>
      <View style={styles.statusSlot}>
        <Animated.View
          key={lineIndex}
          entering={FadeIn.duration(durations.slow)}
          exiting={FadeOut.duration(durations.fast)}
          style={styles.statusLine}
        >
          <AppText color="textSecondary" align="center">
            {STATUS_LINES[lineIndex]}
          </AppText>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  title: {
    marginTop: spacing.xxl,
  },
  statusSlot: {
    marginTop: spacing.sm,
    minHeight: 24,
    alignSelf: 'stretch',
  },
  // Absolutely positioned so the outgoing and incoming lines cross-fade in place.
  statusLine: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
