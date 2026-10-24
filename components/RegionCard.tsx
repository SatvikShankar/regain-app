// Large tappable region card for Region Select (Back / Neck). Icon badge + label
// for now; real illustrations can replace the badge later without touching
// callers. A "coming soon" card is dimmed, badged, and not pressable.

import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../theme';
import AppText from './primitives/AppText';
import Card from './primitives/Card';
import Icon, { IconName } from './primitives/Icon';
import IconBadge from './primitives/IconBadge';

export default function RegionCard({
  label,
  icon,
  subtitle,
  onPress,
  comingSoon = false,
}: {
  label: string;
  icon: IconName;
  subtitle?: string;
  onPress?: () => void;
  comingSoon?: boolean;
}) {
  return (
    <Card
      onPress={comingSoon ? undefined : onPress}
      accessibilityLabel={comingSoon ? `${label}, coming soon` : label}
      style={[styles.card, comingSoon && styles.dimmed]}
    >
      <IconBadge name={icon} tone={comingSoon ? 'neutral' : 'accent'} size={56} />
      <View style={styles.text}>
        <AppText variant="heading">{label}</AppText>
        {subtitle ? (
          <AppText variant="small" color="textSecondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {comingSoon ? (
        <View style={styles.badge}>
          <AppText variant="caption" color="textSecondary">
            Coming soon
          </AppText>
        </View>
      ) : (
        <Icon name="forward" color={colors.textTertiary} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 100,
  },
  dimmed: {
    opacity: 0.6,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  badge: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
  },
});
