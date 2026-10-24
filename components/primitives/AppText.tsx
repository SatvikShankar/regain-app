// The only text component screens should use. Picks a typographic role from
// theme/typography and a semantic colour token — never raw sizes or hex — so
// type and colour can be re-tuned app-wide from the theme.

import { StyleSheet, Text, TextProps } from 'react-native';
import { ColorToken, TextVariant, colors, textVariants } from '../../theme';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
};

export default function AppText({
  variant = 'body',
  color = 'textPrimary',
  align,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.4} // respect system font scaling without breaking layouts
      {...rest}
      style={[styles.base, textVariants[variant], { color: colors[color] }, align && { textAlign: align }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false, // Android: removes extra top padding so text centres cleanly
  },
});
