// Colour tokens (values from the Claude Design handoff, 21 Oct 2026).
//   palette — raw hues. Tweak these to re-tint the app.
//   colors  — SEMANTIC tokens: what a colour is FOR. Screens use only these.
//
// Meaning is fixed app-wide: primary (sage) = active / selected / the main action
// and nothing else; warm (apricot) = celebration only, never warnings; caution
// (ochre) = see-a-doctor screens and the pain nudge only; error = rare system
// failures, never health copy; deco hues = small decorative marks, no meaning.

const palette = {
  plum950: '#161118',
  plum900: '#1B151E',
  plum800: '#211A24',
  plum700: '#2B2230',
  plum600: '#372C3D',
  plum500: '#4A3D50',
  plum400: '#6E6168',
  mist100: '#F4EDEA',
  mist300: '#C3B7BD',
  mist500: '#9A8D95',
  sage300: '#9CD3B2',
  sage400: '#86BC9C',
  sage900: '#10241A',
  sageDeep: '#21302A',
  apricot300: '#F3B486',
  apricot900: '#2E1A0C',
  ochre300: '#E5CB78',
  ochre100: '#EFDDA0',
  ochre900: '#2A220A',
  coral300: '#E8958F',
  lavender300: '#B6A5EA',
  sky300: '#8DBBDD',
  sky200: '#A9CDE8',
  rose300: '#E2A2BC',
};

// Translucent tint of a hex colour — for soft fills.
export function tint(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export const colors = {
  // Ground and surfaces (each step is one layer "up")
  bg: palette.plum950,
  surface1: palette.plum800,        // cards, sheets, icon buttons
  surface2: palette.plum700,        // chips, inputs, rows inside cards, dialogs
  surface3: palette.plum600,        // tracks, progress background, pressed secondary
  surfaceHeader: palette.plum900,   // collapsed header on scroll
  handle: palette.plum500,          // sheet handle; skipped/passed level segment
  radioOff: palette.plum400,        // unselected radio/checkbox ring
  highlight: 'rgba(255, 255, 255, 0.035)', // 1px top-light edge on cards
  divider: 'rgba(255, 236, 245, 0.07)',
  scrim: 'rgba(8, 5, 10, 0.62)',    // behind sheets and dialogs (no blur)
  scrimLight: 'rgba(8, 5, 10, 0.45)', // behind menus
  shadow: '#000000',

  // Text
  text1: palette.mist100,
  text2: palette.mist300,
  text3: palette.mist500,

  // Primary (sage) — active, selected, the main action. Nothing else.
  primary: palette.sage300,
  primaryPressed: palette.sage400,
  primarySoft: tint(palette.sage300, 0.14),
  primaryRing: tint(palette.sage300, 0.45),
  onPrimary: palette.sage900,
  selectedFill: palette.sageDeep,

  // Warm (apricot) — celebration only
  warm: palette.apricot300,
  warmSoft: tint(palette.apricot300, 0.15),
  onWarm: palette.apricot900,

  // Caution (ochre) — doctor screens + pain nudge only
  caution: palette.ochre300,
  cautionSoft: tint(palette.ochre300, 0.12),
  cautionPanel: tint(palette.ochre300, 0.14),
  cautionText: palette.ochre100,
  onCaution: palette.ochre900,

  error: palette.coral300,

  // Decorative — small marks, charts, illustrations; no status meaning
  decoLavender: palette.lavender300,
  decoSky: palette.sky300,
  decoSkyText: palette.sky200,
  decoRose: palette.rose300,

  // ---- Legacy names (pre-redesign screens; removed once Blocks 4–5 rewrite them) ----
  background: palette.plum950,
  surface: palette.plum800,
  surfaceRaised: palette.plum700,
  track: palette.plum600,
  border: 'rgba(255, 255, 255, 0.035)',
  textPrimary: palette.mist100,
  textSecondary: palette.mist300,
  textTertiary: palette.mist500,
  accent: palette.sage300,
  accentSoft: tint(palette.sage300, 0.14),
  accentBorder: tint(palette.sage300, 0.45),
  onAccent: palette.sage900,
  lavender: palette.lavender300,
  lavenderSoft: tint(palette.lavender300, 0.14),
  sage: palette.sage300,
  sageSoft: tint(palette.sage300, 0.14),
};

export type ColorToken = keyof typeof colors;

// Tone = a foreground + its soft fill, for icon tiles and tags.
export const tones = {
  primary: { fg: colors.primary, soft: colors.primarySoft },
  warm: { fg: colors.warm, soft: colors.warmSoft },
  caution: { fg: colors.caution, soft: colors.cautionSoft },
  lavender: { fg: colors.decoLavender, soft: tint(palette.lavender300, 0.12) },
  sky: { fg: colors.decoSkyText, soft: tint(palette.sky300, 0.14) },
  neutral: { fg: colors.text2, soft: colors.surface2 },
  // legacy aliases
  accent: { fg: colors.primary, soft: colors.primarySoft },
  sage: { fg: colors.primary, soft: colors.primarySoft },
};

export type Tone = keyof typeof tones;

// Background glow behind a screen's top (a soft radial light). One per mood.
export const glows = {
  plum: { color: '#2A1C2E', cx: 0.5, cy: -0.12, rx: 1.2, ry: 0.55, stop: 0.62 },
  caution: { color: '#2A2418', cx: 0.5, cy: -0.12, rx: 1.2, ry: 0.55, stop: 0.6 },
  cautionStrong: { color: '#332A17', cx: 0.5, cy: -0.12, rx: 1.2, ry: 0.6, stop: 0.62 },
  success: { color: '#1F2A25', cx: 0.5, cy: 0.3, rx: 1.1, ry: 0.5, stop: 0.6 },
  warm: { color: '#2F2119', cx: 0.5, cy: 0.34, rx: 1.1, ry: 0.5, stop: 0.62 },
};

export type Glow = keyof typeof glows;
