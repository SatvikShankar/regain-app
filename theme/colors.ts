// Colour tokens. Two layers:
//   palette — the raw hues. Tweak these to re-tint the whole app.
//   colors  — SEMANTIC tokens (what a colour is FOR). Screens and components
//             only ever use `colors.*`, never palette values or hex strings, so a
//             re-theme is a one-file change.
//
// Meaning is fixed app-wide (SCREENS.md): cyan = active/primary, warm = positive
// or celebratory, caution (rose) = "see a doctor". Never reuse one for another.

const palette = {
  plum950: '#171019',
  plum900: '#1E1420', // app background — deep aubergine
  plum800: '#281C2C', // resting surface
  plum700: '#33253A', // raised surface / pressed
  plum600: '#43334A', // subtle borders, empty tracks
  mist100: '#F4EEF3',
  mist300: '#BDAFBC',
  mist500: '#8A7C8C',
  cyan300: '#86C9D2', // muted, low-saturation cyan
  cyan900: '#10252A',
  apricot300: '#EDB894', // warm pastel
  apricot900: '#2E1D12',
  rose300: '#E7A9B8', // distinct from both accents and from an error red
  lavender300: '#B8A7DE',
  sage300: '#A9CDB4',
};

// Translucent tint of a hex colour — used for soft "glassy" fills.
export function tint(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export const colors = {
  background: palette.plum900,
  backgroundDeep: palette.plum950,
  surface: palette.plum800,
  surfaceRaised: palette.plum700,
  track: palette.plum600, // empty progress / inactive fills
  border: 'rgba(255, 255, 255, 0.06)', // hairline top-light that gives cards their "glass" edge
  shadow: '#000000',

  textPrimary: palette.mist100,
  textSecondary: palette.mist300,
  textTertiary: palette.mist500,

  accent: palette.cyan300,
  accentSoft: tint(palette.cyan300, 0.14),
  accentBorder: tint(palette.cyan300, 0.45),
  onAccent: palette.cyan900,

  warm: palette.apricot300,
  warmSoft: tint(palette.apricot300, 0.14),
  onWarm: palette.apricot900,

  caution: palette.rose300,
  cautionSoft: tint(palette.rose300, 0.13),

  // Extra calm hues for decorative widgets / future charts (neutral meaning).
  lavender: palette.lavender300,
  lavenderSoft: tint(palette.lavender300, 0.14),
  sage: palette.sage300,
  sageSoft: tint(palette.sage300, 0.14),
};

export type ColorToken = keyof typeof colors;

// Tone = a foreground + its soft fill, for icon badges, tiles and chips.
// Pick by meaning: accent (active), warm (positive), caution (see a doctor),
// lavender/sage (neutral decoration), neutral (quiet/inactive).
export const tones = {
  accent: { fg: colors.accent, soft: colors.accentSoft },
  warm: { fg: colors.warm, soft: colors.warmSoft },
  caution: { fg: colors.caution, soft: colors.cautionSoft },
  lavender: { fg: colors.lavender, soft: colors.lavenderSoft },
  sage: { fg: colors.sage, soft: colors.sageSoft },
  neutral: { fg: colors.textSecondary, soft: colors.surfaceRaised },
};

export type Tone = keyof typeof tones;
