export interface IntakeOption {
  id: string;
  label: string;
  nextQuestionId?: string;       // overrides question's defaultNextQuestionId
  redFlagSeverity?: "standard" | "urgent";  // only on red flag items
}

export interface IntakeQuestion {
  id: string;
  branch: "shared" | "diagnosed" | "undiagnosed";
  questionText: string;
  type: "singleSelect" | "multiSelect" | "freeTextOnly";
  options?: IntakeOption[];
  defaultNextQuestionId?: string;  // where to go unless an option overrides
  disableFreeText?: boolean;       // default false (free text always on)
  freeTextPlaceholder?: string;    // only when default generic placeholder isn't right
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
  redFlagSeverity?: "standard" | "urgent";
};