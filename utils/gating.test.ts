import {
  advanceProgram,
  declineAdvance,
  declineEaseOff,
  easeOffProgram,
  isReadyToAdvance,
  needsSafetyRecheck,
  recordSafetyCheck,
  shouldOfferEaseOff,
  shouldSuggestProfessional,
} from './gating';
import { getWorkingLevel } from './programHelpers';
import { makeEntry, makeProgram } from './testFixtures';
import { SessionLogEntry, StoredProgram } from '../types/program';

// Sessions on consecutive days from 1 Oct, in order.
let day = 0;
function s(overrides: Partial<SessionLogEntry> = {}): SessionLogEntry {
  day += 1;
  return makeEntry({ date: new Date(Date.UTC(2026, 9, day, 10)).toISOString(), ...overrides });
}
const at = (d: number) => new Date(Date.UTC(2026, 9, d, 12));
function withLog(entries: SessionLogEntry[], base: Partial<StoredProgram> = {}): StoredProgram {
  return makeProgram({ ...base, sessionLog: entries });
}
beforeEach(() => (day = 0));

const easy = { difficulty: 'tooEasy' as const };
const right = { difficulty: 'aboutRight' as const };
const hard = { difficulty: 'tooHard' as const };

describe('isReadyToAdvance', () => {
  it('needs at least 4 sessions at the level', () => {
    expect(isReadyToAdvance(withLog([s(easy), s(easy), s(easy)]))).toBe(false);
    expect(isReadyToAdvance(withLog([s(easy), s(easy), s(easy), s(easy)]))).toBe(true);
  });

  it('accepts 2 of the last 3 "too easy"', () => {
    expect(isReadyToAdvance(withLog([s(right), s(right), s(easy), s(easy)]))).toBe(true);
    expect(isReadyToAdvance(withLog([s(easy), s(easy), s(right), s(easy)]))).toBe(true);
  });

  it('accepts 3 "about right" with only mild-or-no pain', () => {
    expect(isReadyToAdvance(withLog([s(right), s(right), s({ ...right, painAfter: 'mild' }), s(right)]))).toBe(true);
  });

  it('rejects "about right" if any recent session had moderate pain (no "too easy" majority)', () => {
    expect(isReadyToAdvance(withLog([s(right), s({ ...right, painDuring: 'moderate' }), s(right), s(right)]))).toBe(false);
  });

  it('allows one moderate in the window, but never as the latest session', () => {
    const okEarlier = withLog([s(easy), s({ ...easy, painAfter: 'moderate' }), s(easy), s(easy)]);
    expect(isReadyToAdvance(okEarlier)).toBe(true);
    const latestModerate = withLog([s(easy), s(easy), s(easy), s({ ...easy, painAfter: 'moderate' })]);
    expect(isReadyToAdvance(latestModerate)).toBe(false);
    const twoModerate = withLog([s(easy), s({ ...easy, painDuring: 'moderate' }), s({ ...easy, painAfter: 'moderate' }), s(easy)]);
    expect(isReadyToAdvance(twoModerate)).toBe(false);
  });

  it('rejects any significant pain in the window', () => {
    expect(isReadyToAdvance(withLog([s(easy), s(easy), s({ ...easy, painDuring: 'significant' }), s(easy)]))).toBe(false);
  });

  it('ignores gentle sessions entirely', () => {
    const p = withLog([s(easy), s(easy), s(easy), s({ ...hard, painAfter: 'moderate', gentle: true }), s(easy)]);
    expect(isReadyToAdvance(p)).toBe(true);
    expect(isReadyToAdvance(withLog([s(easy), s(easy), s(easy), s({ ...easy, gentle: true })]))).toBe(false);
  });

  it('never offers past the top level', () => {
    const p = withLog([s({ ...easy, level: 3 }), s({ ...easy, level: 3 }), s({ ...easy, level: 3 }), s({ ...easy, level: 3 })], {
      assignedStartLevel: 3,
    });
    expect(isReadyToAdvance(p)).toBe(false);
  });

  it('after "not yet", waits 2 more sessions before asking again', () => {
    const ready = withLog([s(easy), s(easy), s(easy), s(easy)]);
    let p = declineAdvance(ready, at(day));
    expect(isReadyToAdvance(p)).toBe(false);
    p = { ...p, sessionLog: [...p.sessionLog, s(easy)] };
    expect(isReadyToAdvance(p)).toBe(false);
    p = { ...p, sessionLog: [...p.sessionLog, s(easy)] };
    expect(isReadyToAdvance(p)).toBe(true);
  });
});

