// AUDIT of every region's questionnaire. These tests walk EVERY possible answer
// path, so a content edit that breaks a safety rule fails here, not in front of
// a user. Rules enforced:
//   1. every route/target points at a real question (or COMPLETE / RED_FLAG_DETOUR)
//   2. every question is reachable from the start
//   3. EVERY path that ends in a program passes the warning-sign checklist
//   4. every warning-sign item routes to the doctor screen with a reason
// plus Back-specific checks for each documented way to the doctor screen.

import { getRegions } from './regionContent';
import { IntakeQuestion } from '../types/intake';
import {
  AnswerMap,
  COMPLETE,
  RED_FLAG_DETOUR,
  SelectedOption,
  detectDetour,
  estimateTotalQuestions,
  getNextQuestionId,
} from './intakeEngine';

type Outcome = { path: string[]; end: 'COMPLETE' | 'DETOUR'; answers: AnswerMap };

// Every answer worth trying for a question: each option alone (multi-select
// included — one ticked item is enough to test routing), or no option for
// free-text-only questions.
function choicesFor(q: IntakeQuestion): SelectedOption[] {
  if (q.type === 'freeTextOnly') return [null];
  const ids = (q.options ?? []).map((o) => o.id);
  return q.type === 'multiSelect' ? ids.map((id) => [id]) : ids;
}

function walkAll(questions: IntakeQuestion[], startId: string): Outcome[] {
  const out: Outcome[] = [];
  const visit = (id: string, answers: AnswerMap, path: string[]) => {
    if (path.length > questions.length) throw new Error(`cycle via ${path.join(' → ')}`);
    const q = questions.find((x) => x.id === id)!;
    for (const choice of choicesFor(q)) {
      const next = getNextQuestionId(q, choice, answers);
      const nextAnswers = { ...answers, [id]: choice };
      if (next === COMPLETE) out.push({ path: [...path, id], end: 'COMPLETE', answers: nextAnswers });
      else if (next === RED_FLAG_DETOUR) out.push({ path: [...path, id], end: 'DETOUR', answers: nextAnswers });
      else visit(next, nextAnswers, [...path, id]);
    }
  };
  visit(startId, {}, []);
  return out;
}

for (const region of getRegions().filter((r) => r.content)) {
  const { questions, startQuestionId, safetyCheckQuestionId } = region.content!.intake;
  const ids = new Set(questions.map((q) => q.id));
  const valid = (target: string) => ids.has(target) || target === COMPLETE || target === RED_FLAG_DETOUR;

  describe(`${region.id} questionnaire audit`, () => {
    it('every target and condition refers to something real', () => {
      expect(ids.has(startQuestionId)).toBe(true);
      expect(ids.has(safetyCheckQuestionId)).toBe(true);
      for (const q of questions) {
        if (q.defaultNextQuestionId) expect(valid(q.defaultNextQuestionId)).toBe(true);
        for (const o of q.options ?? []) if (o.nextQuestionId) expect(valid(o.nextQuestionId)).toBe(true);
        for (const r of q.routes ?? []) {
          expect(valid(r.next)).toBe(true);
          if (r.next === RED_FLAG_DETOUR) expect(r.detour).toBeDefined();
          for (const c of r.when) {
            const target = questions.find((x) => x.id === c.questionId);
            expect(target).toBeDefined();
            for (const optionId of c.anyOf) expect(target!.options?.some((o) => o.id === optionId)).toBe(true);
          }
        }
      }
    });

    const outcomes = walkAll(questions, startQuestionId);

    it('every question is reachable', () => {
      const seen = new Set(outcomes.flatMap((o) => o.path));
      expect([...ids].filter((id) => !seen.has(id))).toEqual([]);
    });

    it('EVERY path that ends in a program passes the warning-sign checklist', () => {
      const completes = outcomes.filter((o) => o.end === 'COMPLETE');
      expect(completes.length).toBeGreaterThan(0);
      const skipped = completes.filter((o) => !o.path.includes(safetyCheckQuestionId));
      expect(skipped.map((o) => o.path.join(' → '))).toEqual([]);
    });

    it('every checklist item except the exclusive one sends the user to a doctor', () => {
      const checklist = questions.find((q) => q.id === safetyCheckQuestionId)!;
      for (const o of checklist.options ?? []) {
        if (o.exclusive) continue;
        expect(o.nextQuestionId).toBe(RED_FLAG_DETOUR);
        expect(o.detour).toBeDefined();
      }
    });
  });
}

