import { backRegion } from '../../data/regions/back';
import { exercisesForLevel } from '../regionContent';
import { MAX_PER_LEVEL, validateSelection } from './selectionCall';

const content = backRegion.content!;

describe('validateSelection', () => {
  it('groups by each exercise\'s real level, drops unknown and duplicate IDs', () => {
    const sel = validateSelection(['catCamel', 'madeUpId', 'catCamel', 'gluteBridge', 'plank'], content);
    expect(sel[1]).toEqual(['catCamel']);
    expect(sel[2]).toEqual(['gluteBridge']);
    expect(sel[3]).toEqual(['plank']);
  });

  it('caps each level at MAX_PER_LEVEL', () => {
    const allLevel1 = exercisesForLevel(content, 1).map((e) => e.id);
    expect(allLevel1.length).toBeGreaterThan(MAX_PER_LEVEL);
    const sel = validateSelection([...allLevel1, 'gluteBridge', 'plank'], content);
    expect(sel[1]).toHaveLength(MAX_PER_LEVEL);
  });

  it('falls back to every exercise of a level the model left empty', () => {
    const sel = validateSelection(['catCamel', 'plank'], content);
    expect(sel[2]).toEqual(exercisesForLevel(content, 2).map((e) => e.id));
  });
});
