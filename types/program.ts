// Shape of a saved program (one per key `program:{region}:{id}` in AsyncStorage).
// Stores raw facts only — IDs, not exercise text; the session log, not derived
// counts. Displays (name, current level, session counts) are computed at render.
// See CLAUDE.md → Storage model.

import { ExerciseSelection } from "./exercise";
import { IntakeResult } from "./intake";

// One check-in appended per logged session. Raw answers only — gating derives
// unlock decisions from these (Step 5).
export interface SessionLogEntry {
  date: string;              // ISO timestamp of the check-in
  level: number;             // level the session was logged against
  painDuring: string;
  painAfter: string;
  readyToProgress: boolean;
}

export interface StoredProgram {
  id: string;                // generation timestamp (also the uniqueId in the key)
  region: string;
  intakeResult: IntakeResult;
  assignedStartLevel: number;    // from AI Call 1
  selectedExercises: ExerciseSelection; // from AI Call 2 — IDs only
  currentLevel: number;
  unlockedLevels: number[];      // [1..assignedStartLevel] at generation
  sessionLog: SessionLogEntry[];
}
