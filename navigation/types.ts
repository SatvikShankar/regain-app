// Navigation contracts for the whole app.
//
// Single native stack, home-centric. Home is the hub (it lists programs + the
// progress widgets); every other screen is immersive and reached from Home, with
// back / Home controls in a shared header. There is no bottom bar / tab navigator.

import { DetourReason, IntakeResult } from "../types/intake";

export type RootStackParamList = {
  Home: undefined;
  RegionSelect: undefined;
  Intake: { region: string };
  Loading: { intakeResult: IntakeResult };
  // fromCheckIn: reached from the safety re-check of an existing program (the
  // program is kept), rather than from a new-program questionnaire.
  // items: the warning-sign wording the user ticked, if that's what triggered it.
  RedFlagDetour: { severity: DetourReason; items?: string[]; fromCheckIn?: boolean };
  // justCreated: first visit right after generation — shows the "Saved to your
  // programs" banner with a Redo option.
  Program: { programId: string; justCreated?: boolean };
  ExerciseDetail: { exerciseId: string; region: string };
  CheckIn: { programId: string };
};
