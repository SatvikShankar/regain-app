// Exercise Detail — one exercise, looked up from the region data by id.
// Shows how to perform it (description), why it helps (purpose), starting
// guidance (sets/reps/hold, framed as adjustable), an equipment note where
// relevant, and a Watch button when a video link exists.

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../components/PrimaryButton';
import { bottomNavClearance, colors } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';
import { Exercise } from '../types/exercise';
import { findExercise } from '../utils/programHelpers';

// No dedicated equipment field yet (MVP); surface a band note when the content
// clearly calls for one. See CLAUDE.md — an explicit field can come later.
function needsBand(exercise: Exercise): boolean {
  return /band/i.test(`${exercise.indicatedFor} ${exercise.description}`);
}

function guidanceLine(exercise: Exercise): string {
  const parts = [`${exercise.sets} set${exercise.sets === 1 ? '' : 's'}`];
  parts.push(`${exercise.reps} rep${exercise.reps === 1 ? '' : 's'}`);
  const base = parts.join(' × ');
  return exercise.holdSeconds ? `${base} · hold ${exercise.holdSeconds}s` : base;
}

export default function ExerciseDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ExerciseDetail'>>();
  const region = route.params?.region ?? 'back';
  const exerciseId = route.params?.exerciseId;
  const exercise = exerciseId ? findExercise(region, exerciseId) : undefined;

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.content}>
          <Text style={styles.title}>Exercise not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{exercise.name}</Text>

        {needsBand(exercise) ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Needs a resistance band</Text>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>How to do it</Text>
        <Text style={styles.body}>{exercise.description}</Text>

        <Text style={styles.sectionLabel}>Why it helps</Text>
        <Text style={styles.body}>{exercise.purpose}</Text>

        <View style={styles.guidanceCard}>
          <Text style={styles.guidanceValue}>{guidanceLine(exercise)}</Text>
          <Text style={styles.guidanceNote}>Starting guidance — adjust as needed.</Text>
        </View>

        {exercise.videoUrl ? (
          <View style={styles.actions}>
            <PrimaryButton
              label="Watch video"
              onPress={() => Linking.openURL(exercise.videoUrl as string)}
            />
          </View>
        ) : null}

        <View style={styles.actions}>
          <PrimaryButton label="Back to program" variant="subtle" onPress={() => navigation.goBack()} />
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
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
  },
  badgeText: {
    color: colors.accentWarm,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionLabel: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
  },
  body: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },
  guidanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginTop: 24,
    gap: 6,
  },
  guidanceValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  guidanceNote: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  actions: {
    marginTop: 20,
  },
});
