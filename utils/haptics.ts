// Haptic feedback, behind one wrapper so the library (expo-haptics) or the
// policy (e.g. a future "reduce haptics" setting) can change in one place.
// Failures are swallowed — haptics are a nicety, never a blocker.

import * as Haptics from 'expo-haptics';

export function selectionHaptic() {
  Haptics.selectionAsync().catch(() => {});
}

export function tapHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function successHaptic() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
