// Uniform top header for every non-Home screen. One consistent pattern:
//   left  = one step back (previous screen / previous question) — only when the
//           previous screen is meaningfully different from Home
//   right = Home ("all roads lead home")
//
// Home itself renders no header. Icons are text placeholders for now; Step 7's
// design-system pass swaps in a proper icon set.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './ScreenContainer';

export default function ScreenHeader({
  onBack,
  onHome,
}: {
  onBack?: () => void;
  onHome?: () => void;
}) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>
      ) : (
        <View style={styles.backButton} />
      )}

      <View style={styles.spacer} />

      {onHome ? (
        <Pressable onPress={onHome} style={styles.homeButton} hitSlop={8}>
          <Text style={styles.homeText}>Home</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    minHeight: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backChevron: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '300',
    marginTop: -6,
  },
  spacer: {
    flex: 1,
  },
  homeButton: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  homeText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
