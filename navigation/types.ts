// Navigation contracts for the whole app.
//
// Single native stack. Home and Programs are ordinary stack routes (not a nested
// tab navigator) because the bottom nav is a floating overlay rendered ABOVE the
// navigator — it persists on every screen and drives navigation itself. The
// linear journey (region select → intake → loading → program, plus the red-flag
// detour and detail/check-in screens) lives in the same stack.

import { IntakeResult } from "../types/intake";
import { StoredProgram } from "../types/program";

export type RootStackParamList = {
  Home: undefined;
  Programs: undefined;
  RegionSelect: undefined;
  Intake: { region: string };
  Loading: { intakeResult?: IntakeResult };
  RedFlagDetour: { severity?: "standard" | "urgent" };
  // Two ways to open the Program screen:
  //   - previewProgram: a freshly generated, NOT-yet-saved program (post-intake)
  //   - programId:      an already-saved program, loaded from storage
  Program: { programId?: string; previewProgram?: StoredProgram };
  ExerciseDetail: { exerciseId?: string; region?: string };
  CheckIn: { programId?: string };
};

// The routes the bottom nav treats as primary destinations (for active state).
export type NavRouteName = "Home" | "Programs";
