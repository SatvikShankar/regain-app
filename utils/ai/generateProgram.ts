// Runs the two bounded post-intake AI calls in parallel (neither needs the
// other's output) and returns the raw ingredients of a new program. Never
// rejects: each call falls back on its own, so the worst case is the lowest
// level + every exercise. See CLAUDE.md → AI Agent Flow.

import { ExerciseSelection } from '../../types/exercise';
import { IntakeResult } from '../../types/intake';
import { RegionContent } from '../../types/region';
import { classifyLevel } from './levelCall';
import { selectExercises } from './selectionCall';

export interface GeneratedProgram {
  assignedStartLevel: number;
  selectedExercises: ExerciseSelection;
}

export async function generateProgram(
  intakeResult: IntakeResult,
  content: RegionContent
): Promise<GeneratedProgram> {
  const [assignedStartLevel, selectedExercises] = await Promise.all([
    classifyLevel(intakeResult, content),
    selectExercises(intakeResult, content),
  ]);
  return { assignedStartLevel, selectedExercises };
}
