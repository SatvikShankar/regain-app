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
- **Anthropic API** for two bounded post-intake calls (see AI Agent Flow): Haiku 5.5 for level classification, Sonnet 5.5 for exercise selection. Called via plain `fetch`, deliberately not the Anthropic SDK (robustness under Metro/React Native). API key in `.env`, which must be in `.gitignore` before the key is ever written. Note: a key in the app bundle is extractable — before distributing an APK, route calls through a small server-side proxy
- **UI stack**: Reanimated (UI-thread animation), react-native-svg + lucide-react-native (icons, future charts), expo-font + Figtree, expo-haptics. Decisions are made as for a shipped standalone app (EAS/Gradle build), not for Expo Go convenience; Expo Go is only the current test harness
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
│   ├── exercise.ts         → Exercise, ExerciseSelection, LevelInfo
│   ├── region.ts           → RegionInfo, RegionCopy, RegionContent, RegionDefinition
│   └── program.ts          → StoredProgram, SessionLogEntry, LevelEvent, Profile (+ schema versions)
├── data/regions/           → ALL region content; nothing outside this folder is region-specific
│   ├── index.ts            → the registry: the one list of regions (order = Region Select order)
│   ├── back/               → built: intake.ts, exercises.ts (flat list), levels.ts, copy.ts, index.ts
│   └── neck/               → scaffold only ("coming soon"): index.ts with display info, no content
├── state/programStore.ts   → Zustand store: the in-memory programs every screen reads/writes
├── theme/                  → design tokens: colors (palette + semantic + tones), spacing/radii, typography, motion
├── screens/                → PascalCase, one screen per file
├── components/             → domain UI pieces (ProgramCard, LevelSection, …)
│   ├── primitives/         → base building blocks: Screen (+ ScreenBackground glow), AppText, Card, Button, Chip, SegmentedControl,
│   │                         TextField, Dialog, Icon, IconBadge, IconButton, PressableScale, FadeIn
│   └── illustrations/      → region artwork keyed by region id (placeholders, swappable)
├── navigation/
└── utils/
    ├── ai/                 → client.ts (transport, the one file to repoint at a proxy), context.ts (TOON prompt
    │                         context), levelCall.ts, selectionCall.ts, generateProgram.ts (runs both in parallel)
    ├── regionContent.ts    → read-only access to the registry (getRegion, getRegionContent, findExercise, …)
    ├── intakeEngine.ts     → generic tree-walking logic
    ├── programHelpers.ts   → everything derived from a program (name, working/unlocked levels, status)
    ├── storage.ts          → AsyncStorage read/write (the only file touching the device store)
    ├── storageMigrations.ts→ upgrades older stored shapes on read
    ├── haptics.ts          → haptic feedback wrapper
    └── gating.ts           → level-unlock logic
