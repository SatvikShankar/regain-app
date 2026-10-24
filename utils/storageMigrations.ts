// Upgrades older stored shapes to the current one, at read time. Pure functions,
// no storage access. Each step takes version N → N+1, so any old record walks
// forward one step at a time. When types/program.ts changes shape: bump
// CURRENT_PROGRAM_SCHEMA and add the next step here.

import { CURRENT_PROGRAM_SCHEMA, LevelEvent, StoredProgram } from '../types/program';

type AnyRecord = Record<string, any>;

// v1 (pre-versioning) stored `unlockedLevels` + `currentLevel`. v2 stores level
// changes as events. Each level unlocked above the start becomes an 'unlocked'
// event, dated by its first logged session (best available fact), else by the
// program's creation time.
function v1ToV2(old: AnyRecord): AnyRecord {
  const start: number = old.assignedStartLevel ?? 1;
  const log: AnyRecord[] = Array.isArray(old.sessionLog) ? old.sessionLog : [];
  const created = new Date(Number(old.id));
  const fallbackDate = Number.isNaN(created.getTime()) ? new Date(0).toISOString() : created.toISOString();

  const unlocked: number[] = Array.isArray(old.unlockedLevels) ? old.unlockedLevels : [];
  const levelEvents: LevelEvent[] = unlocked
    .filter((l) => l > start)
    .sort((a, b) => a - b)
    .map((level) => ({
      type: 'unlocked' as const,
      level,
      date: log.find((e) => e.level === level)?.date ?? fallbackDate,
    }));

  const { unlockedLevels, currentLevel, ...rest } = old;
  return { ...rest, schemaVersion: 2, levelEvents, sessionLog: log };
}

const steps: { [fromVersion: number]: (r: AnyRecord) => AnyRecord } = {
  1: v1ToV2,
};

// Returns the record upgraded to CURRENT_PROGRAM_SCHEMA, or null if it can't be.
export function migrateProgram(raw: unknown): StoredProgram | null {
  if (!raw || typeof raw !== 'object') return null;
  let record = raw as AnyRecord;
  let version: number = typeof record.schemaVersion === 'number' ? record.schemaVersion : 1;
  while (version < CURRENT_PROGRAM_SCHEMA) {
    const step = steps[version];
    if (!step) return null;
    record = step(record);
    version = record.schemaVersion;
  }
  if (!record.id || !record.region) return null;
  return record as StoredProgram;
}
