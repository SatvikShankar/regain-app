// Single native stack holding every screen. The floating bottom nav lives above
// this (see App.tsx) and persists across all of them.
//
// contentStyle sets the dark plum background on every screen's card so there's
// no white edge flash during the slide transition (Satvik flagged this). Full
// transition polish is deferred to Step 7, but this removes the obvious flash.

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../components/ScreenContainer';
import CheckInScreen from '../screens/CheckInScreen';
import ExerciseDetailScreen from '../screens/ExerciseDetailScreen';
import HomeScreen from '../screens/HomeScreen';
import IntakeScreen from '../screens/IntakeScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ProgramScreen from '../screens/ProgramScreen';
import RedFlagDetourScreen from '../screens/RedFlagDetourScreen';
import RegionSelectScreen from '../screens/RegionSelectScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="RegionSelect" component={RegionSelectScreen} />
      <Stack.Screen name="Intake" component={IntakeScreen} />
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="RedFlagDetour" component={RedFlagDetourScreen} />
      <Stack.Screen name="Program" component={ProgramScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
    </Stack.Navigator>
  );
}
