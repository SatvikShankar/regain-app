// Floating bottom navigation — rendered once, ABOVE the navigator, so it
// persists on every screen (Satvik's feedback: the app should feel connected
// end-to-end). Three items: Home (left), a raised filled "+" New Issue (center,
// → Region Select), Programs (right).
//
// The wrapper uses pointerEvents="box-none" so only the bar itself captures
// touches — taps on the empty area beside it pass through to the screen below.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigate } from '../navigation/navigationRef';
import { colors } from './ScreenContainer';

export default function BottomNav({ currentRoute }: { currentRoute?: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: insets.bottom + 10 }]}
    >
      <View style={styles.bar}>
        <TabItem
          label="Home"
          active={currentRoute === 'Home'}
          onPress={() => navigate('Home')}
        />

        <Pressable
          style={({ pressed }) => [styles.centerButton, pressed && styles.pressed]}
          onPress={() => navigate('RegionSelect')}
          accessibilityLabel="New issue"
        >
          <Text style={styles.centerPlus}>+</Text>
        </Pressable>

        <TabItem
          label="Programs"
          active={currentRoute === 'Programs'}
          onPress={() => navigate('Programs')}
        />
      </View>
    </View>
  );
}

function TabItem({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.tabItem} onPress={onPress}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 28,
    paddingHorizontal: 28,
    height: 64,
    width: '88%',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.accent,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28, // raised above the bar
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  centerPlus: {
    color: '#0E1416',
    fontSize: 30,
    fontWeight: '700',
    marginTop: -2,
  },
  pressed: {
    opacity: 0.8,
  },
});
