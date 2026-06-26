// Region Select — pick the body region to start intake.
// Back is fully built (→ intake). Neck is scaffold only ("coming soon", not
// selectable). Illustrations get sourced later; styled icon/label cards for now.

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RegionCard from '../components/RegionCard';
import { bottomNavClearance, colors } from '../components/ScreenContainer';
import { RootStackParamList } from '../navigation/types';

export default function RegionSelectScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={12}
        >
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>

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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: bottomNavClearance,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backChevron: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '300',
    marginTop: -6,
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
