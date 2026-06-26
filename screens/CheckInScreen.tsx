// Check-in (Step 1 placeholder).
// Real version: three questions (pain during, pain after, ready to progress?),
// appends a sessionLog entry, runs gating, may show a "level unlocked" moment,
// then returns to Program. For now, a button returns to Program.

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinkButton, ScreenContainer } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';

export default function CheckInScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenContainer
      title="Check-in"
      subtitle="Placeholder. Three quick questions feed your session log."
    >
      <LinkButton label="Submit (placeholder)" onPress={() => navigation.goBack()} />
    </ScreenContainer>
  );
}
