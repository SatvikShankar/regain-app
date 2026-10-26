// A region tile for Region Select: artwork on a tinted panel, then the name and
// a one-line description. Built for a 2-column grid so more regions just add
// tiles. A "coming soon" tile is dimmed, badged and not tappable.

import { StyleSheet, View } from 'react-native';
import { RegionInfo } from '../types/region';
import { colors, radii, spacing } from '../theme';
import { regionArt } from './illustrations';
import AppText from './primitives/AppText';
import Card from './primitives/Card';
import Icon from './primitives/Icon';

export default function RegionCard({ region, onPress }: { region: RegionInfo; onPress: () => void }) {
  const art = regionArt[region.id];
  const comingSoon = !region.available;
  return (
    <Card
      onPress={comingSoon ? undefined : onPress}
      accessibilityLabel={comingSoon ? `${region.label}, coming soon` : region.label}
      style={[styles.tile, comingSoon && styles.dimmed]}
    >
      <View style={[styles.art, { backgroundColor: art?.tileTint ?? colors.surface2 }]}>
        {art ? <art.Art /> : <Icon name={region.icon} size={48} color={colors.text2} />}
      </View>
      <View style={styles.nameRow}>
        <AppText variant="heading" style={styles.name}>
          {region.label}
        </AppText>
        {comingSoon ? (
          <View style={styles.badge}>
            <AppText variant="micro" color="text2">
              Coming soon
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="caption" color="text2" style={styles.desc}>
        {region.subtitle}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    padding: 10,
    paddingBottom: 18,
    gap: 14,
  },
  dimmed: {
    opacity: 0.55,
  },
  art: {
    height: 132,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  name: {
    fontFamily: 'Figtree_700Bold',
  },
  badge: {
    backgroundColor: colors.surface2,
    borderRadius: 8,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  desc: {
    paddingHorizontal: spacing.xs,
    fontSize: 14,
    lineHeight: 20,
  },
});
