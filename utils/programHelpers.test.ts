import { advanceProgram } from './gating';
import { getLevelStatus, getProgramName, getUnlockedLevels, getWorkingLevel } from './programHelpers';
import { makeProgram } from './testFixtures';

describe('level derivation from events', () => {
  it('a fresh program works at its start level with lower levels open as skipped', () => {
    const p = makeProgram({ assignedStartLevel: 2 });
    expect(getWorkingLevel(p)).toBe(2);
    expect(getUnlockedLevels(p)).toEqual([1, 2]);
    expect(getLevelStatus(p, 1)).toBe('skipped');
    expect(getLevelStatus(p, 2)).toBe('unlocked');
    expect(getLevelStatus(p, 3)).toBe('locked');
  });

  it('advancing records an unlock; advancing into an already-open level records a switch', () => {
    const now = new Date('2026-10-10T00:00:00.000Z');
    const up = advanceProgram(makeProgram(), now);
    expect(up.levelEvents).toEqual([{ type: 'unlocked', level: 2, date: now.toISOString() }]);
    expect(getWorkingLevel(up)).toBe(2);

    const easedBack = { ...up, levelEvents: [...up.levelEvents, { type: 'switched' as const, level: 1, date: now.toISOString() }] };
    expect(getWorkingLevel(easedBack)).toBe(1);
    expect(advanceProgram(easedBack, now).levelEvents.at(-1)).toMatchObject({ type: 'switched', level: 2 });
  });

  it('a declined offer does not change the working level', () => {
    const p = makeProgram({ levelEvents: [{ type: 'offerDeclined', level: 2, date: '2026-10-10T00:00:00.000Z' }] });
    expect(getWorkingLevel(p)).toBe(1);
    expect(getLevelStatus(p, 2)).toBe('locked');
  });

  it('uses the custom name when set, else region name + date', () => {
    expect(getProgramName(makeProgram())).toBe('Back Recovery · 27 Sep');
    expect(getProgramName(makeProgram({ customName: '  Desk back  ' }))).toBe('Desk back');
  });
});
