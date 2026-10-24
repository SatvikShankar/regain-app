// Back pain intake question tree.
// Pure content — the intake engine (utils/intakeEngine.ts) renders and routes
// these questions generically. See CLAUDE.md for the rules on structured input
// vs. free text: routing reads ONLY selected options, never free text.
//
// Shape of the tree:
//   Q1 diagnosisStatus ─┬─ diagnosed:   diagnosisDetail → clearedForExercise → painLocationDiagnosed
//                       │               → aggravatingFactorsDiagnosed → redFlagChecklist → currentPainDiagnosed
//                       └─ undiagnosed: onsetType → painLocationUndiagnosed → aggravatingFactorsUndiagnosed
//                                       → redFlagChecklist → dailyLimitationUndiagnosed
//
// Ways to the see-a-doctor screen (RED_FLAG_DETOUR):
//   - any warning sign ticked on redFlagChecklist (both branches)
//   - "No / not yet" cleared for exercise                       (notCleared)
//   - sudden-injury onset + significant daily limitation          (combination route)
//   - "Not sure" if cleared + significant current pain            (combination route)
// utils/intakeTree.test.ts audits that EVERY path to a program passes the checklist.

import { IntakeOption, IntakeQuestion } from "../../../types/intake";

export const backIntakeStartQuestionId = "diagnosisStatus";

// Shared by both branches' location question, so both ask the same thing.
const painLocationOptions: IntakeOption[] = [
  { id: "lowerBack", label: "Lower back (around the waistline)" },
  { id: "lowerBackRadiating", label: "Lower back and it spreads into the buttock or leg" },
  { id: "midBack", label: "Mid back (between the shoulder blades)" },
  { id: "upperBack", label: "Upper back / base of neck" },
  { id: "upperBackRadiating", label: "Upper back and it spreads into the shoulder or arm" },
  { id: "movesAround", label: "It moves around / hard to pinpoint" },
];

const aggravatingOptions: IntakeOption[] = [
  { id: "sittingOrFlexion", label: "Sitting or bending forward" },
  { id: "standingOrExtension", label: "Standing for long periods or arching backward" },
  { id: "both", label: "Both" },
  { id: "nothingSpecific", label: "Nothing specific / it's fairly constant" },
];

