// Single native stack holding every screen (no bottom bar — Home is the hub).
//
// Transitions run natively (react-native-screens), so they stay smooth even when
// JS is busy. Per-screen animation reflects the screen's role:
//   default      → horizontal push (going deeper)
//   Loading/Detour → fade (a state change, not a place)
//   CheckIn      → slides up (a short task sheet over the program)
// contentStyle paints every screen plum so edges never flash white mid-transition.

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CheckInScreen from '../screens/CheckInScreen';
import ExerciseDetailScreen from '../screens/ExerciseDetailScreen';
import HomeScreen from '../screens/HomeScreen';
import IntakeScreen from '../screens/IntakeScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ProgramScreen from '../screens/ProgramScreen';
import RedFlagDetourScreen from '../screens/RedFlagDetourScreen';
import RegionSelectScreen from '../screens/RegionSelectScreen';
import { colors } from '../theme';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: 'ios_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="RegionSelect" component={RegionSelectScreen} />
      <Stack.Screen name="Intake" component={IntakeScreen} />
      <Stack.Screen name="Loading" component={LoadingScreen} options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="RedFlagDetour" component={RedFlagDetourScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Program" component={ProgramScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} options={{ animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}
