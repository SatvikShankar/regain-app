// Text input: surface-2, radius 20, 2px sage ring while focused (no glow).
// Multiline grows with its text up to ~4 lines, then scrolls. `size="large"`
// is for when the field IS the answer (free-text-only questions, your name).

import { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { colors, fonts, radii, spacing } from '../../theme';

export default function TextField({
  size = 'regular',
  style,
  onFocus,
  onBlur,
  multiline,
  ...rest
}: TextInputProps & { size?: 'regular' | 'large' }) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      {...rest}
      multiline={multiline}
      placeholderTextColor={colors.text3}
      selectionColor={colors.primary}
      cursorColor={colors.primary}
      maxFontSizeMultiplier={1.5}
      textAlignVertical={multiline ? 'top' : 'center'}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[
        styles.field,
        size === 'large' ? styles.large : styles.regular,
        multiline && (size === 'large' ? styles.multilineLarge : styles.multiline),
        focused && styles.focused,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 60,
    borderRadius: radii.md,
    backgroundColor: colors.surface2,
    color: colors.text1,
    paddingHorizontal: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent', // constant width so focusing never shifts layout
  },
  regular: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  large: {
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 26,
  },
  multiline: {
    minHeight: 92,
    maxHeight: 24 * 4 + 32,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  multilineLarge: {
    minHeight: 120,
    maxHeight: 26 * 4 + 36,
    paddingTop: 18,
    paddingBottom: 18,
  },
  focused: {
    borderColor: colors.primary,
  },
});
