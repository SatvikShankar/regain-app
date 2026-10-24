// Region contract. Everything the generic engine needs to run a body region
// lives behind this shape, so adding a region = adding a data/regions/<id>/
// folder and one registry row — no screen or util changes.

import type { IconName } from '../components/primitives/Icon';
import { Exercise, LevelInfo } from './exercise';
import { IntakeQuestion } from './intake';

// Display info — every region has this, including "coming soon" ones.
export interface RegionInfo {
  id: string;            // matches program.region and the storage key segment
  label: string;
  subtitle: string;
  icon: IconName;
  available: boolean;    // false = shown as "Coming soon", not selectable
}

// Region-specific wording used by generic screens and prompts.
export interface RegionCopy {
  programName: string;          // e.g. "Back Recovery" (date is appended at render)
  conditionNoun: string;        // e.g. "back pain" — used in AI prompts
  areaVocabulary: string;       // describes the `areas` values for the AI
}

// Full content — only regions that are actually built have this.
export interface RegionContent {
  intake: {
    startQuestionId: string;
    questions: IntakeQuestion[];
    safetyCheckQuestionId: string; // the warning-sign checklist, re-asked after repeated significant pain
  };
  exercises: Exercise[];
  levels: { [level: number]: LevelInfo };
  copy: RegionCopy;
}

export interface RegionDefinition extends RegionInfo {
  content?: RegionContent;
}
