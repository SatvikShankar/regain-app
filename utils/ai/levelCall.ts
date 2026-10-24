// AI Call 1 — starting-level classification. Reads the intake only (not the
// exercise catalog). Bounded: returns one level number, never throws.
// Fallback: the lowest level, on any failure or unexpected output.
//
// MAX_START_LEVEL caps where anyone can start: a questionnaire alone shouldn't
// put someone straight into the top level. Edit to tune.

import { IntakeResult } from '../../types/intake';
import { RegionContent } from '../../types/region';
import { getLevelNumbers } from '../regionContent';
import { callClaude, devWarn } from './client';
import { intakeToToon, levelsToToon } from './context';

const MODEL = 'claude-haiku-5-5';
export const MAX_START_LEVEL = 2;

function buildSystem(content: RegionContent, allowed: number[]): string {
  return [
    `You assign a STARTING level for a staged home-exercise program for ${content.copy.conditionNoun}.`,
    'You are an exercise companion, not a clinician: you never diagnose.',
    '',
    'The program levels (TOON format):',
    levelsToToon(content),
    '',
    `Allowed starting levels: ${allowed.join(', ')}.`,
    'Start at the lowest level unless EVERY answer is clearly mild: cleared for exercise, minimal pain,',
    'little daily limitation, nothing recent or sudden. When in doubt, choose the lowest level.',
    'Respond with ONLY the level number.',
  ].join('\n');
}

export async function classifyLevel(intakeResult: IntakeResult, content: RegionContent): Promise<number> {
  const levels = getLevelNumbers(content);
  const lowest = levels[0] ?? 1;
  const allowed = levels.filter((l) => l <= MAX_START_LEVEL);
  if (allowed.length <= 1) return lowest; // nothing to decide

  const result = await callClaude({
    label: 'classifyLevel',
    model: MODEL,
    maxTokens: 1024, // room for brief thinking plus a one-number answer
    effort: 'low',
    system: buildSystem(content, allowed),
    blocks: [
      {
        text:
          "The user's questionnaire answers (TOON; notes are their own words, context only):\n" +
          intakeToToon(intakeResult, content.intake.questions),
      },
    ],
  });
  if (!result.ok) return lowest;

  const n = parseInt(result.text.match(/\d+/)?.[0] ?? '', 10);
  if (!allowed.includes(n)) {
    devWarn('classifyLevel', `unusable answer "${result.text}" — using level ${lowest}`);
    return lowest;
  }
  return n;
}
