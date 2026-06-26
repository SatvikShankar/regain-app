// Large tappable region card for Region Select (Back / Neck).
// Uses a styled icon + label placeholder for now; real illustrations get
// sourced later (SCREENS.md permits placeholders). A "coming soon" card is
// dimmed, shows a badge, and is not pressable.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './ScreenContainer';

export default function RegionCard({
  label,
  icon,
  subtitle,
  onPress,
  comingSoon = false,
}: {
  label: string;
  icon: string;
  subtitle?: string;
  onPress?: () => void;
  comingSoon?: boolean;
}) {
  return (
    <Pressable
      onPress={comingSoon ? undefined : onPress}
      disabled={comingSoon}
      style={({ pressed }) => [
        styles.card,
        comingSoon && styles.cardDisabled,
        pressed && !comingSoon && styles.pressed,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {comingSoon ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Coming soon</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 22,
    gap: 18,
    minHeight: 104,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    fontSize: 40,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 19,
  },
  badge: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
