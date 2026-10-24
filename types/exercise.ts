// Exercise content contract. A region's exercises are ONE flat list (one row per
// exercise, like a database table); levels are a field, not a grouping. Helpers
// in utils/regionContent.ts derive per-level views at render time.

export interface Exercise {
  id: string;
  name: string;
  level: number;          // which level of the region's program it belongs to
  areas: string[];        // sub-locations within the region; vocabulary is per-region (Back: lower | mid | upper | general)
  equipment: string[];    // e.g. ["resistanceBand"]; empty = none needed
  indicatedFor: string;   // AI-facing: terse, when appropriate
  description: string;    // user-facing: how to perform
  purpose: string;        // user-facing: why it helps
  videoUrl: string | null;
  sets: number;           // starting guidance, not a prescription
  reps: number;
  holdSeconds: number | null;
}

// Level → selected exercise IDs (what AI Call 2 returns and a program stores).
export type ExerciseSelection = { [level: number]: string[] };

export interface LevelInfo {
  name: string;
  goal: string;
}
