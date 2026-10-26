// Type tokens. Figtree (Google Fonts): soft, friendly, nothing sharp.
//
// On Android a custom font's weight can't be synthesised from fontWeight, so
// each weight is its own family — always pick a variant, never set a bare
// fontWeight. `fontAssets` is what App.tsx loads at startup. Sizes are in sp:
// they scale with the user's system font size (capped in AppText).

import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
} from '@expo-google-fonts/figtree';
import { TextStyle } from 'react-native';

export const fontAssets = {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
};

export const fonts = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extrabold: 'Figtree_800ExtraBold',
};

// Named text roles. Components pick a role (<AppText variant="title">) so type
// can be re-tuned app-wide from here. Letter-spacing = em × size.
export const textVariants = {
  display: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 40, letterSpacing: -0.68 },
  titleLarge: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 36, letterSpacing: -0.6 },
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.39 },
  heading: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26 },
  subheading: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  bodyLarge: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 26 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodySmall: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  option: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  optionCompact: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21 },
  labelLarge: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 21 },
  label: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
  button: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 20 },
  eyebrow: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  captionStrong: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
  micro: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
  stat: { fontFamily: fonts.bold, fontSize: 40, lineHeight: 44, letterSpacing: -0.8, fontVariant: ['tabular-nums'] },
  statSmall: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 26, fontVariant: ['tabular-nums'] },

  // ---- Legacy names (pre-redesign screens; removed once Blocks 4–5 rewrite them) ----
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 23 },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  smallStrong: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
