// Motion tokens. Every animation in the app draws from these so the feel stays
// consistent and can be tuned in one place. Springs (not linear timing) are the
// default — they're what makes interactions feel physical and "buttery".

export const durations = {
  fast: 140,
  normal: 240,
  slow: 380,
};

export const springs = {
  // Press-down/release on tappable surfaces: quick, no wobble.
  press: { damping: 20, stiffness: 380, mass: 0.6 },
  // Layout shifts (expanding sections, progress fills): smooth settle.
  gentle: { damping: 22, stiffness: 180, mass: 0.9 },
  // Celebratory pops (level unlocked): a touch of bounce.
  bouncy: { damping: 11, stiffness: 160, mass: 0.8 },
};

export const pressScale = 0.97;

// Delay between items in a staggered list entrance.
export const staggerStep = 55;
