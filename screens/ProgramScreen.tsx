// Program (Step 1 placeholder).
// Real version: the working hub for one program — levels (active/locked/completed),
// exercise names per level, a one-tap "log session" action, and a progress section.
// For now, links to Exercise Detail and Check-in.

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinkButton, ScreenContainer } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';

export default function ProgramScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenContainer
      title="Your Program"
      subtitle="Placeholder. Levels, exercises, and progress will live here."
    >
      <LinkButton
        label="Open an exercise →"
        onPress={() => navigation.navigate('ExerciseDetail', {})}
      />
      <LinkButton
        label="Log today's session"
        variant="subtle"
        onPress={() => navigation.navigate('CheckIn', {})}
      />
    </ScreenContainer>
  );
}
