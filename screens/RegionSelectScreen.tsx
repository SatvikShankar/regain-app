// Region Select — pick the body region to start intake. Reached from Home, so
// the header shows Home only (back would just be Home). Back is fully built;
// Neck is scaffold ("coming soon", not selectable).

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RegionCard from '../components/RegionCard';
import ScreenHeader from '../components/ScreenHeader';
import { colors, screenBottomPadding } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';

export default function RegionSelectScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader onHome={() => navigation.navigate('Home')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>What's bothering you?</Text>
        <Text style={styles.subtitle}>
          Pick the area you'd like to work on. We'll ask a few questions to
          understand your situation.
        </Text>

        <View style={styles.cards}>
          <RegionCard
            label="Back"
            icon="🧍"
            subtitle="Lower, mid, or upper back pain"
            onPress={() => navigation.navigate('Intake', { region: 'back' })}
          />
          <RegionCard
            label="Neck"
            icon="🙆"
            subtitle="Neck and shoulder tension"
            comingSoon
          />
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
    paddingTop: 8,
    paddingBottom: screenBottomPadding,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 10,
  },
  cards: {
    marginTop: 32,
    gap: 16,
  },
});
