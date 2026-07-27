// Program-domain helpers: build a stored program from AI output, and derive
// everything the UI shows (name, level names, level status, looked-up exercises)
// from raw stored facts + the region's data file. Nothing derived is persisted.

import { Exercise } from '../types/exercise';
import { IntakeResult } from '../types/intake';
import { StoredProgram } from '../types/program';
import { GeneratedProgram } from './aiAgentCalls';
import { getRegionProgram } from './programRegistry';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Assemble a fresh, unsaved program from the AI result. unlockedLevels is
// [1..assignedStartLevel] at generation (CLAUDE.md).
export function buildProgramFromGenerated(
  region: string,
  intakeResult: IntakeResult,
  generated: GeneratedProgram
): StoredProgram {
  const unlockedLevels: number[] = [];
  for (let l = 1; l <= generated.assignedStartLevel; l++) unlockedLevels.push(l);
  return {
    id: String(Date.now()),
    region,
    intakeResult,
    assignedStartLevel: generated.assignedStartLevel,
    selectedExercises: generated.selectedExercises,
    currentLevel: generated.assignedStartLevel,
    unlockedLevels,
    sessionLog: [],
  };
}

// e.g. "Back Recovery · 27 Jun" — derived from region + generation timestamp.
export function getProgramName(program: StoredProgram): string {
  const region = program.region.charAt(0).toUpperCase() + program.region.slice(1);
  const d = new Date(Number(program.id));
  const date = Number.isNaN(d.getTime()) ? '' : ` · ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  return `${region} Recovery${date}`;
}

export function getLevelNumbers(program: StoredProgram): number[] {
  const rp = getRegionProgram(program.region);
  if (!rp) return [];
  return Object.keys(rp.program)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
}

export function getLevelName(program: StoredProgram, level: number): string {
  const rp = getRegionProgram(program.region);
  return rp?.levelInfo[level]?.name ?? `Level ${level}`;
}

export function getMaxUnlockedLevel(program: StoredProgram): number {
  return program.unlockedLevels.length
    ? Math.max(...program.unlockedLevels)
    : program.assignedStartLevel;
}

// The user's selected exercises for a level, looked up from the region data and
// returned in pool order (stable display).
export function getSelectedExercises(program: StoredProgram, level: number): Exercise[] {
  const rp = getRegionProgram(program.region);
  if (!rp) return [];
  const ids = program.selectedExercises[level] ?? [];
  return (rp.program[level] ?? []).filter((e) => ids.includes(e.id));
}

export function findExercise(region: string, exerciseId: string): Exercise | undefined {
  const rp = getRegionProgram(region);
  if (!rp) return undefined;
  for (const level of Object.keys(rp.program)) {
    const found = rp.program[Number(level)].find((e) => e.id === exerciseId);
    if (found) return found;
  }
  return undefined;
}

// skipped  = below the assigned start (shown as completed/skipped, still available)
// unlocked = within the currently-reachable range
// locked   = beyond what's unlocked (preview only)
export type LevelStatus = 'skipped' | 'unlocked' | 'locked';

export function getLevelStatus(program: StoredProgram, level: number): LevelStatus {
  const maxUnlocked = getMaxUnlockedLevel(program);
  if (level < program.assignedStartLevel) return 'skipped';
  if (level <= maxUnlocked) return 'unlocked';
  return 'locked';
}
