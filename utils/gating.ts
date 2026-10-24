// Progression gating — pure logic, no React. Decides what to offer after each
// check-in, based on BEHAVIOUR in the session log rather than a speculative
// "are you ready?" toggle (see CLAUDE.md → Progression gating). Every offer is
// an informed opt-in: this module never moves anyone on its own.
//
// After a check-in the app asks, in this order:
//   1. needsSafetyRecheck  — two "significant" pain logs in a row → re-ask the warning signs
//   2. isReadyToAdvance    — offer the next level
//   3. shouldOfferEaseOff  — struggling at this level → offer the level below
//   4. shouldSuggestProfessional — the gentle "consider seeing someone" nudge
//
// Gentle-day sessions (gentle: true) never count toward OR against moving levels,
// but they do count for the pain-based safety checks — pain is pain.
//
// All thresholds below are named constants — edit these to tune.

import { Difficulty, LevelEvent, PainLevel, SessionLogEntry, StoredProgram } from '../types/program';
import { getLevelNumbers, getUnlockedLevels, getWorkingLevel } from './programHelpers';

// ---- Moving up ----
export const MIN_SESSIONS_AT_LEVEL = 4;        // sessions logged at a level before it can be outgrown
export const RECENT_WINDOW = 3;                // how many recent sessions the gate inspects
export const BLOCKING_PAIN: PainLevel[] = ['significant'];   // none allowed in the window
export const CAUTION_PAIN: PainLevel = 'moderate';           // at most MAX_CAUTION_IN_WINDOW, never the latest
export const MAX_CAUTION_IN_WINDOW = 1;
export const COMFORTABLE_PAIN: PainLevel[] = ['none', 'mild'];
export const MIN_TOO_EASY_IN_WINDOW = 2;       // "outgrown it": at least this many "too easy"…
export const STEADY_DIFFICULTY: Difficulty[] = ['tooEasy', 'aboutRight']; // …or all of these with comfortable pain
export const SESSIONS_AFTER_DECLINE = 2;       // after "not yet", wait this many sessions before asking again

// ---- Easing off ----
export const EASE_OFF_WINDOW = 3;
export const EASE_OFF_MIN_STRUGGLES = 2;       // "too hard" or moderate+ pain in this many of the window
export const SESSIONS_AFTER_EASE_OFF_DECLINE = 2;

// ---- Safety ----
export const SAFETY_RECHECK_STREAK = 2;        // consecutive "significant" pain logs → re-ask warning signs
export const SAFETY_WINDOW = 3;                // nudge: this many recent sessions all at HIGH_PAIN
export const HIGH_PAIN: PainLevel[] = ['moderate', 'significant'];

const PAIN_ORDER: PainLevel[] = ['none', 'mild', 'moderate', 'significant'];

export { getWorkingLevel };

// The worse of pain during and pain right after.
export function worstPain(entry: SessionLogEntry): PainLevel {
  return PAIN_ORDER[Math.max(PAIN_ORDER.indexOf(entry.painDuring), PAIN_ORDER.indexOf(entry.painAfter))];
}

// Sessions that count for moving levels: at this level, not gentle, and logged
// since the user last ARRIVED at it (so after 2 → 1 → 2, old Level 2 sessions
// don't decide anything about the fresh stint).
function progressionSessions(program: StoredProgram, level: number): SessionLogEntry[] {
  const arrival = [...program.levelEvents]
    .reverse()
    .find((e) => (e.type === 'unlocked' || e.type === 'switched') && e.level === level);
  const since = arrival ? new Date(arrival.date).getTime() : -Infinity;
  return program.sessionLog.filter(
    (e) => e.level === level && !e.gentle && new Date(e.date).getTime() > since
  );
}

function lastEvent(program: StoredProgram, type: LevelEvent['type'], level: number): LevelEvent | undefined {
  return [...program.levelEvents].reverse().find((e) => e.type === type && e.level === level);
}

// Sessions logged after a given moment.
function countAfter(sessions: SessionLogEntry[], isoDate: string): number {
  const t = new Date(isoDate).getTime();
  return sessions.filter((e) => new Date(e.date).getTime() > t).length;
}

// The level above the working one, if the region has it; else null (at the top).
export function getNextLevel(program: StoredProgram): number | null {
  const next = getWorkingLevel(program) + 1;
  return getLevelNumbers(program).includes(next) ? next : null;
}

// The level below the working one, if there is one; else null (at the bottom).
export function getPreviousLevel(program: StoredProgram): number | null {
  const prev = getWorkingLevel(program) - 1;
  return getLevelNumbers(program).includes(prev) ? prev : null;
}

// ---- 1. Safety re-check ----
// True when the last SAFETY_RECHECK_STREAK sessions all report significant pain
// (during or after), and they all came after the last time the check was done —
// so it's asked once per new streak, not after every painful session.
export function needsSafetyRecheck(program: StoredProgram): boolean {
  const recent = program.sessionLog.slice(-SAFETY_RECHECK_STREAK);
  if (recent.length < SAFETY_RECHECK_STREAK) return false;
  if (!recent.every((e) => worstPain(e) === 'significant')) return false;
  const lastCheck = [...program.levelEvents].reverse().find((e) => e.type === 'safetyCheck');
  if (!lastCheck) return true;
  return countAfter(recent, lastCheck.date) === recent.length;
}

