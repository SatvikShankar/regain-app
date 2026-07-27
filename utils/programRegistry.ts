// Maps a region to its program data (exercise pool + level info). Keeps the AI
// flow and screens generic — they ask the registry for "the back program"
// rather than importing region files directly. Add a row here when Neck ships.

import { backLevelInfo, backProgram } from '../data/programs/backProgram';
import { ExerciseProgram, LevelInfo } from '../types/exercise';

export interface RegionProgram {
  program: ExerciseProgram;
  levelInfo: { [level: number]: LevelInfo };
}

const registry: { [region: string]: RegionProgram } = {
  back: { program: backProgram, levelInfo: backLevelInfo },
  // neck: scaffold only — no real program yet.
};

export function getRegionProgram(region: string): RegionProgram | undefined {
  return registry[region];
}
