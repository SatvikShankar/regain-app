// Spacing + shape tokens. A small fixed scale keeps rhythm consistent; screens
// pick from it instead of inventing numbers.

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 44,
};

// Horizontal gutter for every screen.
export const screenGutter = spacing.xl;

// Fully rounded everywhere (SCREENS.md) — no sharp corners by default.
export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
};
