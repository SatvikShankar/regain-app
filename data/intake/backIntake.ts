// Back pain intake question tree.
// Pure content — the intake engine renders these questions generically.
// See CLAUDE.md for rules on structured input vs. free text.

import { IntakeQuestion } from "../../types/intake";

export const backIntakeStartQuestionId = "diagnosisStatus";

export const backIntakeQuestions: IntakeQuestion[] = [

  // ----------------------------------------------------------
  // Q1 — Entry point (shared, routes to diagnosed or undiagnosed branch)
  // ----------------------------------------------------------
  {
    id: "diagnosisStatus",
    branch: "shared",
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
    type: "freeTextOnly",
    freeTextRequired: true,
    freeTextPlaceholder: "e.g. L4-L5 disc bulge, muscle strain, sciatica...",
    defaultNextQuestionId: "clearedForExercise",
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
      { id: "notCleared", label: "No / not yet" },
      { id: "notSure", label: "Not sure" },
    ],
  },
  {
    id: "painLocationDiagnosed",
    branch: "diagnosed",
    questionText: "Where do you feel it most?",
    type: "singleSelect",
    defaultNextQuestionId: "aggravatingFactorsDiagnosed",
    options: [
      { id: "lowerBack", label: "Lower back (around the waistline)" },
      { id: "midBack", label: "Mid back (between the shoulder blades)" },
      { id: "upperBack", label: "Upper back / base of neck" },
      { id: "movesAround", label: "It moves around / hard to pinpoint" },
    ],
  },
  {
    id: "aggravatingFactorsDiagnosed",
    branch: "diagnosed",
    questionText: "What tends to make it worse?",
    type: "singleSelect",
    defaultNextQuestionId: "currentPainDiagnosed",
    options: [
      { id: "sittingOrFlexion", label: "Sitting or bending forward" },
      { id: "standingOrExtension", label: "Standing for long periods or arching backward" },
      { id: "both", label: "Both" },
      { id: "nothingSpecific", label: "Nothing specific / it's fairly constant" },
    ],
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
    options: [
      { id: "lowerBack", label: "Lower back (around the waistline)" },
      { id: "lowerBackRadiating", label: "Lower back and it spreads into the buttock or leg" },
      { id: "midBack", label: "Mid back (between the shoulder blades)" },
      { id: "upperBack", label: "Upper back / base of neck" },
      { id: "movesAround", label: "It moves around / hard to pinpoint" },
    ],
  },
  {
    id: "aggravatingFactorsUndiagnosed",
    branch: "undiagnosed",
    questionText: "What tends to make it worse?",
    type: "singleSelect",
    defaultNextQuestionId: "redFlagChecklist",
    options: [
      { id: "sittingOrFlexion", label: "Sitting or bending forward" },
      { id: "standingOrExtension", label: "Standing for long periods or arching backward" },
      { id: "both", label: "Both" },
      { id: "nothingSpecific", label: "Nothing specific / it's fairly constant" },
    ],
  },
  {
    id: "redFlagChecklist",
    branch: "undiagnosed",
    questionText: "Do you currently experience any of the following?",
    type: "multiSelect",
    options: [
      { id: "legNumbness", label: "Numbness, tingling, or progressive weakness in one or both legs", nextQuestionId: "RED_FLAG_DETOUR", redFlagSeverity: "standard" },
      { id: "bladderBowel", label: "Any recent changes in bladder or bowel habits alongside your back pain", nextQuestionId: "RED_FLAG_DETOUR", redFlagSeverity: "urgent" },
      { id: "constantSevere", label: "Pain that is constant and severe, not relieved by any position or rest", nextQuestionId: "RED_FLAG_DETOUR", redFlagSeverity: "standard" },
      { id: "weightLoss", label: "Unexplained weight loss alongside the back pain", nextQuestionId: "RED_FLAG_DETOUR", redFlagSeverity: "standard" },
      { id: "fever", label: "Fever or feeling generally unwell alongside the back pain", nextQuestionId: "RED_FLAG_DETOUR", redFlagSeverity: "standard" },
      { id: "recentTrauma", label: "Recent serious trauma (major fall, car accident, direct blow to the spine)", nextQuestionId: "RED_FLAG_DETOUR", redFlagSeverity: "standard" },
      { id: "noneOfAbove", label: "None of the above", nextQuestionId: "dailyLimitationUndiagnosed" },
    ],
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
  },
];