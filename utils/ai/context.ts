// Builds the compact, model-facing context for the AI calls, encoded as TOON
// (a token-lean, table-like format for LLM input). The source data is NOT
// changed: we pick only the fields a model needs from the full records, and the
// UI keeps reading the full records from data/regions.
//
//   intake  → one row per answered question: the question's wording, the chosen
//             answer's wording, and the user's own note (free text, context only).
//   catalog → one row per exercise: id, level, areas, equipment, indicatedFor.
//             (No descriptions/purpose/sets — those are user-facing.)

import { encode } from '@toon-format/toon';
import { IntakeQuestion, IntakeResult } from '../../types/intake';
import { RegionContent } from '../../types/region';
import { getLevelNumbers } from '../regionContent';

// Inside a TOON table row, list values are joined with "|" so they stay one cell.
const LIST_SEPARATOR = '|';

function answerText(question: IntakeQuestion | undefined, selected: string | string[] | null): string {
  if (selected == null) return '';
  const ids = Array.isArray(selected) ? selected : [selected];
  return ids
    .map((id) => question?.options?.find((o) => o.id === id)?.label ?? id)
    .join('; ');
}

export function intakeToToon(result: IntakeResult, questions: IntakeQuestion[]): string {
  const answers = result.responses.map((r) => {
    const question = questions.find((q) => q.id === r.questionId);
    return {
      question: question?.questionText ?? r.questionId,
      answer: answerText(question, r.selectedOption),
      note: r.freeText ?? '',
    };
  });
  return encode({ branch: result.branch, answers });
}

export function catalogToToon(content: RegionContent): string {
  const exercises = content.exercises.map((e) => ({
    id: e.id,
    level: e.level,
    areas: e.areas.join(LIST_SEPARATOR),
    equipment: e.equipment.length ? e.equipment.join(LIST_SEPARATOR) : 'none',
    indicatedFor: e.indicatedFor,
  }));
  return encode({ exercises });
}

export function levelsToToon(content: RegionContent): string {
  const levels = getLevelNumbers(content).map((level) => ({
    level,
    name: content.levels[level].name,
    goal: content.levels[level].goal,
  }));
  return encode({ levels });
}
