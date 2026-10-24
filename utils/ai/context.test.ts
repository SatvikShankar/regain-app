import { backRegion } from '../../data/regions/back';
import { sampleIntake } from '../testFixtures';
import { catalogToToon, intakeToToon } from './context';

const content = backRegion.content!;

describe('AI context (TOON)', () => {
  it('sends the intake as readable question/answer text, including free-text notes', () => {
    const toon = intakeToToon(sampleIntake, content.intake.questions);
    expect(toon).toContain('Lower back (around the waistline)');
    expect(toon).toContain('L4-L5 disc bulge');
    expect(toon).toContain('worse, after sitting');
    expect(toon).not.toContain('lowerBack');
  });

  it('sends only the AI-relevant exercise fields, one table row per exercise', () => {
    const toon = catalogToToon(content);
    expect(toon).toContain(`exercises[${content.exercises.length}]{id,level,areas,equipment,indicatedFor}:`);
    expect(toon).toContain('resistanceBand');
    // user-facing text stays out of the prompt
    expect(toon).not.toContain(content.exercises[0].description);
    expect(toon).not.toContain(content.exercises[0].purpose);
  });
});
