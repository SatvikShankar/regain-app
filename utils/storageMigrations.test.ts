import { migrateProgram } from './storageMigrations';
import { sampleIntake } from './testFixtures';

const v1 = {
  id: String(Date.UTC(2026, 8, 27)),
  region: 'back',
  intakeResult: sampleIntake,
  assignedStartLevel: 1,
  selectedExercises: { 1: ['catCamel'] },
  currentLevel: 2,
  unlockedLevels: [1, 2],
  sessionLog: [
    { date: '2026-10-01T10:00:00.000Z', level: 1, painDuring: 'none', painAfter: 'none', difficulty: 'tooEasy' },
    { date: '2026-10-05T10:00:00.000Z', level: 2, painDuring: 'mild', painAfter: 'none', difficulty: 'aboutRight' },
  ],
};

describe('migrateProgram', () => {
  it('upgrades a v1 record: unlocked levels above the start become dated events', () => {
    const p = migrateProgram(v1)!;
    expect(p.schemaVersion).toBe(2);
    expect(p.levelEvents).toEqual([{ type: 'unlocked', level: 2, date: '2026-10-05T10:00:00.000Z' }]);
    expect(p).not.toHaveProperty('unlockedLevels');
    expect(p).not.toHaveProperty('currentLevel');
    expect(p.sessionLog).toHaveLength(2);
  });

  it('dates an unlock with no sessions by the program creation time', () => {
    const p = migrateProgram({ ...v1, sessionLog: [] })!;
    expect(p.levelEvents[0].date).toBe(new Date(Number(v1.id)).toISOString());
  });

  it('leaves a current record unchanged', () => {
    const current = migrateProgram(v1)!;
    expect(migrateProgram(current)).toEqual(current);
  });

  it('rejects garbage', () => {
    expect(migrateProgram(null)).toBeNull();
    expect(migrateProgram({ schemaVersion: 2 })).toBeNull();
  });
});
