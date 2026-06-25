export interface Exercise {
  id: string;
  name: string;
  region: string[];
  indicatedFor: string;
  description: string;
  purpose: string;
  videoUrl: string | null;
  sets: number;
  reps: number;
  holdSeconds: number | null;
}

export interface ExerciseProgram {
  [level: number]: Exercise[];
}


export type ExerciseSelection = {
  [level: number]: string[];
}

export interface LevelInfo {
  name: string;
  goal: string;
};