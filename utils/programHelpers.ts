// Program-domain helpers: build a new program from AI output, and derive
// everything the UI shows (name, current level, unlocked levels, level status,
// looked-up exercises) from raw stored facts + the region's data. Nothing
// derived here is ever persisted.

import { Exercise } from '../types/exercise';
import { IntakeResult } from '../types/intake';
import { CURRENT_PROGRAM_SCHEMA, StoredProgram } from '../types/program';
import { GeneratedProgram } from './ai/generateProgram';
import { exercisesForLevel, getRegion, getRegionContent, getLevelNumbers as regionLevelNumbers } from './regionContent';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// A fresh program from the AI result. No level events yet: levels 1..start are
// open by virtue of the assigned start level.
export function buildProgramFromGenerated(
  region: string,
  intakeResult: IntakeResult,
  generated: GeneratedProgram
): StoredProgram {
  return {
    schemaVersion: CURRENT_PROGRAM_SCHEMA,
    id: String(Date.now()),
    region,
    intakeResult,
    assignedStartLevel: generated.assignedStartLevel,
    selectedExercises: generated.selectedExercises,
    levelEvents: [],
    sessionLog: [],
  };
}

export function formatShortDate(d: Date): string {
  return Number.isNaN(d.getTime()) ? '' : `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// The user's rename if any, else e.g. "Back Recovery · 27 Sep".
export function getProgramName(program: StoredProgram): string {
  if (program.customName?.trim()) return program.customName.trim();
  const base =
    getRegionContent(program.region)?.copy.programName ?? getRegion(program.region)?.label ?? 'Program';
  const date = formatShortDate(new Date(Number(program.id)));
  return date ? `${base} · ${date}` : base;
}

export function getLevelNumbers(program: StoredProgram): number[] {
  const content = getRegionContent(program.region);
  return content ? regionLevelNumbers(content) : [];
}

export function getLevelName(program: StoredProgram, level: number): string {
  return getRegionContent(program.region)?.levels[level]?.name ?? `Level ${level}`;
}

export function getLevelGoal(program: StoredProgram, level: number): string | undefined {
  return getRegionContent(program.region)?.levels[level]?.goal;
}

// The level the user is working on now: the latest level they moved to
// (unlocked or switched), else where they started.
export function getWorkingLevel(program: StoredProgram): number {
  let level = program.assignedStartLevel;
  for (const e of program.levelEvents) {
    if (e.type === 'unlocked' || e.type === 'switched') level = e.level;
  }
  return level;
}

// Every level the user can open: 1..start (start + the skipped ones below it),
// plus any level they've unlocked since.
export function getUnlockedLevels(program: StoredProgram): number[] {
  const open = new Set<number>();
  for (const l of getLevelNumbers(program)) if (l <= program.assignedStartLevel) open.add(l);
  for (const e of program.levelEvents) if (e.type === 'unlocked') open.add(e.level);
  return [...open].sort((a, b) => a - b);
}

export function getHighestUnlockedLevel(program: StoredProgram): number {
  return Math.max(program.assignedStartLevel, ...getUnlockedLevels(program));
}

// The user's selected exercises for a level, in pool order (stable display).
export function getSelectedExercises(program: StoredProgram, level: number): Exercise[] {
  const content = getRegionContent(program.region);
  if (!content) return [];
  const ids = program.selectedExercises[level] ?? [];
  return exercisesForLevel(content, level).filter((e) => ids.includes(e.id));
}

// skipped  = below the assigned start (shown as skipped, still available)
// unlocked = open to the user (start level and anything unlocked since)
// locked   = not yet reached (preview only)
export type LevelStatus = 'skipped' | 'unlocked' | 'locked';

export function getLevelStatus(program: StoredProgram, level: number): LevelStatus {
  if (level < program.assignedStartLevel) return 'skipped';
  if (getUnlockedLevels(program).includes(level)) return 'unlocked';
  return 'locked';
}
