// Generic intake tree-walking logic. Pure functions, no React, no knowledge of
// any specific region — give it a question array and it walks the tree.
//
// HARD RULE (see CLAUDE.md): routing and red-flag detection read ONLY the
// selected option(s). Free text is captured and carried into the IntakeResult
// (it becomes context for the AI calls) but it NEVER influences where the flow
// goes. None of the routing functions here even receive free text.
//
// Routing order for a question (first match wins):
//   1. a detour on any selected option (a warning sign)
//   2. a route to the detour whose conditions all hold (a combination of answers)
//   3. the selected option's own nextQuestionId
//   4. the first other route whose conditions all hold
//   5. the question's defaultNextQuestionId
//   6. COMPLETE

import {
  DetourReason,
  IntakeOption,
  IntakeQuestion,
  IntakeRoute,
  IntakeQuestionResponse,
  IntakeResult,
} from "../types/intake";

// Special destinations a question/option can point to instead of another id.
export const COMPLETE = "COMPLETE";
export const RED_FLAG_DETOUR = "RED_FLAG_DETOUR";

export type SelectedOption = string | string[] | null;
export type AnswerMap = Record<string, SelectedOption>; // questionId → selected option(s) so far

export function getQuestionById(
  questions: IntakeQuestion[],
  id: string
): IntakeQuestion | undefined {
  return questions.find((q) => q.id === id);
}

function asArray(selectedOption: SelectedOption): string[] {
  if (Array.isArray(selectedOption)) return selectedOption;
  if (typeof selectedOption === "string") return [selectedOption];
  return [];
}

function optionsFor(question: IntakeQuestion, selected: SelectedOption): IntakeOption[] {
  const ids = asArray(selected);
  return (question.options ?? []).filter((o) => ids.includes(o.id));
}

// Multi-select: an exclusive option ("None of the above") clears the others.
export function isExclusiveOption(option: IntakeOption): boolean {
  return !!option.exclusive;
}

function conditionsHold(route: IntakeRoute, answers: AnswerMap): boolean {
  return route.when.every((c) => asArray(answers[c.questionId] ?? null).some((id) => c.anyOf.includes(id)));
}

const RANK: DetourReason[] = ["urgent", "standard", "notCleared"];

// Does this answer send the user to the see-a-doctor screen, and why? Looks at
// the selected options (warning signs) and at combination routes. `answers`
// should include earlier answers on the path; the current one is added here.
// Urgent outranks standard, which outranks notCleared, when several apply.
export function detectDetour(
  question: IntakeQuestion,
  selectedOption: SelectedOption,
  answers: AnswerMap = {}
): DetourReason | null {
  const withCurrent = { ...answers, [question.id]: selectedOption };
  const reasons = [
    ...optionsFor(question, selectedOption).map((o) => o.detour),
    ...(question.routes ?? [])
      .filter((r) => r.next === RED_FLAG_DETOUR && conditionsHold(r, withCurrent))
      .map((r) => r.detour ?? "standard"),
  ].filter((r): r is DetourReason => !!r);
  return RANK.find((r) => reasons.includes(r)) ?? null;
}

// The wording of the warning-sign items the user ticked (shown on the doctor
// screen so it can say exactly what prompted it).
export function detourItems(question: IntakeQuestion, selectedOption: SelectedOption): string[] {
  return optionsFor(question, selectedOption)
    .filter((o) => o.detour)
    .map((o) => o.label);
}

function matchRoute(question: IntakeQuestion, answers: AnswerMap): string | undefined {
  return (question.routes ?? []).find((r) => r.next !== RED_FLAG_DETOUR && conditionsHold(r, answers))?.next;
}

// Where does this answer lead? Reads only selected options (this one + earlier).
export function getNextQuestionId(
  question: IntakeQuestion,
  selectedOption: SelectedOption,
  answers: AnswerMap
): string {
  if (detectDetour(question, selectedOption, answers)) return RED_FLAG_DETOUR;
  const withCurrent = { ...answers, [question.id]: selectedOption };
  const override = optionsFor(question, selectedOption).find((o) => o.nextQuestionId)?.nextQuestionId;
  return override ?? matchRoute(question, withCurrent) ?? question.defaultNextQuestionId ?? COMPLETE;
}

// Every question a user could go to next from here, given what's known so far.
// Answered → the one real destination; unanswered → every possible one.
function possibleNext(question: IntakeQuestion, answers: AnswerMap): string[] {
  if (question.id in answers) return [getNextQuestionId(question, answers[question.id], answers)];
  const viaRoute = matchRoute(question, answers);
  const fallthrough = viaRoute ?? question.defaultNextQuestionId ?? COMPLETE;
  const viaOptions = (question.options ?? [])
    .filter((o) => !o.detour && o.nextQuestionId)
    .map((o) => o.nextQuestionId as string);
  const anyOptionWithoutOverride =
    question.type !== "singleSelect" || (question.options ?? []).some((o) => !o.detour && !o.nextQuestionId);
  return [...new Set([...viaOptions, ...(anyOptionWithoutOverride ? [fallthrough] : [])])];
}

// How many questions the whole questionnaire will be for this user: the path so
// far, plus the LONGEST way it could still go. Shrinks to the exact length once
// the branch is known. Drives the "N of M" progress — derived, never hardcoded.
export function estimateTotalQuestions(
  questions: IntakeQuestion[],
  startId: string,
  answers: AnswerMap
): number {
  const longestFrom = (id: string, seen: Set<string>): number => {
    if (id === COMPLETE || id === RED_FLAG_DETOUR || seen.has(id)) return 0;
    const q = getQuestionById(questions, id);
    if (!q) return 0;
    const nextSeen = new Set(seen).add(id);
    return 1 + Math.max(0, ...possibleNext(q, answers).map((n) => longestFrom(n, nextSeen)));
  };
  return longestFrom(startId, new Set());
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

// Assemble the final result from the ordered path of responses. Only called on
// COMPLETE (detoured users never reach here), so redFlagged is always false.
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
