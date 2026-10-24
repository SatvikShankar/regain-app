// Shared builders for unit tests (not used by the app).

import { IntakeResult } from '../types/intake';
import { CURRENT_PROGRAM_SCHEMA, SessionLogEntry, StoredProgram } from '../types/program';

export const sampleIntake: IntakeResult = {
  region: 'back',
  branch: 'diagnosed',
  redFlagged: false,
  responses: [
    { questionId: 'diagnosisStatus', selectedOption: 'diagnosed', freeText: null },
    { questionId: 'diagnosisDetail', selectedOption: null, freeText: 'L4-L5 disc bulge' },
    { questionId: 'painLocationDiagnosed', selectedOption: 'lowerBack', freeText: 'worse, after sitting' },
  ],
};

export function makeProgram(overrides: Partial<StoredProgram> = {}): StoredProgram {
  return {
    schemaVersion: CURRENT_PROGRAM_SCHEMA,
    id: String(Date.UTC(2026, 8, 27)),
    region: 'back',
    intakeResult: sampleIntake,
    assignedStartLevel: 1,
    selectedExercises: { 1: ['catCamel'], 2: ['gluteBridge'], 3: ['plank'] },
    levelEvents: [],
    sessionLog: [],
    ...overrides,
  };
}

export function makeEntry(overrides: Partial<SessionLogEntry> = {}): SessionLogEntry {
  return {
    date: '2026-10-01T10:00:00.000Z',
    level: 1,
    painDuring: 'none',
    painAfter: 'none',
    difficulty: 'tooEasy',
    ...overrides,
  };
}