describe('ease off', () => {
  it('is offered when 2 of the last 3 sessions are a struggle, only with a level below', () => {
    const at2 = (e: Partial<SessionLogEntry>) => s({ level: 2, ...e });
    const p = withLog([at2(right), at2(hard), at2({ ...right, painAfter: 'moderate' })], { assignedStartLevel: 2 });
    expect(shouldOfferEaseOff(p)).toBe(true);
    expect(shouldOfferEaseOff(withLog([s(hard), s(hard), s(hard)]))).toBe(false); // already at Level 1
  });

  it('accepting moves back a level (still unlocked); advancing later records a switch, not a new unlock', () => {
    const p = withLog([s({ level: 2, ...hard }), s({ level: 2, ...hard }), s({ level: 2, ...hard })], { assignedStartLevel: 2 });
    const eased = easeOffProgram(p, at(day));
    expect(getWorkingLevel(eased)).toBe(1);
    const back = advanceProgram(eased, at(day + 1));
    expect(back.levelEvents.at(-1)).toMatchObject({ type: 'switched', level: 2 });
  });

  it('old sessions from a previous stint at a level do not count after returning to it', () => {
    let p = withLog([s({ level: 2, ...hard }), s({ level: 2, ...hard }), s({ level: 2, ...hard })], { assignedStartLevel: 2 });
    p = easeOffProgram(p, at(day));
    p = advanceProgram(p, at(day + 1));
    expect(shouldOfferEaseOff(p)).toBe(false);
  });

  it('after "no thanks", waits 2 more sessions', () => {
    const at2 = (e: Partial<SessionLogEntry>) => s({ level: 2, ...e });
    let p = withLog([at2(hard), at2(hard), at2(hard)], { assignedStartLevel: 2 });
    p = declineEaseOff(p, at(day));
    p = { ...p, sessionLog: [...p.sessionLog, at2(hard)] };
    expect(shouldOfferEaseOff(p)).toBe(false);
    p = { ...p, sessionLog: [...p.sessionLog, at2(hard)] };
    expect(shouldOfferEaseOff(p)).toBe(true);
  });
});

describe('safety', () => {
  const sig = { painAfter: 'significant' as const };

  it('re-checks after 2 consecutive significant-pain sessions, once per new streak', () => {
    expect(needsSafetyRecheck(withLog([s(sig)]))).toBe(false);
    let p = withLog([s(), s(sig), s(sig)]);
    expect(needsSafetyRecheck(p)).toBe(true);
    p = recordSafetyCheck(p, at(day));
    p = { ...p, sessionLog: [...p.sessionLog, s(sig)] };
    expect(needsSafetyRecheck(p)).toBe(false); // only 1 new since the check
    p = { ...p, sessionLog: [...p.sessionLog, s(sig)] };
    expect(needsSafetyRecheck(p)).toBe(true);
  });

  it('counts gentle sessions for safety (pain is pain)', () => {
    expect(needsSafetyRecheck(withLog([s({ ...sig, gentle: true }), s(sig)]))).toBe(true);
  });

  it('nudges after 3 sessions in a row at moderate-or-worse pain', () => {
    const mod = { painDuring: 'moderate' as const };
    expect(shouldSuggestProfessional(withLog([s(mod), s(mod)]))).toBe(false);
    expect(shouldSuggestProfessional(withLog([s(mod), s(mod), s(sig)]))).toBe(true);
    expect(shouldSuggestProfessional(withLog([s(mod), s(), s(mod)]))).toBe(false);
  });
});
