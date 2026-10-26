// The top bar for every non-Home screen: 56pt tall, three slots.
//   left   — back (previous screen / previous question). Back from a first-level
//            screen leads Home, so there is no separate Home button.
//   center — optional title (one line) or custom content (e.g. questionnaire progress)
//   right  — optional action (⋮ options, ✕ quit)

import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../theme';
import AppText from './primitives/AppText';
import IconButton from './primitives/IconButton';

export default function ScreenHeader({
  onBack,
  backLabel = 'Back',
  title,
  center,
  right,
}: {
  onBack?: () => void;
  backLabel?: string;
  title?: string;
  center?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack ? <IconButton icon="back" onPress={onBack} accessibilityLabel={backLabel} /> : null}
      </View>
      <View style={styles.center}>
        {center ??
          (title ? (
            <AppText variant="labelLarge" numberOfLines={1}>
              {title}
            </AppText>
          ) : null)}
      </View>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: 14,
  },
  side: {
    width: 44,
  },
  right: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
});
