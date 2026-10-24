// One calm stat widget for Home (e.g. "3 · This week"). A tinted icon, a number,
// a label — no pressure framing. Tone is decorative/meaningful per theme/tones.

import { StyleSheet, View } from 'react-native';
import { Tone, spacing } from '../theme';
import AppText from './primitives/AppText';
import Card from './primitives/Card';
import { IconName } from './primitives/Icon';
import IconBadge from './primitives/IconBadge';

export default function StatTile({
  value,
  label,
  icon,
  tone = 'accent',
}: {
  value: string | number;
  label: string;
  icon: IconName;
  tone?: Tone;
}) {
  return (
    <Card style={styles.tile}>
      <IconBadge name={icon} tone={tone} size={38} />
      <View style={styles.text}>
        <AppText variant="stat">{value}</AppText>
        <AppText variant="caption" color="textSecondary">
          {label}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    gap: spacing.md,
  },
  text: {
    gap: 2,
  },
});
