// Shared theme tokens (palette + spacing).
// NOTE: kept at this path/name for import stability; Step 7 extracts a proper
// `theme.ts` design-system layer. For now it holds the colours + one spacing
// constant that every screen consumes. (The old placeholder ScreenContainer /
// LinkButton scaffolds were removed — all screens are now bespoke.)

export const colors = {
  background: '#1E1420', // deep aubergine / dark plum
  surface: '#2C1F30',
  accent: '#5FB6C4', // muted cyan — primary/active
  accentWarm: '#E8A87C', // warm pastel — celebratory only
  danger: '#E0A4B0', // distinct "see a doctor" tone — not an alarm red
  textPrimary: '#F2ECEF',
  textSecondary: '#A99BA8',
};

// Bottom breathing room for scrollable screen content (clears the Android
// gesture zone now that there's no floating bottom bar).
export const screenBottomPadding = 40;
