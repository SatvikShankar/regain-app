// Progression gating — pure logic, no React. Decides when a program is ready to
// unlock its next level, based on BEHAVIOUR in the session log rather than a
// speculative "are you ready?" toggle (see CLAUDE.md → Progression gating).
//
// Readiness is inferred; the app then surfaces an informed opt-in offer. This
// module only computes and mutates — the UI owns the actual "do you want to?"
// moment and never force-advances.
//
// All thresholds below are named constants — edit these to tune difficulty.

import { Difficulty, PainLevel, SessionLogEntry, StoredProgram } from '../types/program';
import { getRegionProgram } from './programRegistry';

export const MIN_SESSIONS_AT_LEVEL = 3;        // sessions logged at a level before it can advance
export const RECENT_WINDOW = 2;                // how many recent sessions the gate inspects
export const ACCEPTABLE_PAIN: PainLevel[] = ['none', 'mild'];
export const READY_DIFFICULTY: Difficulty[] = ['tooEasy'];

// Safety nudge: if the last SAFETY_WINDOW sessions are consistently painful.
export const SAFETY_WINDOW = 3;
export const HIGH_PAIN: PainLevel[] = ['moderate', 'significant'];

// The level the user is currently working = the highest unlocked level.
export function getWorkingLevel(program: StoredProgram): number {
  return program.unlockedLevels.length
    ? Math.max(...program.unlockedLevels)
    : program.assignedStartLevel;
}

// The next level that exists in the program data and isn't unlocked yet, or null
// if they're already at the top.
export function getNextLevel(program: StoredProgram): number | null {
  const rp = getRegionProgram(program.region);
  if (!rp) return null;
  const allLevels = Object.keys(rp.program)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
  const next = getWorkingLevel(program) + 1;
  return allLevels.includes(next) ? next : null;
}

// Append a check-in to the log (returns a new program object; doesn't persist).
export function appendCheckIn(
  program: StoredProgram,
  entry: SessionLogEntry
): StoredProgram {
  return { ...program, sessionLog: [...program.sessionLog, entry] };
}

// Behavioural gate: has the user earned an offer to advance to the next level?
export function isReadyToAdvance(program: StoredProgram): boolean {
  if (getNextLevel(program) === null) return false; // already at the top

  const workingLevel = getWorkingLevel(program);
  const atLevel = program.sessionLog.filter((e) => e.level === workingLevel);
  if (atLevel.length < MIN_SESSIONS_AT_LEVEL) return false;

  const recent = atLevel.slice(-RECENT_WINDOW);
  if (recent.length < RECENT_WINDOW) return false;

  const painManageable = recent.every(
    (e) => ACCEPTABLE_PAIN.includes(e.painDuring) && ACCEPTABLE_PAIN.includes(e.painAfter)
  );
  const feelsEasy = recent.every((e) => READY_DIFFICULTY.includes(e.difficulty));

  return painManageable && feelsEasy;
}

// Apply the opt-in: unlock the next level (returns a new program; doesn't persist).
export function advanceProgram(program: StoredProgram): StoredProgram {
  const next = getNextLevel(program);
  if (next === null) return program;
  return {
    ...program,
    unlockedLevels: [...program.unlockedLevels, next].sort((a, b) => a - b),
    currentLevel: next,
  };
}

// Companion safety nudge — NOT a diagnosis. True when recent sessions are
// consistently painful, suggesting the user should check with a professional.
export function shouldSuggestProfessional(program: StoredProgram): boolean {
  const recent = program.sessionLog.slice(-SAFETY_WINDOW);
  if (recent.length < SAFETY_WINDOW) return false;
  return recent.every(
    (e) => HIGH_PAIN.includes(e.painDuring) || HIGH_PAIN.includes(e.painAfter)
  );
}