```
Unit tests (Jest, `npm test`) sit beside the file they test as `*.test.ts`.

**Adding a region:** create `data/regions/<id>/` mirroring `back/`, add it to `data/regions/index.ts`. No screen or util changes.

## Design-system rules
- Screens/components never use hex values, raw font sizes or ad-hoc spacing — only tokens from `theme/` (`colors.*`, `spacing.*`, `radii.*`, `<AppText variant>`)
- Third-party UI choices sit behind one wrapper each (icons → `primitives/Icon`, haptics → `utils/haptics`, entrances → `primitives/FadeIn`) so they can be swapped in one file
- Every tappable surface builds on `PressableScale` (spring press feedback); every screen on `Screen` (safe areas, gutter, pinned footer)
- Custom fonts need `fontFamily` per weight on Android — use typography tokens, never bare `fontWeight`

## MVP Scope
- **Two regions: Back (full content, Levels 1–3) and Neck (scaffold only — selectable but "coming soon," no real content).** Build Back first.
- **Shared engine, region-specific data.** Intake mechanism, progression logic, and rendering are generic and built once. Each region supplies its question tree and program as data. Never duplicate the mechanism per region.
- Intake is a **hand-authored deterministic branching tree**, not AI-generated.
- **Red-flag detour is purely informational** — a screen telling the user to see a doctor and why (standard / urgent / not-cleared copy variants). NO exercises, NO safe-movement content. From the questionnaire: no program is created and nothing is persisted. From a check-in safety re-check: the existing program is kept (inform only).
- Optional stretch goal: AI intake summarization at end of flow. Never let it block core functionality.

## Intake tree mechanics
- Types in `types/intake.ts`; content in `data/regions/{region}/intake.ts`; generic engine in `utils/intakeEngine.ts`
- Routing order for each answer (first match wins): (1) a selected option with a `detour` (warning sign) → doctor screen; (2) a `route` to `RED_FLAG_DETOUR` whose conditions ALL hold (a combination of answers — can fire even after "None of the above"); (3) the option's `nextQuestionId`; (4) the first other `route` whose conditions hold (routes can read EARLIER answers); (5) `defaultNextQuestionId`; (6) `COMPLETE`
- Free text available by default; `disableFreeText: true` turns it off (only on Q1). `freeTextPlaceholder` only set when it differs from a sensible default
- **Hard rule**: routing and red-flag detection read ONLY selected options, NEVER free text. Free text is captured/stored/shown back to the user but never drives logic
- `introText` = an optional calm line shown ABOVE a question, never part of it
- `exclusive: true` marks "None of the above" (selecting it clears the others, and vice versa)
- Detour reasons (`DetourReason`): `standard` (see a doctor first), `urgent` (seek care promptly; the screen lists the items ticked), `notCleared` (come back once cleared)
- Progress "N of M" = path so far + the longest way it could still go (`estimateTotalQuestions`) — derived, never hardcoded
- **Audit test** (`utils/intakeTree.test.ts`) walks every answer path of every region and FAILS if any path reaches a program without the warning-sign checklist, if any target doesn't exist, or if any checklist item lacks a doctor route. Never weaken it to make a content edit pass

### Back intake tree (signed off 24 Oct 2026)
- **Q1 (shared):** diagnosed / seen-but-unclear / not-seen. No free text. Diagnosed → diagnosed branch; other two → undiagnosed branch.
- **Diagnosed branch (7 incl. Q1):** what were you diagnosed with (choice list + optional details) → cleared for exercise? (**"No / not yet" → doctor, notCleared**) → where do you feel it most → what makes it worse → **warning-sign checklist** → current pain → COMPLETE. **"Not sure" cleared + "Significant" pain → doctor (standard).**
- **Undiagnosed branch (6 incl. Q1):** onset → where do you feel it most → what makes it worse → **warning-sign checklist** → daily limitation → COMPLETE. **Sudden-injury onset + "Significantly" limited → doctor (standard).**
- Both branches share ONE location option list (lower / lower spreading to buttock or leg / mid / upper / upper spreading to shoulder or arm / moves around) and ONE checklist — no lower-back assumption from a diagnosis.
- Checklist (shared, also re-asked after check-ins): leg numbness/weakness, arm/hand numbness/weakness, bladder/bowel changes (**urgent**), chest pain or breathing difficulty (**urgent**), constant severe pain, unexplained weight loss, fever/unwell, cancer history, recent serious trauma; "None of the above" is exclusive.
- Content still needs a clinician's review before real users.

## AI Agent Flow (runs AFTER intake completes and red flags cleared)
Two independent, parallel API calls (Haiku 5.5 for level at low effort, Sonnet 5.5 for selection at medium effort, with server-side refusal fallback). Neither needs the other's output. Both are bounded and non-conversational. NOT involved in red-flag detection (that already happened deterministically). Prompt text is to be drafted/refined by Satvik later — for now, implement the wiring, inputs, outputs, and fallbacks; placeholder prompts are fine.

**Call 1 — Level Classification**
- Context passed: the full intake as TOON (each row = question wording, chosen answer wording, the user's free-text note) + the region's level names/goals
- Returns: a single level number, capped at `MAX_START_LEVEL` (2) — a questionnaire alone never starts someone at the top level
- Fallback: the lowest level on any failure or unexpected output

**Call 2 — Exercise Selection**
- Context passed: the intake (as above) + the region's exercise catalog as ONE TOON table with only the AI-relevant fields (id, level, areas, equipment, indicatedFor). Descriptions/purpose/sets are user-facing and never sent. Does NOT receive Call 1's output
- The system prompt + catalog are a cache breakpoint (Anthropic prompt caching, per region; a different region = a different prefix, so caches never mix)
- Returns: exercise IDs per level, `MIN_PER_LEVEL`–`MAX_PER_LEVEL` (4–6) each, matched to where the user feels it, across ALL levels
- Validation: unknown IDs dropped silently, each ID regrouped by its real level, each level capped at the max. Fallback: a level left empty (or a failed call) gets all of that level's exercises
- Dev builds log every fallback reason and token/cache usage to the terminal (`[Regain AI]`)

**Loading state**: a brief, styled "putting together your program" screen covers the call duration. On total failure, fall through to fallbacks (Level 1 + all exercises) rather than blocking or erroring.

**If classified above Level 1**: levels up to and including the assigned level are unlocked at generation; lower levels show as "completed/skipped" (visible, not hidden) with a disclaimer that earlier exercises remain available; gating governs only levels beyond the assigned start.

## Exercise & program data model
Types in `types/exercise.ts`. A region's exercises are ONE flat list (one row per exercise, database-ready); level is a field:
```typescript
export interface Exercise {
  id: string;              // referenced by saved programs — never rename
  name: string;
  level: number;
  areas: string[];         // sub-locations; vocabulary per-region (Back: "lower"|"mid"|"upper"|"general")
  equipment: string[];     // [] = none, e.g. ["resistanceBand"]
  indicatedFor: string;    // AI-facing: terse, when appropriate
  description: string;     // user-facing: how to perform
  purpose: string;         // user-facing: why it helps (shown on detail screen)
  videoUrl: string | null; // curated YouTube link, sourced manually later (currently null)
  sets: number;
  reps: number;
  holdSeconds: number | null;
}
export type ExerciseSelection = { [level: number]: string[]; };     // level → selected IDs
export interface LevelInfo { name: string; goal: string; }
```
- `areas` is intentionally `string[]`, not a constrained enum — sub-location vocabulary differs per body part; deliberate MVP simplification, don't "fix" without a real decision
- An exercise can span regions (e.g. `["mid","upper"]`)
- `sets`/`reps`/`holdSeconds` are default/starting guidance, not personalized prescriptions — frame as such in UI ("start here, adjust as needed")
- `indicatedFor` (AI-facing) and `purpose` (user-facing) are deliberately separate — don't collapse them

## Storage model (AsyncStorage)
Key-value store, survives app closes. Store JS objects as JSON strings; read/parse on open; write on every meaningful change so nothing is lost between sessions.

**One object per program (user may have several, even multiple for the same region):**
- Key: `program:{region}:{uniqueId}` (uniqueId = generation timestamp, e.g. `program:back:1719345600000`)
- Value (`StoredProgram` in `types/program.ts`):
```
{
  schemaVersion, id, region, customName?,   // customName only after a Rename
  intakeResult,
  assignedStartLevel,            // from Call 1
  selectedExercises,             // from Call 2 — IDs only, full details looked up from region data at render
  levelEvents: [ { type, level, date }, ... ],   // unlocked | switched | offerDeclined | easeOffDeclined | safetyCheck
  sessionLog: [ { date, level, painDuring, painAfter, difficulty, gentle? }, ... ]
}
```
- Current level and unlocked levels are DERIVED from `assignedStartLevel` + `levelEvents` (`utils/programHelpers.ts`), never stored
- `selectedExercises` stores IDs only; content edits propagate to existing programs automatically
- A `profile` key holds `{ schemaVersion, name?, onboardedAt? }`
- **Schema changes:** bump the schema constant in `types/program.ts` and add an upgrade step in `utils/storageMigrations.ts`; old records upgrade on read
- **In memory:** `state/programStore.ts` loads everything once at startup (behind the splash screen); screens read and write through it, and it persists via `utils/storage.ts`. Moving to a backend later = reimplementing `storage.ts`
- Red-flagged users: nothing is stored (no program object created).

## Progression gating (`utils/gating.ts`)
A check-in = one entry appended to `sessionLog` (date + painDuring, painAfter ("pain right after"), difficulty). Gentle-day sessions carry `gentle: true`. Duplicate same-day logs are allowed (eases testing — deliberately no time-spacing rule yet).

**Design principle:** readiness is INFERRED from behaviour, not asked as a speculative "are you ready?" toggle. The check-in only asks about the session just done; the app computes readiness and surfaces an *informed* opt-in. **Never force-advance or force-retreat.**

After each check-in, in order:
1. **Safety re-check** — the last 2 sessions both had "significant" pain (during or after) → re-ask the warning-sign checklist (once per new streak; recorded as a `safetyCheck` event). Any item → doctor screen, worded for an existing program (the program is kept; inform only).
2. **Offer the next level** when ALL hold, counting only non-gentle sessions at the working level since the user last arrived at it:
   - at least `MIN_SESSIONS_AT_LEVEL` (4) sessions;
   - in the last `RECENT_WINDOW` (3): no "significant" pain, at most one "moderate", and the most recent is none/mild;
   - effort: at least 2 of the 3 "too easy", OR all 3 "about right"/"too easy" with only none/mild pain;
   - after a "not yet" (`offerDeclined` event), wait `SESSIONS_AFTER_DECLINE` (2) more sessions.
   Accept → `unlocked` event (or `switched` if returning to an already-unlocked level) + warm "level unlocked" moment.
3. **Offer to ease off** — 2 of the last 3 sessions at this level were a struggle ("too hard" or moderate+ pain) and there's a level below → "Want to ease off a little?". Accept → `switched` to the level below (the higher level stays unlocked); decline → `easeOffDeclined`, wait 2 sessions.
4. **Pain nudge** — the last 3 sessions all moderate+ pain → a gentle "consider seeing a professional" note (companion, never diagnosis).

Gentle sessions never count toward or against moving levels, but DO count for 1 and 4 (pain is pain). All thresholds are named constants at the top of the file; `utils/gating.test.ts` covers every rule.

## Core user journey
Home → Start a new program → Region Select (Back / Neck coming soon) → Questionnaire (branching) → either See-a-doctor (informational, ends here) OR Generating → **program saved automatically** → Program (first visit: "Saved to your programs" + Redo) → Exercise Detail / Check-in → gating → progress reflected on Home & Program. No preview/Save step; no Home button in headers — back from a first-level screen leads Home. Custom dialogs (`primitives/Dialog`) replace the platform alert everywhere.

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