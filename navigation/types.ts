// Navigation contracts for the whole app.
//
// Single native stack, home-centric. Home is the hub (it lists programs + the
// progress widgets); every other screen is immersive and reached from Home, with
// back / Home controls in a shared header. There is no bottom bar / tab navigator.

import { IntakeResult } from "../types/intake";
import { StoredProgram } from "../types/program";

export type RootStackParamList = {
  Home: undefined;
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
