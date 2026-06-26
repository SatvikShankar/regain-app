// Red-Flag Detour — purely informational. Reached when the intake checklist
// surfaces a symptom that warrants medical review BEFORE doing exercises.
//
// No exercises, no program, nothing stored (no program object is ever created
// for a red-flagged user). Two severity variants: "standard" (see a doctor
// before starting) and "urgent" (bladder/bowel changes — seek care promptly).
// Copy is functionally correct but can be refined by Satvik later.

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../components/PrimaryButton';
import { bottomNavClearance, colors } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';

export default function RedFlagDetourScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RedFlagDetour'>>();
  const severity = route.params?.severity ?? 'standard';
  const urgent = severity === 'urgent';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✚</Text>
        </View>

        <Text style={styles.title}>
          {urgent
            ? 'Please seek medical attention promptly'
            : 'Worth checking with a doctor first'}
        </Text>

        <Text style={styles.body}>
          {urgent
            ? "Based on what you told us, we'd strongly encourage you to contact a doctor or urgent care now rather than waiting. Some symptoms — like recent changes in bladder or bowel control alongside back pain — need timely medical review."
            : "Based on what you told us, we'd recommend seeing a doctor or physiotherapist before starting an exercise program. They can make sure it's safe and right for your situation."}
        </Text>

        <Text style={styles.note}>
          Regain is an exercise companion, not a medical service. We haven't saved
          anything — you can come back and start again anytime.
        </Text>

        <View style={styles.actions}>
          <PrimaryButton label="Back to Home" onPress={() => navigation.navigate('Home')} />
          <PrimaryButton
            label="Start over"
            variant="subtle"
            onPress={() => navigation.navigate('RegionSelect')}
          />
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: bottomNavClearance,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    color: colors.danger,
    fontSize: 30,
    fontWeight: '700',
  },
  title: {
    color: colors.danger,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 33,
  },
  body: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
  },
  note: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 20,
  },
  actions: {
    marginTop: 'auto',
    gap: 12,
  },
});
