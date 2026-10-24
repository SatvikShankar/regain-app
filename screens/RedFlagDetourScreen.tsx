// Red-Flag Detour — purely informational. Reached when the intake checklist
// surfaces a symptom that warrants medical review BEFORE doing exercises.
//
// No exercises, no program, nothing stored (no program object is ever created
// for a red-flagged user). Two severity variants: "standard" (see a doctor
// before starting), "urgent" (bladder/bowel changes — seek care promptly) and
// "notCleared" (not yet cleared for exercise — come back once cleared).
// Uses the distinct caution tone — never the positive accents.
// Copy is functionally correct but can be refined by Satvik later.

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import AppText from '../components/primitives/AppText';
import Button from '../components/primitives/Button';
import Card from '../components/primitives/Card';
import FadeIn from '../components/primitives/FadeIn';
import IconBadge from '../components/primitives/IconBadge';
import Screen from '../components/primitives/Screen';
import { RootStackParamList } from '../navigation/types';
import { spacing } from '../theme';

// Copy per detour reason (generic across regions). When warning-sign items
// triggered the detour, the urgent screen also lists exactly what the user
// ticked, so the "why" is always specific and accurate.
const GENERIC_COPY = {
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
  const { title, body } = GENERIC_COPY[severity];
  const showItems = severity === 'urgent' && !!items?.length;

  return (
    <Screen
      contentStyle={styles.content}
      footer={
        <>
          <Button label="Back to Home" onPress={() => navigation.navigate('Home')} />
          {fromCheckIn ? null : (
            <Button
              label="Start over"
              variant="ghost"
              onPress={() => navigation.navigate('RegionSelect')}
            />
          )}
        </>
      }
    >
      <FadeIn index={0}>
        <IconBadge name="doctor" tone="caution" size={72} />
      </FadeIn>

      {showItems ? (
        <FadeIn index={1}>
          <Card variant="caution" style={styles.items}>
            <AppText variant="smallStrong" color="caution">
              You told us:
            </AppText>
            {items!.map((item) => (
              <AppText key={item} variant="small" color="textPrimary">
                {'• '}
                {item}
              </AppText>
            ))}
          </Card>
        </FadeIn>
      ) : null}

      <FadeIn index={1}>
        <AppText variant="title" color="caution" style={styles.title}>
          {title}
        </AppText>
        <AppText style={styles.body}>
          {body}
        </AppText>
      </FadeIn>

      <FadeIn index={2}>
        <Card variant="caution" style={styles.note}>
          <AppText variant="small" color="textSecondary">
            {fromCheckIn
              ? 'Regain is an exercise companion, not a medical service. Your program is still here whenever you\'re ready to continue.'
              : "Regain is an exercise companion, not a medical service. We haven't saved anything — you can come back and start again anytime."}
          </AppText>
        </Card>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xxxl,
  },
  items: {
    marginTop: spacing.xl,
    gap: spacing.xxs,
  },
  title: {
    marginTop: spacing.xl,
  },
  body: {
    marginTop: spacing.md,
  },
  note: {
    marginTop: spacing.xl,
  },
});
