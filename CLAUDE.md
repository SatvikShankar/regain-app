# Regain — Project Context

## What this is
**Regain**: a React Native (Expo) mobile app — a staged recovery app for back and neck pain. Portfolio project for PM job applications. It is an **exercise companion, not a diagnostic or treatment tool** — never suggest features, copy, or logic implying medical diagnosis.

Screen-level detail (layout, content, connections, aesthetic) lives in `SCREENS.md`. Read it before building any UI.

## Timeline & approach
2–3 day MVP. Prioritize working, simple, demonstrable functionality over architectural elegance. Don't over-engineer. Default to the fast path; flag tradeoffs briefly. The goal right now is "something working," then refinement.

## Tech stack (fixed)
- React Native + Expo, **TypeScript**
- AsyncStorage for local persistence — no backend, no server, no accounts/auth
- Testing via Expo Go on Android (Samsung S24+); use Expo SDK 54 — this matches the installed Expo Go version
- **Anthropic API, Claude Haiku model**, for two bounded post-intake calls (see AI Agent Flow). API key in `.env`, which must be in `.gitignore` before the key is ever written
- No local model (would require a de facto backend)
- If a backend is added later: separate repo (`regain-api`), not a monorepo
- All navigation must work with Android hardware/gesture back (e.g. back during intake → previous question, not app exit) — wire this deliberately, don't leave default behavior

## Code conventions
- camelCase default everywhere; PascalCase only for component files/names (standard React convention)
- No underscores/kebab-case in file or folder names
- One concern per file; avoid large multi-purpose files
- Content/data files must stay readable and editable by Satvik without understanding surrounding logic — a real constraint, not a nice-to-have
- File-top comments explaining intent > line-by-line comments
- Store raw facts (e.g. session log entries); derive displays (counts, snapshots) at render time — never store derived/computed numbers, they go stale

## Folder structure
```
regain-app/
├── types/                  → shared contracts only, no content
│   ├── intake.ts           → IntakeQuestion, IntakeOption, IntakeResponse, IntakeResult
│   └── exercise.ts         → Exercise, ExerciseProgram, ExerciseSelection, LevelInfo
├── data/
│   ├── intake/
│   │   ├── backIntake.ts   → built; backIntakeQuestions + backIntakeStartQuestionId
│   │   └── neckIntake.ts   → scaffold only ("coming soon")
│   └── programs/
│       ├── backProgram.ts  → built; backProgram + backLevelInfo (Levels 1–3)
│       └── neckProgram.ts  → scaffold only
├── screens/                 → PascalCase, one screen per file
├── components/               → reusable UI pieces
├── navigation/

└── utils/
    ├── aiAgentCalls.ts      → the two API calls + fallbacks
    ├── intakeEngine.ts      → generic tree-walking logic
    ├── storage.ts           → AsyncStorage read/write helpers
    └── gating.ts            → level-unlock logic
```

## MVP Scope
- **Two regions: Back (full content, Levels 1–3) and Neck (scaffold only — selectable but "coming soon," no real content).** Build Back first.
- **Shared engine, region-specific data.** Intake mechanism, progression logic, and rendering are generic and built once. Each region supplies its question tree and program as data. Never duplicate the mechanism per region.
- Intake is a **hand-authored deterministic branching tree**, not AI-generated.
- **Red-flag detour is purely informational** — a screen telling the user to see a doctor and why (standard vs. urgent copy variants). NO exercises, NO safe-movement content, NO stored program. Nothing is persisted when a user is red-flagged.
- Optional stretch goal: AI intake summarization at end of flow. Never let it block core functionality.

## Intake tree mechanics
- Types in `types/intake.ts`; content in `data/intake/{region}Intake.ts`
- Each question has `defaultNextQuestionId`; individual options override it only when they branch differently (Q1, red-flag checklist)
- Free text available by default; `disableFreeText: true` turns it off (only on Q1). `freeTextPlaceholder` only set when it differs from a sensible default
- **Hard rule**: branching and red-flag detection read ONLY the selected option, NEVER free text. Free text is captured/stored/shown back to the user but never drives logic
- `freeTextOnly` questions (diagnosis) can be the sole input, no option required
- Special `nextQuestionId` values: `"COMPLETE"` (intake done → AI flow) and `"RED_FLAG_DETOUR"` (→ detour screen)