// ---- Back: each documented way to the doctor screen, and the program paths ----
describe('back questionnaire behaviour', () => {
  const back = getRegions().find((r) => r.id === 'back')!.content!.intake;
  const q = (id: string) => back.questions.find((x) => x.id === id)!;
  const diagnosedSoFar: AnswerMap = {
    diagnosisStatus: 'diagnosed', diagnosisDetail: 'disc', clearedForExercise: 'fullCleared',
    painLocationDiagnosed: 'upperBack', aggravatingFactorsDiagnosed: 'both', redFlagChecklist: ['noneOfAbove'],
  };
  const undiagnosedSoFar: AnswerMap = {
    diagnosisStatus: 'notSeen', onsetType: 'gradual', painLocationUndiagnosed: 'midBack',
    aggravatingFactorsUndiagnosed: 'both', redFlagChecklist: ['noneOfAbove'],
  };

  it('both branches ask the same location question, with upper/mid/lower and spread options', () => {
    const labels = (id: string) => q(id).options!.map((o) => o.id);
    expect(labels('painLocationDiagnosed')).toEqual(labels('painLocationUndiagnosed'));
    expect(labels('painLocationDiagnosed')).toEqual(
      expect.arrayContaining(['lowerBack', 'lowerBackRadiating', 'midBack', 'upperBack', 'upperBackRadiating'])
    );
  });

  it('a diagnosed upper-back disc user is asked the same questions as any other (no lower-back assumption)', () => {
    expect(getNextQuestionId(q('clearedForExercise'), 'fullCleared', { diagnosisDetail: 'disc' })).toBe('painLocationDiagnosed');
    expect(estimateTotalQuestions(back.questions, back.startQuestionId, { diagnosisStatus: 'diagnosed' })).toBe(7);
    expect(estimateTotalQuestions(back.questions, back.startQuestionId, { diagnosisStatus: 'notSeen' })).toBe(6);
  });

  it('the checklist continues to the right next question on each branch', () => {
    expect(getNextQuestionId(q('redFlagChecklist'), ['noneOfAbove'], { diagnosisStatus: 'diagnosed' })).toBe('currentPainDiagnosed');
    expect(getNextQuestionId(q('redFlagChecklist'), ['noneOfAbove'], { diagnosisStatus: 'notSeen' })).toBe('dailyLimitationUndiagnosed');
  });

  it('1. any warning sign → doctor; bladder/bowel and chest/breathing are urgent', () => {
    expect(detectDetour(q('redFlagChecklist'), ['legNumbness'])).toBe('standard');
    expect(detectDetour(q('redFlagChecklist'), ['armNumbness'])).toBe('standard');
    expect(detectDetour(q('redFlagChecklist'), ['cancerHistory'])).toBe('standard');
    expect(detectDetour(q('redFlagChecklist'), ['bladderBowel'])).toBe('urgent');
    expect(detectDetour(q('redFlagChecklist'), ['chestBreathing', 'fever'])).toBe('urgent');
  });

  it('2. not cleared for exercise → "not cleared" doctor screen', () => {
    expect(getNextQuestionId(q('clearedForExercise'), 'notCleared', {})).toBe(RED_FLAG_DETOUR);
    expect(detectDetour(q('clearedForExercise'), 'notCleared')).toBe('notCleared');
  });

  it('3. sudden injury + significant limitation → doctor, even after "None of the above"', () => {
    const injured = { ...undiagnosedSoFar, onsetType: 'suddenInjury' };
    expect(getNextQuestionId(q('dailyLimitationUndiagnosed'), 'significantly', injured)).toBe(RED_FLAG_DETOUR);
    expect(getNextQuestionId(q('dailyLimitationUndiagnosed'), 'somewhat', injured)).toBe(COMPLETE);
    expect(getNextQuestionId(q('dailyLimitationUndiagnosed'), 'significantly', undiagnosedSoFar)).toBe(COMPLETE);
  });

  it('4. unsure about clearance + significant pain → doctor', () => {
    const unsure = { ...diagnosedSoFar, clearedForExercise: 'notSure' };
    expect(getNextQuestionId(q('currentPainDiagnosed'), 'significant', unsure)).toBe(RED_FLAG_DETOUR);
    expect(getNextQuestionId(q('currentPainDiagnosed'), 'moderate', unsure)).toBe(COMPLETE);
    expect(getNextQuestionId(q('currentPainDiagnosed'), 'significant', diagnosedSoFar)).toBe(COMPLETE);
  });
});
