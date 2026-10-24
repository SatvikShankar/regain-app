// Exercise Detail — one exercise, looked up from region data by id. Reached from
// Program, so the header offers back (→ Program) and Home. Shows starting
// guidance, how-to, purpose, an equipment note where relevant, and a Watch
// button when a video link exists.

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Linking, StyleSheet, View } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import AppText from '../components/primitives/AppText';
import Button from '../components/primitives/Button';
import Card from '../components/primitives/Card';
import FadeIn from '../components/primitives/FadeIn';
import Icon from '../components/primitives/Icon';
import IconBadge from '../components/primitives/IconBadge';
import Screen from '../components/primitives/Screen';
import { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../theme';
import { Exercise } from '../types/exercise';
import { findExercise } from '../utils/regionContent';

function needsBand(exercise: Exercise): boolean {
  return exercise.equipment.includes('resistanceBand');
}

// Starting guidance as separate figures, e.g. [3 sets] [10 reps] [hold 5s].
function guidanceFigures(exercise: Exercise): { value: string; label: string }[] {
  const figures = [
    { value: String(exercise.sets), label: exercise.sets === 1 ? 'set' : 'sets' },
    { value: String(exercise.reps), label: exercise.reps === 1 ? 'rep' : 'reps' },
  ];
  if (exercise.holdSeconds) figures.push({ value: `${exercise.holdSeconds}s`, label: 'hold' });
  return figures;
}

export default function ExerciseDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ExerciseDetail'>>();
  const { region, exerciseId } = route.params;
  const exercise = findExercise(region, exerciseId);

  const header = (
    <ScreenHeader onBack={() => navigation.goBack()} onHome={() => navigation.navigate('Home')} />
  );

  if (!exercise) {
    return (
      <Screen header={header}>
        <AppText variant="title">Exercise not found</AppText>
      </Screen>
    );
  }

  const videoUrl = exercise.videoUrl;

  return (
    <Screen
      header={header}
      footer={
        videoUrl ? (
          <Button label="Watch video" icon="play" onPress={() => Linking.openURL(videoUrl)} />
        ) : undefined
      }
    >
      <FadeIn index={0}>
        <AppText variant="title">{exercise.name}</AppText>
        {needsBand(exercise) ? (
          <View style={styles.tag}>
            <Icon name="equipment" size={16} color={colors.lavender} />
            <AppText variant="smallStrong" color="lavender">
              Needs a resistance band
            </AppText>
          </View>
        ) : null}
      </FadeIn>

      <FadeIn index={1}>
        <Card style={styles.guidance}>
          <View style={styles.figures}>
            {guidanceFigures(exercise).map((f) => (
              <View key={f.label} style={styles.figure}>
                <AppText variant="stat">{f.value}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {f.label}
                </AppText>
              </View>
            ))}
          </View>
          <AppText variant="caption" color="textTertiary" align="center">
            Starting guidance — adjust as needed.
          </AppText>
        </Card>
      </FadeIn>

      <FadeIn index={2} style={styles.section}>
        <View style={styles.sectionHead}>
          <IconBadge name="activity" tone="accent" size={32} />
          <AppText variant="subheading">How to do it</AppText>
        </View>
        <AppText color="textSecondary">{exercise.description}</AppText>
      </FadeIn>

      <FadeIn index={3} style={styles.section}>
        <View style={styles.sectionHead}>
          <IconBadge name="support" tone="sage" size={32} />
          <AppText variant="subheading">Why it helps</AppText>
        </View>
        <AppText color="textSecondary">{exercise.purpose}</AppText>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.lavenderSoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    marginTop: spacing.sm,
  },
  guidance: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  figures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  figure: {
    alignItems: 'center',
  },
  section: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
