# Regain — Screens & Design

Companion to `CLAUDE.md`. This file covers the visual/UX layer: every screen, its content, its connections, and the aesthetic. Read alongside `CLAUDE.md` (which has the data model, storage, gating, and AI flow that these screens sit on top of).

Copy marked "(placeholder OK)" can be rough for now and refined later — write something functional, not lorem ipsum. The red-flag detour copy, even as placeholder, MUST be functionally correct (must clearly tell the user to see a doctor) — it's the one screen where bad placeholder has real stakes.

---

## Aesthetic direction
Reference was a fitness-app Figma template, used for *vibe* only (its auth screens and light-mode screens do NOT apply — Regain has no accounts and is dark throughout, including any settings).

- **Theme**: dark throughout, no light mode anywhere
- **Background**: deep aubergine / dark plum — warm-dark, not cold-black or neutral-gray
- **Surfaces**: cards/widgets with soft pastel-like colors as a lighter elevated layer, separated by soft shadow, not hard borders — this is the "glassy" feel (not actual blur/transparency)
- **Shape**: fully rounded corners everywhere — inputs, buttons, cards, icon containers, nav bar. No sharp corners anywhere, by default, on every component
- **Widgets**: rounded, aesthetic, pastel-leaning accent fills (see color). The home screen especially should feel like nicely-designed rounded widgets, not a plain list
- **Typography**: rounded sans-serif; generous heading sizes; soft gray (not pure white) for secondary text; nothing condensed/sharp/jagged
- **Color**: NOT monotone — color is part of what makes it feel good, surfaced through accents/widgets/icons, not large flat fills.
  - Primary accent: muted, low-saturation **cyan** — active/selected/primary actions (primary buttons, selected option cards, active nav icon, progress indicators)
  - Secondary accent: a **warm pastel** (coral/amber/terracotta — designer's judgment) for celebratory/positive moments (level unlocked, encouragement). Never used for anything alarming
  - Same color = same meaning everywhere; no one-off per-screen accents
  - Red-flag/"see a doctor" messaging uses a distinct color, separate from both accents and from a true error-state red
- Exact hex values: finalize visually on device during build, not pre-specified

## Navigation
- **Home-centric, NO bottom bar** (decided/built after Step 5; reverses the earlier "persistent bar on every screen" instinct). The app is a single native stack with **Home as the hub** — Home lists all programs and the progress widgets, and is the only place you start a new program ("all roads lead home"). Every other screen is immersive and reached from Home. This is the deliberate move toward a fluid, uncluttered feel.
- **Unified header** (`components/ScreenHeader`) on every non-Home screen: **left = one step back** (previous screen / previous question) — shown only when the previous screen differs from Home; **right = Home**. Home itself has no header.
  - Intake's header = back-to-previous-question (left) + quit-to-Home with a confirm (right).
  - Program (saved), Exercise Detail, Check-in, Region Select carry the header; the preview Program keeps only Save/Redo; the red-flag detour keeps its own Home / Start-over buttons.
- Must fully support Android hardware/gesture back. Back mid-intake → previous question; back must never unexpectedly exit the app mid-flow.
- **Screen transitions**: on Android the native stack slide can flash white at the edge. Partly addressed (native root + stack `contentStyle` painted the plum background via `expo-system-ui`). Full transition polish is Step 7 — revisit `animation` options there if any flash remains.
- Icons in the header are text placeholders for now; Step 7's design-system pass swaps in a real icon set and may extract a `theme.ts` (colours/spacing currently live in `components/ScreenContainer`).

---

## Screens

### 1. Home (default landing, bottom nav visible)
The motivational dashboard. Two states:

**No programs yet (empty state):**
- Warm greeting + short intro to what Regain does (placeholder OK)
- Prominent primary button → Region Select ("Start" / "Tell us what's bothering you")

**Has one or more programs:**
- **Hero = quick-continue**: the most prominent element is a card (one per active program) showing region/issue label, current level + level name, and a primary "Continue" action → that program's Program screen. Quick-continue is the hero — most task-focused element on the screen.
- **Secondary = progress snapshot** (derived at render, never stored): neutral motivational counts, no streaks, no daily-pressure framing. Show e.g.: sessions logged in the last 7 days (count `sessionLog` entries across programs with dates in last 7 days), current level per program, total sessions for a program (length of its `sessionLog`). A light encouraging line is fine; never manufacture guilt or urgency. (placeholder OK on exact copy)
- Multiple programs → one quick-continue card each, stacked.

Connections: → New Issue (+ button / empty-state button), → Program (tap a program card).

### 2. Region Select (from "+")
- Two large tappable cards: **Back** and **Neck**, ideally aesthetic illustrations/images rather than plain text labels (asset sourcing required — acceptable to start with styled text/icon placeholders if images aren't ready)
- **Neck** shows a "coming soon" overlay/label and is not selectable into a real flow (scaffold only)
- Back arrow → Home

Connections: → Intake (select Back), ← Home.

### 3. Intake (single screen, multiple states — not many separate screens)
One component renders the current question and advances through the tree (logic in `utils/intakeEngine.ts`, content in `data/intake/backIntake.ts`).

- One question at a time: question text + the appropriate input —
  - `singleSelect` → option cards (selected state uses cyan accent)
  - `multiSelect` (red-flag checklist) → checkable list
  - `freeTextOnly` (diagnosis) → text field
- Free-text field present beneath options when allowed (most questions); absent on Q1
- **Progress indicator**: after Q1 the branch (diagnosed=5 / undiagnosed=5) is known, so set the bar/dots to that branch's length and advance proportionally. (Lengths are derived from the data, not hardcoded.) An early red-flag exit simply ends the flow — the bar doesn't need to predict it.
- Smooth transitions between questions; the flow should *feel* conversational/calm, one thing at a time
- Continue control (disabled until a required option is chosen on logic-driving questions; free-text-only questions require text); back control → previous question

Connections: → itself (next question), → Red-Flag Detour (`RED_FLAG_DETOUR`), → Loading then Program (`COMPLETE`), ← previous question.

### 4. Loading / Generating (brief, between intake completion and Program)
- A styled, reassuring wait state ("Putting together your program…") covering the two AI calls (placeholder OK on copy)
- Not a bare spinner — should feel intentional
- On success → Program; on failure → Program anyway, using fallbacks (Level 1 + all exercises). Never blocks or errors out.

Connections: → Program.

### 5. Red-Flag Detour (from intake if any red flag selected)
- **Purely informational. No exercises. No program created. Nothing stored.**
- Clear, non-alarming explanation that we'd recommend seeing a doctor before starting, and why
- Two copy variants by severity: `standard` ("we'd recommend seeing a doctor before starting exercises") vs. `urgent` (triggered by the bladder/bowel item — stronger: "please seek medical attention promptly, don't wait"). (placeholder OK, but MUST correctly convey "see a doctor")
- Uses the distinct red-flag color, not the positive accents
- Path back to Home (and an option to start over)

Connections: ← Home / start over.

### 6. Program (the working hub for one program)
- Top: issue/region label + current level + level name (from `LevelInfo`)
- Levels laid out: current/active level emphasized; future locked levels visible but locked (clear locked affordance); earlier levels shown as completed/skipped (visible, with note that their exercises remain available)
- Each level lists its **exercise names only** — no descriptions, not cluttered. Names come from looking up `selectedExercises` IDs against `backProgram.ts`
- **Logging**: a single one-tap action ("Log today's session" / "I did this") → opens Check-in. No guided session player (deferred to V2). User does exercises on their own, referencing detail screens.
- **Progress section** lives within this screen (not a separate nav destination): session history / levels reached for this program, derived from `sessionLog`
- If started above Level 1: the skip disclaimer shows here

Connections: → Exercise Detail (tap exercise), → Check-in (log action), ← Home.

### 7. Exercise Detail (from Program)
- Single exercise: name, description (how to perform), purpose (why it helps), sets/reps/hold framed as starting guidance ("start here, adjust as needed"), and a "Watch" video link button if `videoUrl` is present (hidden/disabled if null)
- Note equipment need (e.g. resistance band) where relevant
- Back → Program

Connections: ← Program.

### 8. Check-in (from Program's log action)
- Three short questions about the session just done: **pain during**, **pain after**, and **how did it feel** (too easy / about right / too hard). Fast selectable chips, feeding the stored `sessionLog` entry. No speculative "are you ready?" toggle — see gating design in CLAUDE.md.
- On submit: append entry to `sessionLog`, write to storage, run gating (`utils/gating.ts`).
- If the behavioural gate is satisfied: show an **informed offer** ("you seem ready — unlock Level N?") with accept / not-yet. On accept → unlock + a brief celebratory "level unlocked" moment using the warm secondary accent.
- If not ready: a short, encouraging "session logged" confirmation. If pain has been high across recent sessions, include a gentle "consider seeing a professional" nudge.
- Returns to Program (progress reflected).

Connections: → Program (with possible level-unlock moment).

---

## Components (reusable, built)
- `OptionCard` (single/multi select, with cyan selected state)
- `ScreenHeader` (unified back-left / Home-right header; replaced the old BottomNav)
- `StatTile` (calm Home progress-reflection tile)
- `ProgressDots` (intake step progress)
- `ProgramCard` (home program list + quick-continue)
- `LevelSection` (program screen, with locked/active/completed states)
- `PrimaryButton` (rounded, cyan fill)
- `LoadingState` (the generating screen)
- Building these is straightforward; the real work is tuning feel on-device — expect iteration in the polish pass.