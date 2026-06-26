// Programs tab — list of the user's programs (Step 1 placeholder).
// Real version: one card per stored program. For now, a labelled empty screen.

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinkButton, ScreenContainer } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';

export default function ProgramsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenContainer
      title="Programs"
      subtitle="Placeholder. Your active programs will be listed here."
    >
      <LinkButton
        label="Open a program (placeholder)"
        onPress={() => navigation.navigate('Program', {})}
      />
    </ScreenContainer>
  );
}
