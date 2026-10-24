// Uniform top header for every non-Home screen. One consistent pattern:
//   left  = one step back (previous screen / previous question) — only when the
//           previous screen is meaningfully different from Home
//   right = Home ("all roads lead home")
// Home itself renders no header. Optional small centred title.

import { StyleSheet, View } from 'react-native';
import { screenGutter, spacing } from '../theme';
import AppText from './primitives/AppText';
import IconButton from './primitives/IconButton';

export default function ScreenHeader({
  onBack,
  onHome,
  title,
}: {
  onBack?: () => void;
  onHome?: () => void;
  title?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack ? <IconButton icon="back" onPress={onBack} accessibilityLabel="Back" /> : null}
      </View>
      <View style={styles.center}>
        {title ? (
          <AppText variant="smallStrong" color="textSecondary" numberOfLines={1}>
            {title}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.side, styles.right]}>
        {onHome ? <IconButton icon="home" onPress={onHome} accessibilityLabel="Home" /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenGutter - spacing.xxs,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    minHeight: 60,
  },
  side: {
    width: 48,
  },
  right: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
});
