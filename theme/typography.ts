// Type tokens. Nunito = rounded sans (soft, friendly, nothing sharp).
//
// On Android a custom font's weight can't be synthesised from fontWeight, so each
// weight is its own family — always set fontFamily via these tokens, never a bare
// fontWeight. `fontAssets` is what App.tsx loads at startup.

import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { TextStyle } from 'react-native';

export const fontAssets = {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
};

export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
};

// Named text roles. Components pick a role (<AppText variant="title">) rather
// than hand-setting sizes, so type can be re-tuned app-wide from here.
export const textVariants = {
  display: { fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 40, letterSpacing: -0.3 },
  title: { fontFamily: fonts.extrabold, fontSize: 27, lineHeight: 34, letterSpacing: -0.2 },
  heading: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
  subheading: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 23 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 23 },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  smallStrong: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase' },
  stat: { fontFamily: fonts.extrabold, fontSize: 30, lineHeight: 36 },
  button: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20 },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
