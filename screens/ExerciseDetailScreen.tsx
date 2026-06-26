// Exercise Detail (Step 1 placeholder).
// Real version: name, how-to description, purpose, sets/reps/hold framed as
// starting guidance, optional "Watch" video button, equipment note. Back → Program.

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinkButton, ScreenContainer } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';

export default function ExerciseDetailScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenContainer
      title="Exercise Detail"
      subtitle="Placeholder. Description, purpose, and starting guidance go here."
    >
      <LinkButton label="Back to program" variant="subtle" onPress={() => navigation.goBack()} />
    </ScreenContainer>
  );
}
