// Read-only access to region data (the registry in data/regions). Every screen,
// util and AI call goes through these — none imports a region folder directly —
// so adding a region never touches code here.

import { regions } from '../data/regions';
import { Exercise, LevelInfo } from '../types/exercise';
import { RegionContent, RegionDefinition } from '../types/region';

export function getRegions(): RegionDefinition[] {
  return regions;
}

export function getRegion(regionId: string): RegionDefinition | undefined {
  return regions.find((r) => r.id === regionId);
}

// Content for a built region; undefined for unknown or "coming soon" regions.
export function getRegionContent(regionId: string): RegionContent | undefined {
  return getRegion(regionId)?.content;
}

// The region's level numbers, ascending (derived from its level list).
export function getLevelNumbers(content: RegionContent): number[] {
  return Object.keys(content.levels)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
}

export function getLevelInfo(content: RegionContent, level: number): LevelInfo | undefined {
  return content.levels[level];
}

export function exercisesForLevel(content: RegionContent, level: number): Exercise[] {
  return content.exercises.filter((e) => e.level === level);
}

export function findExercise(regionId: string, exerciseId: string): Exercise | undefined {
  return getRegionContent(regionId)?.exercises.find((e) => e.id === exerciseId);
}
