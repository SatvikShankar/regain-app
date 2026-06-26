// Loading / Generating (Step 1 placeholder).
// Real version: a styled, reassuring wait state covering the two Haiku calls,
// then → Program (using fallbacks on failure, never blocking). For now, a button
// stands in for "generation finished".

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinkButton, ScreenContainer } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';

export default function LoadingScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenContainer
      title="Putting together your program…"
      subtitle="Placeholder. This covers the level + exercise-selection calls."
    >
      <LinkButton
        label="Continue to program →"
        onPress={() => navigation.replace('Program', {})}
      />
    </ScreenContainer>
  );
}