### Back intake tree (built, locked)
- **Q1 (shared):** diagnosed / seen-but-unclear / not-seen. No free text. Diagnosed → diagnosed branch; other two → undiagnosed branch.
- **Diagnosed branch (5 q):** diagnosis (free-text only) → cleared for exercise? → pain location (lower/mid/upper/moves) → aggravating factors (flexion/extension/both/constant) → current pain (minimal/moderate/significant) → COMPLETE. No red-flag checklist (already professionally screened).
- **Undiagnosed branch (5 q):** onset → pain location (+ "spreads into buttock/leg" option) → aggravating factors → **red-flag checklist** (multiselect; any non-"none" → detour; `bladderBowel` item carries `urgent` severity, all others `standard`) → daily limitation → COMPLETE.

## AI Agent Flow (runs AFTER intake completes and red flags cleared)
Two independent, parallel API calls (Claude Haiku). Neither needs the other's output. Both are bounded and non-conversational. NOT involved in red-flag detection (that already happened deterministically). Prompt text is to be drafted/refined by Satvik later — for now, implement the wiring, inputs, outputs, and fallbacks; placeholder prompts are fine.

**Call 1 — Level Classification**
- Context passed: the full `IntakeResult` object (branch + all Q&A: questionId, selectedOption, freeText per question), serialized to a readable form in the prompt
- Returns: a single level number from the set the program defines (not hardcoded to 3)
- Fallback: Level 1 on any failure or unexpected output

**Call 2 — Exercise Selection**
- Context passed: the full `IntakeResult` object + the full exercise pool for the region (the `backProgram` object, serialized via JSON.stringify). Does NOT receive Call 1's output
- Returns: an `ExerciseSelection` — exercise IDs per level, across ALL levels (the user will reach all of them over time)
- Fallback: return all exercises in each level, unfiltered. Validate every returned ID exists in the pool; silently drop hallucinated IDs

**Loading state**: a brief, styled "putting together your program" screen covers the call duration. On total failure, fall through to fallbacks (Level 1 + all exercises) rather than blocking or erroring.

**If classified above Level 1**: levels up to and including the assigned level are unlocked at generation; lower levels show as "completed/skipped" (visible, not hidden) with a disclaimer that earlier exercises remain available; gating governs only levels beyond the assigned start.

## Exercise & program data model
Types in `types/exercise.ts`:
```typescript
export interface Exercise {
  id: string;
  name: string;
  region: string[];        // sub-locations; vocabulary per-region (Back: "lower"|"mid"|"upper"|"general")
  indicatedFor: string;    // AI-facing: terse, when appropriate
  description: string;     // user-facing: how to perform
  purpose: string;         // user-facing: why it helps (shown on detail screen)
  videoUrl: string | null; // curated YouTube link, sourced manually later (currently null)
  sets: number;
  reps: number;
  holdSeconds: number | null;
}
export interface ExerciseProgram { [level: number]: Exercise[]; }   // dynamic level count
export type ExerciseSelection = { [level: number]: string[]; };     // level → selected IDs
export interface LevelInfo { name: string; goal: string; }
```
- `region` is intentionally `string[]`, not a constrained enum — sub-location vocabulary differs per body part; deliberate MVP simplification, don't "fix" without a real decision
- An exercise can span regions (e.g. `["mid","upper"]`)
- `sets`/`reps`/`holdSeconds` are default/starting guidance, not personalized prescriptions — frame as such in UI ("start here, adjust as needed")
- `indicatedFor` (AI-facing) and `purpose` (user-facing) are deliberately separate — don't collapse them
- Some exercises require a resistance band; this is noted in their `indicatedFor`/`description`. An explicit `equipment` field could be added later if the UI needs to surface it distinctly — not required for MVP

## Storage model (AsyncStorage)
Key-value store, survives app closes. Store JS objects as JSON strings; read/parse on open; write on every meaningful change so nothing is lost between sessions.

