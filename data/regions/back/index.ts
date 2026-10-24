// The Back region: display info + all of its content, in one object.

import { RegionDefinition } from "../../../types/region";
import { backCopy } from "./copy";
import { backExercises } from "./exercises";
import { backIntakeQuestions, backIntakeStartQuestionId } from "./intake";
import { backLevels } from "./levels";

export const backRegion: RegionDefinition = {
  id: "back",
  label: "Back",
  subtitle: "Lower, mid, or upper back pain",
  icon: "regionBack",
  available: true,
  content: {
    intake: {
      startQuestionId: backIntakeStartQuestionId,
      questions: backIntakeQuestions,
      safetyCheckQuestionId: "redFlagChecklist",
    },
    exercises: backExercises,
    levels: backLevels,
    copy: backCopy,
  },
};
