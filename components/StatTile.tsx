// A single calm stat tile for the Home progress reflection (e.g. "3 / This week").
// Deliberately quiet — a number and a label, no charts or pressure framing.

import { StyleSheet, Text, View } from 'react-native';
import { colors } from './ScreenContainer';

export default function StatTile({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <View style={styles.tile}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 4,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
