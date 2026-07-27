// The two bounded, post-intake AI calls (see CLAUDE.md → AI Agent Flow).
//
// Both run AFTER intake completes and red flags are cleared, independently and
// in parallel. Neither is part of red-flag detection. Each has a deterministic
// fallback so the app NEVER blocks or errors on an API failure:
//   - Call 1 (level classification) → falls back to the lowest level.
//   - Call 2 (exercise selection)   → falls back to every exercise, unfiltered.
//
// Models (Satvik's call — split deliberately):
//   - Classification is a trivial "pick a number" task → Haiku 4.5 (fast/cheap).
//   - Selection is the nuanced "match exercises to this person" task, the part
//     that should feel smart → Sonnet 4.6 (stronger reasoning).
//
// Transport: a plain fetch to the Messages API rather than the Anthropic SDK —
// most robust path in an Expo/React Native (Metro/Hermes) runtime, no extra
// deps, and these are simple non-streaming JSON calls. The API key is read from
// EXPO_PUBLIC_ANTHROPIC_API_KEY and is therefore embedded in the client bundle
// — acceptable for this no-backend portfolio MVP, NOT for production.
//
// Prompts here are functional placeholders — Satvik will refine the wording.

import { ExerciseProgram, ExerciseSelection } from '../types/exercise';
import { IntakeResult } from '../types/intake';

const API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const CLASSIFY_MODEL = 'claude-haiku-4-5';
const SELECT_MODEL = 'claude-sonnet-4-6';

export interface GeneratedProgram {
  assignedStartLevel: number;
  selectedExercises: ExerciseSelection;
}

function getApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  return key && key.length > 0 ? key : null;
}

// One non-streaming call. Returns the text of the first content block, or null
// on any failure (missing key, network error, non-2xx, unexpected shape).
async function callClaude(
  model: string,
  prompt: string,
  maxTokens: number
): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        // Needed only for the Expo web build (CORS); harmless on native.
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.content?.[0]?.text;
    return typeof text === 'string' ? text : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Call 1 — Level classification
// ---------------------------------------------------------------------------

function levelsOf(program: ExerciseProgram): number[] {
  return Object.keys(program)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
}

function buildLevelPrompt(intakeResult: IntakeResult, levels: number[]): string {
  return [
    'You are assigning a STARTING difficulty level for an exercise recovery program.',
    `Valid levels (lowest number = gentlest): ${levels.join(', ')}.`,
    '',
    "The user's intake answers (a structured questionnaire; free-text notes are context only):",
    JSON.stringify(intakeResult, null, 2),
    '',
    'Pick the single most appropriate starting level. Be conservative — when unsure, choose lower.',
    'Respond with ONLY the level number and nothing else.',
  ].join('\n');
}

export async function classifyLevel(
  intakeResult: IntakeResult,
  program: ExerciseProgram
): Promise<number> {
  const levels = levelsOf(program);
  const lowest = levels[0] ?? 1;
  const raw = await callClaude(CLASSIFY_MODEL, buildLevelPrompt(intakeResult, levels), 16);
  if (!raw) return lowest;
  const match = raw.match(/\d+/);
  const n = match ? parseInt(match[0], 10) : NaN;
  return levels.includes(n) ? n : lowest;
}

// ---------------------------------------------------------------------------
// Call 2 — Exercise selection
// ---------------------------------------------------------------------------

// Fallback: every exercise in every level (IDs only).
function allExerciseIds(program: ExerciseProgram): ExerciseSelection {
  const result: ExerciseSelection = {};
  for (const level of levelsOf(program)) {
    result[level] = program[level].map((e) => e.id);
  }
  return result;
}

function buildSelectionPrompt(
  intakeResult: IntakeResult,
  program: ExerciseProgram
): string {
  return [
    'You are selecting which exercises to include in a personalized back-pain recovery program.',
    '',
    "The user's intake (structured answers + free-text notes for context):",
    JSON.stringify(intakeResult, null, 2),
    '',
    'The full exercise pool, organized by level:',
    JSON.stringify(program, null, 2),
    '',
    'Select the most relevant exercises for THIS user, for EVERY level (they progress through',
    'all levels over time). Use each exercise\'s "indicatedFor" field together with the user\'s',
    'pain location, aggravating factors, and limitations. Keep several exercises per level;',
    'only drop ones that are clearly inappropriate.',
    '',
    'Respond with ONLY a JSON object mapping each level number to an array of exercise IDs, e.g.:',
    '{"1": ["idA","idB"], "2": ["idC"], "3": ["idD","idE"]}',
    'No prose, no markdown code fences.',
  ].join('\n');
}

// Pull the first {...} object out of a model response, tolerating stray prose
// or markdown fences.
function extractJsonObject(raw: string): unknown {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

// Keep only IDs that actually exist in the pool (silently drop hallucinations).
// Any level the model left empty/invalid falls back to all exercises for it.
function validateSelection(
  parsed: unknown,
  program: ExerciseProgram
): ExerciseSelection {
  if (!parsed || typeof parsed !== 'object') return allExerciseIds(program);
  const byLevel = parsed as Record<string, unknown>;
  const result: ExerciseSelection = {};
  for (const level of levelsOf(program)) {
    const validIds = new Set(program[level].map((e) => e.id));
    const proposed = byLevel[String(level)];
    const filtered = Array.isArray(proposed)
      ? proposed.filter((id): id is string => typeof id === 'string' && validIds.has(id))
      : [];
    result[level] = filtered.length > 0 ? filtered : program[level].map((e) => e.id);
  }
  return result;
}

export async function selectExercises(
  intakeResult: IntakeResult,
  program: ExerciseProgram
): Promise<ExerciseSelection> {
  const raw = await callClaude(SELECT_MODEL, buildSelectionPrompt(intakeResult, program), 1024);
  if (!raw) return allExerciseIds(program);
  return validateSelection(extractJsonObject(raw), program);
}

// ---------------------------------------------------------------------------
// Orchestrator — runs both calls in parallel. Each handles its own failure, so
// this never rejects; worst case is the all-fallback result.
// ---------------------------------------------------------------------------

export async function generateProgram(
  intakeResult: IntakeResult,
  program: ExerciseProgram
): Promise<GeneratedProgram> {
  const [assignedStartLevel, selectedExercises] = await Promise.all([
    classifyLevel(intakeResult, program),
    selectExercises(intakeResult, program),
  ]);
  return { assignedStartLevel, selectedExercises };
}
