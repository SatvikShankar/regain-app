// See a doctor — purely informational. Reached from the questionnaire (a warning
// sign, not cleared for exercise, or a combination of answers) or from the
// check-in safety re-check.
//
// No exercises, ever. From the questionnaire nothing is stored; from a check-in
// the existing program is kept (`fromCheckIn`). Three copy variants by reason:
// standard (see a doctor first), urgent (seek care promptly — lists exactly what
// the user ticked) and notCleared (come back once cleared). Caution colour only
// here and in the pain nudge. Back → Home. Motion: a steady fade + rise, no bounce.

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import AppText from '../components/primitives/AppText';
import Button from '../components/primitives/Button';
import FadeIn from '../components/primitives/FadeIn';
import Icon from '../components/primitives/Icon';
import IconBadge from '../components/primitives/IconBadge';
import Screen from '../components/primitives/Screen';
import { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing } from '../theme';

const COPY = {
  standard: {
    title: 'Worth checking with a doctor first',
    body: "Based on what you told us, we'd recommend seeing a doctor or physiotherapist before starting an exercise program. They can make sure it's safe and right for your situation.",
  },
  urgent: {
    title: 'Please seek medical attention promptly',
    body: "Based on what you told us, we'd strongly encourage you to contact a doctor or urgent care now rather than waiting. Some symptoms need timely medical review.",
  },
  notCleared: {
    title: "Let's wait for the go-ahead",
    body: "Since you haven't been cleared for exercise yet, it's best to check with your doctor or physiotherapist first. Once they've given you the go-ahead, come back and we'll build a program with you.",
  },
};

export default function RedFlagDetourScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'RedFlagDetour'>>();
  const { severity, items, fromCheckIn } = route.params;
  const { title, body } = COPY[severity];
  const urgent = severity === 'urgent';

  const goHome = () => navigation.popToTop();
  const startOver = () => navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'RegionSelect' }] });

  // Android back always lands Home (the questionnaire or check-in is behind us).
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.popToTop();
      return true;
    });
    return () => sub.remove();
  }, [navigation]);

  const note = fromCheckIn
    ? "Regain is an exercise companion, not a medical service. Your program is still here whenever you're ready to continue."
    : "Regain is an exercise companion, not a medical service. We haven't saved anything. You can come back and start again anytime.";

  return (
    <Screen
      glow={urgent ? 'cautionStrong' : 'caution'}
      contentStyle={[styles.content, urgent && styles.contentUrgent]}
      footer={
        <>
          <Button label="Back to Home" onPress={goHome} />
          {fromCheckIn ? null : <Button label="Start over" variant="quiet" onPress={startOver} />}
        </>
      }
    >
      {urgent ? (
        <FadeIn index={0} style={styles.panel}>
          <IconBadge name="doctor" tone="caution" size={56} solid />
          <View style={styles.panelText}>
            {items?.length ? (
              <>
                <AppText variant="labelLarge" color="cautionText">
                  You told us:
                </AppText>
                {items.map((item) => (
                  <AppText key={item} variant="labelLarge" color="cautionText">
                    {item}
                  </AppText>
                ))}
              </>
            ) : (
              <AppText variant="labelLarge" color="cautionText">
                Some of what you described needs timely medical review.
              </AppText>
            )}
          </View>
        </FadeIn>
      ) : (
        <FadeIn index={0}>
          <IconBadge name="doctor" tone="caution" size={72} />
        </FadeIn>
      )}

      <FadeIn index={1} style={styles.text}>
        {urgent ? null : (
          <AppText variant="eyebrow" color="caution">
            Before you start
          </AppText>
        )}
        <AppText variant="display">{title}</AppText>
        <AppText variant="bodyLarge" color="text2">
          {body}
        </AppText>
      </FadeIn>

      <FadeIn index={2} style={styles.info}>
        <Icon name="info" size={20} color={colors.text3} />
        <AppText variant="bodySmall" color="text2" style={styles.infoText}>
          {note}
        </AppText>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 88,
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  contentUrgent: {
    paddingTop: 64,
  },
  panel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.cautionPanel,
  },
  panelText: {
    flex: 1,
    gap: 2,
  },
  text: {
    gap: spacing.sm,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 18,
    paddingHorizontal: spacing.lg,
    borderRadius: 24,
    backgroundColor: colors.surface1,
  },
  infoText: {
    flex: 1,
  },
});
