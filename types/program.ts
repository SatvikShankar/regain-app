// Shape of a saved program (one per AsyncStorage key `program:{region}:{id}`).
// Stores raw facts only — IDs not exercise text, events not derived state. The
// current level, unlocked levels, counts and names are all computed at render
// (utils/programHelpers.ts). Older stored shapes are upgraded on read
// (utils/storageMigrations.ts); bump CURRENT_PROGRAM_SCHEMA when this changes.

import { ExerciseSelection } from './exercise';
import { IntakeResult } from './intake';

export const CURRENT_PROGRAM_SCHEMA = 2;

export type PainLevel = 'none' | 'mild' | 'moderate' | 'significant';
export type Difficulty = 'tooEasy' | 'aboutRight' | 'tooHard';

// One check-in per logged session. Gating INFERS readiness from these.
export interface SessionLogEntry {
  date: string;              // ISO timestamp of the check-in
  level: number;             // level the session was logged against
  painDuring: PainLevel;
  painAfter: PainLevel;
  difficulty: Difficulty;
  gentle?: boolean;          // a "gentle day" session: tracked, never counts toward unlocking
}

// Something the user did that changes where they are in the program.
//   unlocked        — accepted an offer to move up (unlocks AND moves to `level`)
//   switched        — moved to an already-unlocked `level` (e.g. accepted "ease off")
//   offerDeclined   — said "not yet" to moving up to `level`
//   easeOffDeclined — said "no thanks" to easing back to `level`
//   safetyCheck     — re-answered the warning-sign check (`level` = level at the time)
export type LevelEventType =
  | 'unlocked'
  | 'switched'
  | 'offerDeclined'
  | 'easeOffDeclined'
  | 'safetyCheck';

export interface LevelEvent {
  type: LevelEventType;
  level: number;
  date: string;              // ISO timestamp
}

export interface StoredProgram {
  schemaVersion: number;     // CURRENT_PROGRAM_SCHEMA when written
  id: string;                // generation timestamp (also the uniqueId in the key)
  region: string;
  customName?: string;       // set by Rename; otherwise the name is derived
  intakeResult: IntakeResult;
  assignedStartLevel: number;          // from AI Call 1
  selectedExercises: ExerciseSelection; // from AI Call 2 — IDs only
  levelEvents: LevelEvent[];
  sessionLog: SessionLogEntry[];
}

// The user's profile — one per device (key `profile`).
export const CURRENT_PROFILE_SCHEMA = 1;

export interface Profile {
  schemaVersion: number;
  name?: string;             // first name, optional (skippable)
  onboardedAt?: string;      // ISO; set when the welcome step is done or skipped
}
