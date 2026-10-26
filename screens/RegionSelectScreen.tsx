// Region Select — pick the body area to start a program for. Reached from Home;
// back returns Home. Tiles render from the region registry in a 2-column grid
// that grows as regions are added; unavailable regions show "Coming soon".

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import RegionCard from '../components/RegionCard';
import ScreenHeader from '../components/ScreenHeader';
import AppText from '../components/primitives/AppText';
import FadeIn from '../components/primitives/FadeIn';
import Screen from '../components/primitives/Screen';
import { RootStackParamList } from '../navigation/types';
import { cardGap, spacing } from '../theme';
import { RegionDefinition } from '../types/region';
import { getRegions } from '../utils/regionContent';

// Pairs of regions → rows of the 2-column grid.
function rowsOf(list: RegionDefinition[]): RegionDefinition[][] {
  const rows: RegionDefinition[][] = [];
  for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));
  return rows;
}

export default function RegionSelectScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Screen header={<ScreenHeader onBack={() => navigation.goBack()} backLabel="Back to Home" />}>
      <FadeIn index={0} style={styles.intro}>
        <AppText variant="display">What would you like to work on?</AppText>
        <AppText color="text2">
          Pick one area. You can start another program for a different area later.
        </AppText>
      </FadeIn>

      <View style={styles.grid}>
        {rowsOf(getRegions()).map((row, r) => (
          <FadeIn key={r} index={1 + r} style={styles.row}>
            {row.map((region) => (
              <RegionCard
                key={region.id}
                region={region}
                onPress={() => navigation.navigate('Intake', { region: region.id })}
              />
            ))}
            {row.length === 1 ? <View style={styles.spacer} /> : null}
          </FadeIn>
        ))}
      </View>

      <FadeIn index={3}>
        <AppText variant="caption" color="text3" align="center" style={styles.more}>
          More areas are on the way.
        </AppText>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: 10,
    paddingTop: spacing.xs,
  },
  grid: {
    marginTop: 28,
    gap: cardGap,
  },
  row: {
    flexDirection: 'row',
    gap: cardGap,
  },
  spacer: {
    flex: 1,
  },
  more: {
    marginTop: 28,
  },
});
