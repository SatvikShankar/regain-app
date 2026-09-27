// App root: providers + navigation. Home-centric structure — no persistent
// bottom bar. Each screen is immersive; navigation happens from Home (the hub)
// and via each screen's back / Home header controls.

import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './components/ScreenContainer';
import RootNavigator from './navigation/RootNavigator';

// Paint the native root view the warm-dark plum so transitions never flash the
// default white window background at the edges.
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
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
