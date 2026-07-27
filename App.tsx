// App root: providers, navigation container, and the persistent floating nav.
// The BottomNav is a sibling of the navigator (not inside it) so it floats above
// every screen. We track the active route name to highlight the right nav item.

import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNav from './components/BottomNav';
import { colors } from './components/ScreenContainer';
import RootNavigator from './navigation/RootNavigator';
import { navigationRef } from './navigation/navigationRef';

// Paint the native root view the warm-dark plum so screen transitions never
// flash the default white window background at the edges (Satvik's report).
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
  const [routeName, setRouteName] = useState<string | undefined>();

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        theme={navTheme}
        onReady={() => setRouteName(navigationRef.getCurrentRoute()?.name)}
        onStateChange={() => setRouteName(navigationRef.getCurrentRoute()?.name)}
      >
        <StatusBar style="light" />
        <RootNavigator />
        <BottomNav currentRoute={routeName} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
