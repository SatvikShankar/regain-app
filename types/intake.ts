// Intake (questionnaire) contracts. Content lives in data/regions/<region>/intake.ts;
// the generic engine is utils/intakeEngine.ts.
//
// HARD RULE: routing reads ONLY selected options — never free text.

// Why a user is sent to the see-a-doctor screen (and which copy they see).
//   standard   — a warning sign: see a doctor before starting
//   urgent     — a warning sign needing prompt care (e.g. bladder/bowel changes)
//   notCleared — told they're not yet cleared for exercise: come back once cleared
export type DetourReason = "standard" | "urgent" | "notCleared";

export interface IntakeOption {
  id: string;
  label: string;
  nextQuestionId?: string;   // overrides the question's routing for this answer
  detour?: DetourReason;     // set on options that route to RED_FLAG_DETOUR
  exclusive?: boolean;       // multi-select only: choosing it clears the others (e.g. "None of the above")
}

// One condition on an answer: "<questionId> was answered with any of <anyOf>".
// The question can be an earlier one OR the one being answered now.
export interface AnswerCondition {
  questionId: string;
  anyOf: string[];
}

// Route by answers: when ALL conditions hold, go to <next>. A route to
// RED_FLAG_DETOUR must give a `detour` reason — this is how a COMBINATION of
// answers (none of them a warning sign alone) can still send someone to a
// doctor. Routing order is in utils/intakeEngine.ts.
export interface IntakeRoute {
  when: AnswerCondition[];
  next: string;
  detour?: DetourReason;
}

export interface IntakeQuestion {
  id: string;
  branch: "shared" | "diagnosed" | "undiagnosed";
  questionText: string;
  introText?: string;              // a short calm line shown ABOVE the question (never part of it)
  type: "singleSelect" | "multiSelect" | "freeTextOnly";
  options?: IntakeOption[];
  routes?: IntakeRoute[];
  defaultNextQuestionId?: string;  // where to go unless an option or route says otherwise
  disableFreeText?: boolean;       // default false (free text always on)
  freeTextPlaceholder?: string;    // only when the generic placeholder isn't right
  freeTextRequired?: boolean;      // only for freeTextOnly questions
}

export interface IntakeQuestionResponse {
  questionId: string;
  selectedOption: string | string[] | null;   // string for singleSelect, string[] for multiSelect, null for freeTextOnly
  freeText: string | null;
}

export interface IntakeResult {
  region: string;
  branch: "diagnosed" | "undiagnosed";
  responses: IntakeQuestionResponse[];
  redFlagged: boolean;
  redFlagSeverity?: DetourReason;
}
