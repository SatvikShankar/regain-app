// Shell for every screen: background + glow, safe-area handling (the app draws
// edge-to-edge), optional header, scrolling body, and an optional footer pinned
// to the bottom (e.g. a Continue button). Screens compose this instead of each
// re-implementing insets/padding, so layout rules change in one place.
//
// keyboardAware: the app draws edge-to-edge, so on Android the window no longer
// shrinks for the keyboard. We (1) pad the screen by the keyboard's height on
// both platforms, which lifts the footer above it, and (2) when the keyboard
// opens, scroll the focused field into view if the keyboard or footer would
// cover it. (With a development build this can move to
// react-native-keyboard-controller; Expo Go doesn't include it.)

import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Glow, screenGutter, spacing } from '../../theme';
import ScreenBackground from './ScreenBackground';

export default function Screen({
  children,
  header,
  footer,
  scroll = true,
  keyboardAware = false,
  glow = 'plum',
  contentStyle,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  keyboardAware?: boolean;
  glow?: Glow | 'none';
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const footerHeight = useRef(0);
  const [keyboardUp, setKeyboardUp] = useState(false);

  useEffect(() => {
    if (!keyboardAware) return;
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardUp(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardUp(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, [keyboardAware]);

  // Bring the focused input into view once the keyboard is up.
  useEffect(() => {
    if (!keyboardAware || !scroll) return;
    const sub = Keyboard.addListener('keyboardDidShow', (e) => {
      const input = TextInput.State.currentlyFocusedInput() as unknown as View | null;
      if (!input?.measureInWindow) return;
      // Let the layout settle (the screen just shrank) before measuring.
      setTimeout(() => {
        input.measureInWindow((_x, y, _w, h) => {
          const visibleBottom = e.endCoordinates.screenY - footerHeight.current - spacing.md;
          const overflow = y + h - visibleBottom;
          if (overflow > 0) {
            scrollRef.current?.scrollTo({ y: scrollY.current + overflow, animated: true });
          }
        });
      }, 60);
    });
    return () => sub.remove();
  }, [keyboardAware, scroll]);
  const bottomPad = footer ? spacing.xl : insets.bottom + spacing.xxl;
  const bodyStyle = [styles.content, { paddingBottom: bottomPad }, contentStyle];

  const body = scroll ? (
    <ScrollView
      ref={scrollRef}
      onScroll={(ev) => (scrollY.current = ev.nativeEvent.contentOffset.y)}
      scrollEventThrottle={32}
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
        <View
          style={[styles.footer, { paddingBottom: (keyboardUp ? 0 : insets.bottom) + spacing.md }]}
          onLayout={(ev) => (footerHeight.current = ev.nativeEvent.layout.height)}
        >
          {footer}
        </View>
      ) : null}
    </>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenBackground glow={glow} />
      {keyboardAware ? (
        <KeyboardAvoidingView style={styles.flex} behavior="padding">
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
    gap: spacing.xxs,
  },
});
