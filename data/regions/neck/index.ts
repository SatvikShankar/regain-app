// The Neck region — scaffold only ("Coming soon"). To ship it: add intake.ts,
// exercises.ts, levels.ts and copy.ts beside this file (mirroring back/), attach
// them as `content`, and set `available: true`.

import { RegionDefinition } from "../../../types/region";

export const neckRegion: RegionDefinition = {
  id: "neck",
  label: "Neck",
  subtitle: "Neck and shoulder tension",
  icon: "regionNeck",
  available: false,
};
