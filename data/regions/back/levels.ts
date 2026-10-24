// Back program levels — names and goals shown on the Program screen. The number
// of levels is whatever is listed here (the engine never assumes 3).

import { LevelInfo } from "../../../types/exercise";

export const backLevels: { [level: number]: LevelInfo } = {
  1: {
    name: "Gentle Mobility, Stretching & Relief",
    goal: "Reduce acute discomfort, restore basic comfortable movement, and build confidence that movement is safe.",
  },
  2: {
    name: "Activation & Stability",
    goal: "Build active strength and control in the muscles that support your spine, with low-impact, controlled movements.",
  },
  3: {
    name: "Strength & Functional Loading",
    goal: "Build real-world strength and stability for daily activities, sport, and return to full loading.",
  },
};
