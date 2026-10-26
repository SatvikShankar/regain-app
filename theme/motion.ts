// Motion tokens (Reanimated springs). Every animation draws from these so the
// feel stays consistent and is tuned in one place. Springs, not linear timing,
// are the default — they're what makes interactions feel physical.

export const springs = {
  // Press-in/out on every tappable (scale to pressScale).
  press: { stiffness: 400, damping: 18 },
  // Sheets, dialogs, screen-level moves, question slides, progress fills.
  standard: { stiffness: 260, damping: 26 },
  // Level rows, the note field, menus (children stagger by staggerStep).
  expand: { stiffness: 220, damping: 22 },
  // Level unlocked ONLY — the one spring allowed to overshoot.
  celebrate: { stiffness: 180, damping: 14 },

  // ---- Legacy names (pre-redesign components) ----
  gentle: { stiffness: 220, damping: 22 },
  bouncy: { stiffness: 180, damping: 14 },
};

export const durations = {
  fast: 150,   // fades: scrims, cross-fading status lines
  normal: 200,
  slow: 380,   // screen-content entrances
};

export const pressScale = 0.97;
export const staggerStep = 40;       // between items in an entrance
export const childStagger = 25;      // between rows revealed by an expand
export const questionSlide = 24;     // px a question slides in/out