export const backIntakeQuestions: IntakeQuestion[] = [

  // ----------------------------------------------------------
  // Q1 — Entry point (shared, routes to diagnosed or undiagnosed branch)
  // ----------------------------------------------------------
  {
    id: "diagnosisStatus",
    branch: "shared",
    introText: "A few questions so we start you in the right place.",
    questionText: "Have you been diagnosed by a doctor or physiotherapist for this issue?",
    type: "singleSelect",
    disableFreeText: true,
    options: [
      { id: "diagnosed", label: "Yes, I have a diagnosis", nextQuestionId: "diagnosisDetail" },
      { id: "seenNoClarity", label: "I've seen someone but don't have a clear diagnosis", nextQuestionId: "onsetType" },
      { id: "notSeen", label: "No, I haven't seen anyone", nextQuestionId: "onsetType" },
    ],
  },

  // ----------------------------------------------------------
  // DIAGNOSED BRANCH
  // ----------------------------------------------------------
  {
    id: "diagnosisDetail",
    branch: "diagnosed",
    questionText: "What were you diagnosed with?",
    type: "singleSelect",
    freeTextPlaceholder: "Any details? e.g. L4-L5, which side (optional)",
    defaultNextQuestionId: "clearedForExercise",
    options: [
      { id: "disc", label: "A disc problem (bulge, herniation or \"slipped\" disc)" },
      { id: "nerve", label: "Sciatica or a trapped / pinched nerve" },
      { id: "muscleStrain", label: "A muscle strain or sprain" },
      { id: "facetStiffness", label: "Facet joint pain or general stiffness" },
      { id: "stenosis", label: "Spinal stenosis (narrowing of the spinal canal)" },
      { id: "spondylolisthesis", label: "Spondylolisthesis (a vertebra that has slipped forward)" },
      { id: "scoliosis", label: "Scoliosis" },
      { id: "other", label: "Something else, or I'm not sure of the term" },
    ],
  },
  {
    id: "clearedForExercise",
    branch: "diagnosed",
    questionText: "Has your doctor or physio cleared you for general exercise or movement?",
    type: "singleSelect",
    defaultNextQuestionId: "painLocationDiagnosed",
    options: [
      { id: "fullCleared", label: "Yes, fully cleared" },
      { id: "clearedWithRestrictions", label: "Cleared with some restrictions" },
      { id: "notCleared", label: "No / not yet", nextQuestionId: "RED_FLAG_DETOUR", detour: "notCleared" },
      { id: "notSure", label: "Not sure" },
    ],
  },
  {
    id: "painLocationDiagnosed",
    branch: "diagnosed",
    questionText: "Where do you feel it most?",
    type: "singleSelect",
    defaultNextQuestionId: "aggravatingFactorsDiagnosed",
    options: painLocationOptions,
  },
  {
    id: "aggravatingFactorsDiagnosed",
    branch: "diagnosed",
    questionText: "What tends to make it worse?",
    type: "singleSelect",
    defaultNextQuestionId: "redFlagChecklist",
    options: aggravatingOptions,
  },
  {
    id: "currentPainDiagnosed",
    branch: "diagnosed",
    questionText: "How would you describe your current pain on most days?",
    type: "singleSelect",
    defaultNextQuestionId: "COMPLETE",
    options: [
      { id: "minimal", label: "Minimal — mostly stiffness or mild discomfort" },
      { id: "moderate", label: "Moderate — noticeable, limits some activities" },
      { id: "significant", label: "Significant — affects most daily activities" },
    ],
    routes: [
      // Unsure about clearance AND significant pain → check with a professional first.
      {
        when: [
          { questionId: "clearedForExercise", anyOf: ["notSure"] },
          { questionId: "currentPainDiagnosed", anyOf: ["significant"] },
        ],
        next: "RED_FLAG_DETOUR",
        detour: "standard",
      },
    ],
  },

  // ----------------------------------------------------------
  // UNDIAGNOSED BRANCH
  // ----------------------------------------------------------
  {
    id: "onsetType",
    branch: "undiagnosed",
    questionText: "How did this start?",
    type: "singleSelect",
    defaultNextQuestionId: "painLocationUndiagnosed",
    options: [
      { id: "suddenInjury", label: "Sudden injury or specific moment (lifting, fall, accident)" },
      { id: "gradual", label: "Gradually, built up over time" },
      { id: "suddenNoTrauma", label: "Woke up with it / came on suddenly without obvious cause" },
    ],
  },
  {
    id: "painLocationUndiagnosed",
    branch: "undiagnosed",
    questionText: "Where do you feel it most?",
    type: "singleSelect",
    defaultNextQuestionId: "aggravatingFactorsUndiagnosed",
    options: painLocationOptions,
  },
  {
    id: "aggravatingFactorsUndiagnosed",
    branch: "undiagnosed",
    questionText: "What tends to make it worse?",
    type: "singleSelect",
    defaultNextQuestionId: "redFlagChecklist",
    options: aggravatingOptions,
  },
  {
    id: "dailyLimitationUndiagnosed",
    branch: "undiagnosed",
    questionText: "How much does this limit your daily activities right now?",
    type: "singleSelect",
    defaultNextQuestionId: "COMPLETE",
    options: [
      { id: "barely", label: "Barely — I can do most things, it's just annoying" },
      { id: "somewhat", label: "Somewhat — I avoid certain movements or activities" },
      { id: "significantly", label: "Significantly — it affects walking, sitting, sleeping, or work" },
    ],
    routes: [
      // An injury that is significantly limiting daily life should be assessed first.
      {
        when: [
          { questionId: "onsetType", anyOf: ["suddenInjury"] },
          { questionId: "dailyLimitationUndiagnosed", anyOf: ["significantly"] },
        ],
        next: "RED_FLAG_DETOUR",
        detour: "standard",
      },
    ],
  },

  // ----------------------------------------------------------
  // WARNING-SIGN CHECKLIST — one list, asked on BOTH branches (and re-asked
  // after repeated significant pain in check-ins). Any item → doctor screen.
  // ----------------------------------------------------------
  {
    id: "redFlagChecklist",
    branch: "shared",
    introText: "A routine check before we choose exercises.",
    questionText: "Do you currently experience any of the following?",
    type: "multiSelect",
    defaultNextQuestionId: "dailyLimitationUndiagnosed",
    routes: [
      { when: [{ questionId: "diagnosisStatus", anyOf: ["diagnosed"] }], next: "currentPainDiagnosed" },
    ],
    options: [
      { id: "legNumbness", label: "Numbness, tingling, or progressive weakness in one or both legs", nextQuestionId: "RED_FLAG_DETOUR", detour: "standard" },
      { id: "armNumbness", label: "Numbness, tingling, or weakness in your arms or hands", nextQuestionId: "RED_FLAG_DETOUR", detour: "standard" },
      { id: "bladderBowel", label: "Any recent changes in bladder or bowel habits alongside your back pain", nextQuestionId: "RED_FLAG_DETOUR", detour: "urgent" },
      { id: "chestBreathing", label: "Chest pain, or difficulty breathing, alongside the back pain", nextQuestionId: "RED_FLAG_DETOUR", detour: "urgent" },
      { id: "constantSevere", label: "Pain that is constant and severe, not relieved by any position or rest", nextQuestionId: "RED_FLAG_DETOUR", detour: "standard" },
      { id: "weightLoss", label: "Unexplained weight loss alongside the back pain", nextQuestionId: "RED_FLAG_DETOUR", detour: "standard" },
      { id: "fever", label: "Fever or feeling generally unwell alongside the back pain", nextQuestionId: "RED_FLAG_DETOUR", detour: "standard" },
      { id: "cancerHistory", label: "A past or current diagnosis of cancer", nextQuestionId: "RED_FLAG_DETOUR", detour: "standard" },
      { id: "recentTrauma", label: "Recent serious trauma (major fall, car accident, direct blow to the spine)", nextQuestionId: "RED_FLAG_DETOUR", detour: "standard" },
      { id: "noneOfAbove", label: "None of the above", exclusive: true },
    ],
  },
];
