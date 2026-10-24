// Region registry — the ONE list of body regions the app knows about. Screens,
// the intake engine and the AI calls all look regions up here; nothing else
// imports a region folder directly. Order here = order on Region Select.

import { RegionDefinition } from "../../types/region";
import { backRegion } from "./back";
import { neckRegion } from "./neck";

export const regions: RegionDefinition[] = [backRegion, neckRegion];