**One object per program (user may have several, even multiple for the same region):**
- Key: `program:{region}:{uniqueId}` (uniqueId = generation timestamp, e.g. `program:back:1719345600000`)
- Value:
```
{
  region, intakeResult,
  assignedStartLevel,            // from Call 1
  selectedExercises,             // from Call 2 — IDs only, full details looked up from data file at render
  currentLevel,
  unlockedLevels,                // [1..assignedStartLevel] at generation
  sessionLog: [ { date, level, painDuring, painAfter, difficulty }, ... ]
}
```
- `selectedExercises` stores IDs only; full exercise content is always looked up from `backProgram.ts` at render, so content edits propagate to existing programs automatically and stored objects stay tiny (KBs even after heavy use)
- **Lookup**: on app open, get all keys with prefix `program:`, parse each → the user's program list. Home screen renders from this list (none → empty state; one+ → a card each).
- Red-flagged users: nothing is stored (no program object created).

## Progression gating (`utils/gating.ts`)
A check-in = one entry appended to `sessionLog` (date + the 3 answers: painDuring, painAfter, difficulty). Runs after every check-in. Duplicate same-day logs are allowed (eases demoing — lets a level be unlocked on the spot).

**Design principle:** readiness is INFERRED from behaviour, not asked as a speculative "are you ready?" toggle (users click yes blindly). The check-in only asks about the session just done. The app computes readiness from the log, then surfaces an *informed* opt-in offer only once the criteria are met — an earned confirmation, not a blind one.

Offer to unlock the next level when ALL hold (for the current level = highest unlocked):
- at least `MIN_SESSIONS_AT_LEVEL` (3) sessions have been logged at this level, AND
- the most recent `RECENT_WINDOW` (2) sessions report manageable pain — both painDuring and painAfter within `ACCEPTABLE_PAIN` ("none"/"mild"), AND
- those same recent sessions report the level as `READY_DIFFICULTY` ("tooEasy") — an honest, retrospective signal that they've outgrown it.

When met, present the offer ("you seem ready — move up to Level N?"). The user's tap is the affirmative opt-in — **never force-advance**. On accept: append next level to `unlockedLevels`, set `currentLevel`, show a "level unlocked" moment (warm accent), write to storage.

All thresholds (`MIN_SESSIONS_AT_LEVEL`, `RECENT_WINDOW`, `ACCEPTABLE_PAIN`, `READY_DIFFICULTY`) are named constants at the top of the file — easily editable.

**Safety nudge:** if the last `SAFETY_WINDOW` (3) sessions consistently report moderate/significant pain, surface a gentle "consider seeing a professional" message (companion, never diagnosis).

Gating only governs levels beyond `assignedStartLevel`; lower levels stay available as skipped.

## Core user journey
Home → "+" New Issue → Region Select (Back / Neck-comingsoon) → Intake (branching) → either Red-Flag Detour (informational, ends here) OR Loading → Program → Exercise Detail (on tap) / Check-in (one-tap log → 3 questions) → gating updates → progress reflected on Home & Program.

## Working with Satvik
- Comfortable directing product/scope; newer to React Native/Expo and agentic coding tools — explain non-obvious technical choices briefly
- Batch trivial changes, show diffs; flag real architectural/scope decisions before acting
- If this file conflicts with an in-session request, ask rather than silently picking
- Be honest if something will blow the timeline
- Build incrementally (see build order), not the whole app in one shot — verify each piece on device before moving on
- A separate decisions log with full reasoning lives in Google Docs (not this repo); this file is current-state-only — update in place, don't preserve history

## Build order
1. Skeleton + navigation + folder structure; confirm it runs in Expo Go (empty screens OK)
2. Region Select + Intake engine (drive the Back tree end to end, including detour)
3. AI agent flow wiring (placeholder prompts, real fallbacks)
4. Program + Exercise Detail screens
5. Check-in + gating + storage
6. Home dashboard (derived snapshot)
7. Polish/animation pass — budget real time
8. Scaffold Neck as "coming soon"
9. (Later, by Satvik) refine AI prompts, detour copy, home copy; source video links; optional AI summarization

## Future direction — AI scope (not MVP; do not build toward by default)
- MVP intake is a deterministic hand-authored tree because it's auditable (every red flag guaranteed asked); live AI extraction is probabilistic and fails silently on a miss — unacceptable in the safety-critical path
- V2: AI-assisted tree *authoring* for new regions, with human review/approval ONCE per region before shipping (not live, not per-user). After approval it runs deterministically like Back's does today
- Any future live-AI in intake = explanation/synthesis only, never question-selection or red-flag detection. Expanding AI into the safety path requires an explicit, deliberate decision