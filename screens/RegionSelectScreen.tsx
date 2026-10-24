// Region Select — pick the body region to start intake. Reached from Home, so
// the header shows Home only (back would just be Home). Cards render from
// the region registry (data/regions); unavailable regions show "Coming soon" and aren't selectable.

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import RegionCard from '../components/RegionCard';
import ScreenHeader from '../components/ScreenHeader';
import AppText from '../components/primitives/AppText';
import FadeIn from '../components/primitives/FadeIn';
import Screen from '../components/primitives/Screen';
import { RootStackParamList } from '../navigation/types';
import { spacing } from '../theme';
import { getRegions } from '../utils/regionContent';

export default function RegionSelectScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Screen header={<ScreenHeader onHome={() => navigation.navigate('Home')} />}>
      <FadeIn index={0}>
        <AppText variant="title">What's bothering you?</AppText>
        <AppText color="textSecondary" style={styles.subtitle}>
          Pick the area you'd like to work on. We'll ask a few questions to
          understand your situation.
        </AppText>
      </FadeIn>

      <View style={styles.cards}>
        {getRegions().map((r, i) => (
          <FadeIn key={r.id} index={1 + i}>
            <RegionCard
              label={r.label}
              icon={r.icon}
              subtitle={r.subtitle}
              comingSoon={!r.available}
              onPress={() => navigation.navigate('Intake', { region: r.id })}
            />
          </FadeIn>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: spacing.xs,
  },
  cards: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
});