// ---- 2. Moving up ----
export function isReadyToAdvance(program: StoredProgram): boolean {
  const next = getNextLevel(program);
  if (next === null) return false;

  const level = getWorkingLevel(program);
  const sessions = progressionSessions(program, level);
  if (sessions.length < MIN_SESSIONS_AT_LEVEL) return false;

  // A recent "not yet" for this level waits for more sessions.
  const declined = lastEvent(program, 'offerDeclined', next);
  if (declined && countAfter(sessions, declined.date) < SESSIONS_AFTER_DECLINE) return false;

  const recent = sessions.slice(-RECENT_WINDOW);
  const pains = recent.map(worstPain);
  if (pains.some((p) => BLOCKING_PAIN.includes(p))) return false;
  if (pains.filter((p) => p === CAUTION_PAIN).length > MAX_CAUTION_IN_WINDOW) return false;
  if (!COMFORTABLE_PAIN.includes(pains[pains.length - 1])) return false; // latest must be comfortable

  const tooEasy = recent.filter((e) => e.difficulty === 'tooEasy').length;
  const outgrown = tooEasy >= MIN_TOO_EASY_IN_WINDOW;
  const steady =
    recent.every((e) => STEADY_DIFFICULTY.includes(e.difficulty)) &&
    pains.every((p) => COMFORTABLE_PAIN.includes(p));
  return outgrown || steady;
}

// ---- 3. Easing off ----
// Struggling = "too hard", or moderate-or-worse pain. Offered only when there's
// a level below to go back to, and not straight after a "no thanks".
export function shouldOfferEaseOff(program: StoredProgram): boolean {
  const previous = getPreviousLevel(program);
  if (previous === null) return false;

  const sessions = progressionSessions(program, getWorkingLevel(program));
  const declined = lastEvent(program, 'easeOffDeclined', previous);
  if (declined && countAfter(sessions, declined.date) < SESSIONS_AFTER_EASE_OFF_DECLINE) return false;

  const recent = sessions.slice(-EASE_OFF_WINDOW);
  if (recent.length < EASE_OFF_WINDOW) return false;
  const struggles = recent.filter(
    (e) => e.difficulty === 'tooHard' || HIGH_PAIN.includes(worstPain(e))
  ).length;
  return struggles >= EASE_OFF_MIN_STRUGGLES;
}

// ---- 4. Safety nudge ----
// Companion nudge, NOT a diagnosis: recent sessions are consistently painful.
export function shouldSuggestProfessional(program: StoredProgram): boolean {
  const recent = program.sessionLog.slice(-SAFETY_WINDOW);
  if (recent.length < SAFETY_WINDOW) return false;
  return recent.every((e) => HIGH_PAIN.includes(worstPain(e)));
}

// ---- Applying the user's choices (pure: return a new program, never persist) ----

export function appendCheckIn(program: StoredProgram, entry: SessionLogEntry): StoredProgram {
  return { ...program, sessionLog: [...program.sessionLog, entry] };
}

function withEvent(program: StoredProgram, event: LevelEvent): StoredProgram {
  return { ...program, levelEvents: [...program.levelEvents, event] };
}

// Accept "move up": 'unlocked' the first time, 'switched' if that level was
// already open (e.g. returning after easing off).
export function advanceProgram(program: StoredProgram, now: Date = new Date()): StoredProgram {
  const next = getNextLevel(program);
  if (next === null) return program;
  const type = getUnlockedLevels(program).includes(next) ? 'switched' : 'unlocked';
  return withEvent(program, { type, level: next, date: now.toISOString() });
}

export function declineAdvance(program: StoredProgram, now: Date = new Date()): StoredProgram {
  const next = getNextLevel(program);
  if (next === null) return program;
  return withEvent(program, { type: 'offerDeclined', level: next, date: now.toISOString() });
}

// Accept "ease off": move back to the level below (it stays unlocked).
export function easeOffProgram(program: StoredProgram, now: Date = new Date()): StoredProgram {
  const previous = getPreviousLevel(program);
  if (previous === null) return program;
  return withEvent(program, { type: 'switched', level: previous, date: now.toISOString() });
}

export function declineEaseOff(program: StoredProgram, now: Date = new Date()): StoredProgram {
  const previous = getPreviousLevel(program);
  if (previous === null) return program;
  return withEvent(program, { type: 'easeOffDeclined', level: previous, date: now.toISOString() });
}

// Record that the warning-sign re-check was answered (whatever the answer).
export function recordSafetyCheck(program: StoredProgram, now: Date = new Date()): StoredProgram {
  return withEvent(program, { type: 'safetyCheck', level: getWorkingLevel(program), date: now.toISOString() });
}
