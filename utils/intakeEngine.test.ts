import { IntakeQuestion } from '../types/intake';
import {
  COMPLETE,
  RED_FLAG_DETOUR,
  detectDetour,
  estimateTotalQuestions,
  getNextQuestionId,
} from './intakeEngine';

// A small synthetic tree exercising every routing feature.
const q = (o: Partial<IntakeQuestion> & { id: string }): IntakeQuestion => ({
  branch: 'shared',
  questionText: o.id,
  type: 'singleSelect',
  ...o,
});
const tree: IntakeQuestion[] = [
  q({ id: 'start', options: [{ id: 'a', label: 'A', nextQuestionId: 'kind' }, { id: 'b', label: 'B', nextQuestionId: 'last' }] }),
  q({
    id: 'kind',
    defaultNextQuestionId: 'cleared',
    options: [{ id: 'disc', label: 'Disc' }, { id: 'other', label: 'Other' }],
  }),
  q({
    id: 'cleared',
    defaultNextQuestionId: 'where',
    routes: [{ when: [{ questionId: 'kind', anyOf: ['disc'] }], next: 'spread' }],
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No', nextQuestionId: RED_FLAG_DETOUR, detour: 'notCleared' },
    ],
  }),
  q({ id: 'spread', defaultNextQuestionId: 'check', options: [{ id: 'y', label: 'Y' }] }),
  q({ id: 'where', defaultNextQuestionId: 'check', options: [{ id: 'low', label: 'Low' }] }),
  q({
    id: 'check',
    type: 'multiSelect',
    defaultNextQuestionId: 'last',
    options: [
      { id: 'flag', label: 'Flag', nextQuestionId: RED_FLAG_DETOUR, detour: 'standard' },
      { id: 'bad', label: 'Bad', nextQuestionId: RED_FLAG_DETOUR, detour: 'urgent' },
      { id: 'none', label: 'None', exclusive: true },
    ],
  }),
  q({
    id: 'last',
    options: [{ id: 'ok', label: 'OK' }, { id: 'limited', label: 'Limited' }],
    routes: [
      {
        when: [{ questionId: 'kind', anyOf: ['disc'] }, { questionId: 'last', anyOf: ['limited'] }],
        next: RED_FLAG_DETOUR,
        detour: 'standard',
      },
    ],
  }),
];
const get = (id: string) => tree.find((x) => x.id === id)!;

describe('routing', () => {
  it('routes by an earlier answer, else the default', () => {
    expect(getNextQuestionId(get('cleared'), 'yes', { start: 'a', kind: 'disc' })).toBe('spread');
    expect(getNextQuestionId(get('cleared'), 'yes', { start: 'a', kind: 'other' })).toBe('where');
  });

  it('an option detour wins over routes', () => {
    expect(getNextQuestionId(get('cleared'), 'no', { kind: 'disc' })).toBe(RED_FLAG_DETOUR);
    expect(detectDetour(get('cleared'), 'no')).toBe('notCleared');
  });

  it('multi-select: any flagged item detours; urgent outranks standard; "none" continues', () => {
    expect(detectDetour(get('check'), ['flag', 'bad'])).toBe('urgent');
    expect(getNextQuestionId(get('check'), ['flag'], {})).toBe(RED_FLAG_DETOUR);
    expect(getNextQuestionId(get('check'), ['none'], {})).toBe('last');
    expect(getNextQuestionId(get('last'), 'ok', {})).toBe(COMPLETE);
  });
});

describe('combination detours', () => {
  it('routes to the doctor only when ALL conditions hold, even after "None of the above"', () => {
    const answers = { start: 'a', kind: 'disc', cleared: 'yes', spread: 'y', check: ['none'] };
    expect(getNextQuestionId(get('last'), 'limited', answers)).toBe(RED_FLAG_DETOUR);
    expect(detectDetour(get('last'), 'limited', answers)).toBe('standard');
    expect(getNextQuestionId(get('last'), 'ok', answers)).toBe(COMPLETE);
    expect(getNextQuestionId(get('last'), 'limited', { ...answers, kind: 'other' })).toBe(COMPLETE);
  });
});

describe('estimateTotalQuestions', () => {
  it('shows the longest possible path until answers narrow it down', () => {
    expect(estimateTotalQuestions(tree, 'start', {})).toBe(6); // start kind cleared spread|where check last
    expect(estimateTotalQuestions(tree, 'start', { start: 'b' })).toBe(2);
    expect(estimateTotalQuestions(tree, 'start', { start: 'a', kind: 'disc', cleared: 'yes' })).toBe(6);
  });
});
