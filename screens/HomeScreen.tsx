// Home — default landing (Step 1 placeholder).
// Real version: empty-state vs. program quick-continue cards + derived progress
// snapshot. For now it just labels itself and offers a way into the flow.

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinkButton, ScreenContainer } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';

export default function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScreenContainer
      title="Home"
      subtitle="Placeholder dashboard. This will show your programs and progress."
    >
      <LinkButton
        label="Tell us what's bothering you"
        onPress={() => navigation.navigate('RegionSelect')}
      />
    </ScreenContainer>
  );
}
