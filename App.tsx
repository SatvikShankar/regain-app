// App root: providers + navigation. Home-centric structure — no persistent
// bottom bar. Each screen is immersive; navigation happens from Home (the hub)
// and via each screen's back / Home header controls.
//
// Startup: the native splash stays up until fonts are loaded, so the first frame
// is already in the right typeface (no flash of fallback text). If fonts fail to
// load we still start — system font is an acceptable fallback, blocking is not.

import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './navigation/RootNavigator';
import { useProgramStore } from './state/programStore';
import { colors, fontAssets, fonts } from './theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Paint the native root view plum so transitions never flash the default white
// window background at the edges.
SystemUI.setBackgroundColorAsync(colors.background);

const navTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    primary: colors.accent,
    border: colors.border,
  },
  fonts: {
    regular: { fontFamily: fonts.regular, fontWeight: '400' },
    medium: { fontFamily: fonts.semibold, fontWeight: '600' },
    bold: { fontFamily: fonts.bold, fontWeight: '700' },
    heavy: { fontFamily: fonts.extrabold, fontWeight: '800' },
  },
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const programsLoaded = useProgramStore((s) => s.loaded);
  const ready = (fontsLoaded || !!fontError) && programsLoaded;

  // Read stored programs once, behind the splash screen, so Home's first frame
  // already shows real data.
  useEffect(() => {
    useProgramStore.getState().load();
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
