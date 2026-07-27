// Loading / Generating — covers the two AI calls between intake and Program.
//
// Runs generateProgram() once on mount, then REPLACES itself with the Program
// screen (replace, so Back doesn't return here). generateProgram never throws —
// on any failure it returns the fallbacks (lowest level + all exercises) — so
// this screen always moves forward and never blocks or errors.

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';
import { generateProgram } from '../utils/aiAgentCalls';
import { buildProgramFromGenerated } from '../utils/programHelpers';
import { getRegionProgram } from '../utils/programRegistry';

export default function LoadingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Loading'>>();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return; // guard against double-invoke in dev
    startedRef.current = true;

    (async () => {
      const intakeResult = route.params?.intakeResult;
      const region = intakeResult?.region ?? 'back';
      const regionProgram = getRegionProgram(region);

      if (!intakeResult || !regionProgram) {
        navigation.replace('Program', {});
        return;
      }

      const generated = await generateProgram(intakeResult, regionProgram.program);
      const previewProgram = buildProgramFromGenerated(region, intakeResult, generated);
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.title}>Putting together your program…</Text>
        <Text style={styles.subtitle}>
          We're tailoring your starting level and exercises to what you told us.
          This only takes a moment.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
});
