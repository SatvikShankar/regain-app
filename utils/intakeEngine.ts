// Generic intake tree-walking logic. Pure functions, no React, no knowledge of
// any specific region — give it a question array and it walks the tree.
//
// HARD RULE (see CLAUDE.md): branching and red-flag detection read ONLY the
// selected option(s). Free text is captured and carried into the IntakeResult
// (it becomes context for the AI calls) but it NEVER influences where the flow
// goes. None of the routing functions here even receive free text.

import {
  IntakeOption,
  IntakeQuestion,
  IntakeQuestionResponse,
  IntakeResult,
} from "../types/intake";

// Special destinations a question/option can point to instead of another id.
export const COMPLETE = "COMPLETE";
export const RED_FLAG_DETOUR = "RED_FLAG_DETOUR";

export type SelectedOption = string | string[] | null;

export function getQuestionById(
  questions: IntakeQuestion[],
  id: string
): IntakeQuestion | undefined {
  return questions.find((q) => q.id === id);
}

function optionsFor(question: IntakeQuestion, selected: string[]): IntakeOption[] {
  return (question.options ?? []).filter((o) => selected.includes(o.id));
}

function asArray(selectedOption: SelectedOption): string[] {
  if (Array.isArray(selectedOption)) return selectedOption;
  if (typeof selectedOption === "string") return [selectedOption];
  return [];
}

// An "exclusive" option is one that routes onward to a normal question rather
// than to the red-flag detour — e.g. "None of the above" on the checklist.
// Selecting it clears the symptom options, and vice-versa (handled in the UI).
export function isExclusiveOption(option: IntakeOption): boolean {
  return !!option.nextQuestionId && option.nextQuestionId !== RED_FLAG_DETOUR;
}

// Where does this answer lead? Reads only the selected option(s).
export function getNextQuestionId(
  question: IntakeQuestion,
  selectedOption: SelectedOption
): string {
  if (question.type === "freeTextOnly") {
    return question.defaultNextQuestionId ?? COMPLETE;
  }

  if (question.type === "singleSelect") {
    const id = typeof selectedOption === "string" ? selectedOption : null;
    const option = question.options?.find((o) => o.id === id);
    return option?.nextQuestionId ?? question.defaultNextQuestionId ?? COMPLETE;
  }

  // multiSelect (the red-flag checklist): any selected option that routes to the
  // detour wins. Otherwise follow the first selected option that routes (the
  // "none of the above" path), falling back to the question default.
  const selected = optionsFor(question, asArray(selectedOption));
  if (selected.some((o) => o.nextQuestionId === RED_FLAG_DETOUR)) {
    return RED_FLAG_DETOUR;
  }
  const routing = selected.find((o) => o.nextQuestionId);
  return routing?.nextQuestionId ?? question.defaultNextQuestionId ?? COMPLETE;
}

// Is this answer a red flag, and how severe? Only meaningful for multiSelect.
// Urgent (e.g. bladder/bowel) outranks standard when several are selected.
export function detectRedFlag(
  question: IntakeQuestion,
  selectedOption: SelectedOption
): { redFlagged: boolean; severity?: "standard" | "urgent" } {
  if (question.type !== "multiSelect") return { redFlagged: false };
  const flagged = optionsFor(question, asArray(selectedOption)).filter(
    (o) => o.redFlagSeverity
  );
  if (flagged.length === 0) return { redFlagged: false };
  const severity = flagged.some((o) => o.redFlagSeverity === "urgent")
    ? "urgent"
    : "standard";
  return { redFlagged: true, severity };
}

// Which branch are we on? Derived from the first non-shared question on the
// path the user actually took.
export function determineBranch(
  questions: IntakeQuestion[],
  responses: IntakeQuestionResponse[]
): "diagnosed" | "undiagnosed" {
  for (const r of responses) {
    const q = getQuestionById(questions, r.questionId);
    if (q?.branch === "diagnosed" || q?.branch === "undiagnosed") {
      return q.branch;
    }
  }
  return "undiagnosed";
}

// Length of each branch's path including the shared entry question (Q1). Used to
// size the progress indicator. Derived from the data so it stays correct if the
// tree changes — never hardcoded.
export function getBranchLengths(questions: IntakeQuestion[]): {
  diagnosed: number;
  undiagnosed: number;
} {
  const shared = questions.filter((q) => q.branch === "shared").length;
  return {
    diagnosed: shared + questions.filter((q) => q.branch === "diagnosed").length,
    undiagnosed:
      shared + questions.filter((q) => q.branch === "undiagnosed").length,
  };
}

// Assemble the final result from the ordered path of responses. Only called on
// COMPLETE (red-flagged users never reach here), so redFlagged is always false.
export function buildIntakeResult(
  region: string,
  questions: IntakeQuestion[],
  responses: IntakeQuestionResponse[]
): IntakeResult {
  return {
    region,
    branch: determineBranch(questions, responses),
    responses,
    redFlagged: false,
  };
}
