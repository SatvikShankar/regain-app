// Shell for every screen: plum background, safe-area handling (the app draws
// edge-to-edge), optional header, scrolling body, and an optional footer pinned
// to the bottom (e.g. a Continue button). Screens compose this instead of each
// re-implementing insets/padding, so layout rules change in one place.

import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, screenGutter, spacing } from '../../theme';

export default function Screen({
  children,
  header,
  footer,
  scroll = true,
  keyboardAware = false,
  contentStyle,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  keyboardAware?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const bottomPad = footer ? spacing.xl : insets.bottom + spacing.xxl;
  const bodyStyle = [styles.content, { paddingBottom: bottomPad }, contentStyle];

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={bodyStyle}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, bodyStyle]}>{children}</View>
  );

  const inner = (
    <>
      {header}
      {body}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>{footer}</View>
      ) : null}
    </>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {keyboardAware ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: screenGutter,
    paddingTop: spacing.xs,
  },
  footer: {
    paddingHorizontal: screenGutter,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
});
