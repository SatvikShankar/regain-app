// Shared navigation ref so the floating bottom nav (which lives ABOVE the
// navigator, not inside it) can navigate from anywhere without a screen's
// navigation prop.

import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList) {
  if (navigationRef.isReady()) {
    // Params are optional for the routes the nav targets (Home/Programs/
    // RegionSelect), so the cast is safe here.
    navigationRef.navigate(name as never);
  }
}
