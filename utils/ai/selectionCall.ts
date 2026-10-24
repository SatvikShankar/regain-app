// AI Call 2 — exercise selection. Sends the region's exercise catalog (slim,
// TOON-encoded, cached) plus the intake, and gets back exercise IDs per level.
// Final grouping is done here from the catalog itself, so the model can't
// misfile an exercise. Never throws.
//
// Validation: unknown IDs are dropped silently, duplicates removed, and each
// level capped at MAX_PER_LEVEL. A level left with nothing falls back to all of
// that level's exercises (CLAUDE.md fallback rule).
//
// Caching: the system prompt + catalog form a stable prefix per region, marked
// as a cache breakpoint. Only the intake (after it) varies per user, and a
// different region's catalog is a different prefix, so caches never mix.

import { ExerciseSelection } from '../../types/exercise';
import { IntakeResult } from '../../types/intake';
import { RegionContent } from '../../types/region';
import { exercisesForLevel, getLevelNumbers } from '../regionContent';
import { callClaude, devWarn } from './client';
import { catalogToToon, intakeToToon } from './context';

const MODEL = 'claude-sonnet-5-5';
export const MIN_PER_LEVEL = 4;
export const MAX_PER_LEVEL = 6;

function buildSystem(content: RegionContent): string {
  const levels = getLevelNumbers(content);
  const shape = '{' + levels.map((l) => `"${l}": ["id", ...]`).join(', ') + '}';
  return [
    `You select exercises for a staged home-exercise program for ${content.copy.conditionNoun}.`,
    'You are an exercise companion, not a clinician: you never diagnose.',
    'The user will work through EVERY level over time, so every level needs a selection.',
    '',
    `Exercise "areas" values: ${content.copy.areaVocabulary}.`,
    '',
    'Rules:',
    `- For EACH level (${levels.join(', ')}), choose ${MIN_PER_LEVEL} to ${MAX_PER_LEVEL} exercises from that level.`,
    '  Never leave a level empty. Fewer than ' + MIN_PER_LEVEL + ' only if the level truly has fewer suitable ones.',
    '- Choose exercises whose areas match where the user feels it most, plus "general" ones.',
    '  Do not choose exercises for other areas unless the user says the pain moves around.',
    "- Use each exercise's indicatedFor against what makes the pain worse (e.g. if bending forward",
    '  aggravates it, prefer exercises that avoid repeated forward bending), current pain and daily limitation.',
    "- Notes are the user's own words: use them as context only.",
    '',
    `Respond with ONLY a JSON object, no prose and no code fences: ${shape}`,
  ].join('\n');
}

function allExerciseIds(content: RegionContent): ExerciseSelection {
  const result: ExerciseSelection = {};
  for (const level of getLevelNumbers(content)) {
    result[level] = exercisesForLevel(content, level).map((e) => e.id);
  }
  return result;
}

// The model answers per level ({"1": [...], ...}); we flatten to IDs and regroup
// by each exercise's real level in validateSelection, so misfiled IDs still land
// in the right place.
function extractIds(raw: string): string[] | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end < start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    if (!parsed || typeof parsed !== 'object') return null;
    return Object.values(parsed)
      .flat()
      .filter((id): id is string => typeof id === 'string');
  } catch {
    return null;
  }
}

// Exported for tests: turn the model's ID list into a valid per-level selection.
export function validateSelection(ids: string[], content: RegionContent): ExerciseSelection {
  const byId = new Map(content.exercises.map((e) => [e.id, e]));
  const result: ExerciseSelection = {};
  for (const level of getLevelNumbers(content)) result[level] = [];

  for (const id of new Set(ids)) {
    const exercise = byId.get(id);
    if (!exercise) continue; // hallucinated ID — dropped silently
    const bucket = result[exercise.level];
    if (bucket && bucket.length < MAX_PER_LEVEL) bucket.push(id);
  }
  for (const level of getLevelNumbers(content)) {
    if (result[level].length === 0) {
      devWarn('selectExercises', `nothing valid for level ${level} — using all of its exercises`);
      result[level] = exercisesForLevel(content, level).map((e) => e.id);
    }
  }
  return result;
}

export async function selectExercises(
  intakeResult: IntakeResult,
  content: RegionContent
): Promise<ExerciseSelection> {
  const result = await callClaude({
    label: 'selectExercises',
    model: MODEL,
    maxTokens: 8000, // room for thinking plus the JSON answer
    effort: 'medium',
    serverFallback: true,
    system: buildSystem(content),
    blocks: [
      { text: 'The exercise catalog (TOON format):\n' + catalogToToon(content), cache: true },
      {
        text:
          "The user's questionnaire answers (TOON; notes are their own words, context only):\n" +
          intakeToToon(intakeResult, content.intake.questions),
      },
    ],
  });
  if (!result.ok) return allExerciseIds(content);

  const ids = extractIds(result.text);
  if (!ids) {
    devWarn('selectExercises', 'could not parse the response — using all exercises');
    return allExerciseIds(content);
  }
  return validateSelection(ids, content);
}
