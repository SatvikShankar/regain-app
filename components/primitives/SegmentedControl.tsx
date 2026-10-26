// One-of-N picker as a pill track (check-in rows). The chosen segment fills
// sage. At large system font sizes (≥1.3×) it wraps to a 2-column grid so labels
// never truncate.

import { PixelRatio, StyleSheet, View } from 'react-native';
import { colors, radii } from '../../theme';
import AppText from './AppText';
import PressableScale from './PressableScale';

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
  accessibilityLabel?: string;
}) {
  const wrap = PixelRatio.getFontScale() >= 1.3;
  return (
    <View
      style={[styles.track, wrap && styles.wrap]}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <PressableScale
            key={o.value}
            onPress={() => onChange(o.value)}
            haptic="selection"
            scaleTo={0.95}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.segment, wrap && styles.segmentWrapped, selected && styles.selected]}
          >
            <AppText variant="label" color={selected ? 'onPrimary' : 'text2'} align="center" numberOfLines={1}>
              {o.label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surface2,
  },
  wrap: {
    flexWrap: 'wrap',
    borderRadius: radii.lg,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 4,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentWrapped: {
    flexBasis: '48%',
  },
  selected: {
    backgroundColor: colors.primary,
  },
});
