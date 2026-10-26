// Spacing + shape tokens. A fixed scale keeps rhythm consistent; screens pick
// from it instead of inventing numbers.

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
};

export const screenGutter = 20;   // horizontal padding of every screen
export const cardPadding = 20;
export const cardGap = 12;        // between cards
export const sectionGap = 32;     // between sections
export const touchTarget = 44;    // minimum tappable size

// Fully rounded everywhere — no sharp corners by default.
export const radii = {
  xs: 10,       // tags
  sm: 14,       // small icon tiles, level number tiles
  md: 20,       // inputs, rows
  option: 22,   // option cards
  lg: 28,       // cards
  xl: 36,       // sheet tops
  pill: 999,    // buttons, chips, icon buttons
};
