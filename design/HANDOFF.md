# Regain UI redesign — handoff for Claude Code

> **This `design/` folder is temporary.** It exists only to hand the redesign over to Claude Code. Once the redesign is built and Satvik has signed it off, delete the whole folder and remove the pointer to it in `CLAUDE.md`. Do not import from it, reference it from app code, or treat it as a permanent source of truth. Anything worth keeping long-term belongs in `theme/`, `SCREENS.md` or `CLAUDE.md`.

Designed 21 Oct 2026 on a Claude design canvas, from Satvik's brief. Satvik has approved the overall direction. He will give you more inputs directly, and **his inputs override anything in this folder**.

## How to use this folder

1. Read this file fully first.
2. Then read every file in `design/mockups/`. Each one is a static HTML mockup of one screen and state at 412 × 915 (Samsung S24+). Read them as specs: exact hex values, font sizes, line heights, radii, padding and copy are inline in the markup. They're HTML/CSS, not React Native, so translate them; don't port them literally.
3. Open `Critique.html`, `Tokens.html` and `Components.html` in a browser for a rough visual preview (the `support.js` script tag will 404; ignore it).
4. Before writing code, produce a screen-by-screen plan and check it with Satvik, per the "Working with Satvik" section of `CLAUDE.md`.

**Conflicts:** where this redesign disagrees with `SCREENS.md` or `CLAUDE.md` (flow, font, screen list), don't pick silently. List the conflicts and ask Satvik. The known ones are under "Known conflicts" at the end.

## File map

| File | Screen · state |
|---|---|
| `Critique.html` | Flow critique, recommended changes, updated flow diagram |
| `Tokens.html` | Colour, type, radii, spacing, depth, motion tokens |
| `Components.html` | Every component with its states (buttons, option cards, chips, segmented control, inputs, headers, progress, cards, level rows, dialogs, icons) |
| `OnboardingName.html` | 0 · Welcome, name (NEW, first launch only) |
| `HomeEmpty.html` | 1 · Home, no programs |
| `Home.html` | 1 · Home, with one program |
| `HomeEdge.html` | 1 · Home, 3 programs, long names, ⋮ menu open (scrolled state) |
| `Settings.html` | 9 · Settings (NEW, not urgent) |
| `RegionSelect.html` | 2 · Region select |
| `QuestionSingle.html` | 3 · Single choice, nothing selected (Continue disabled) |
| `QuestionNote.html` | 3 · Single choice + optional note |
| `QuestionText.html` | 3 · Free text only |
| `QuestionChecklist.html` | 3 · Warning-sign multi-select ("None of the above" selected) |
| `Generating.html` | 4 · AI step |
| `DoctorStandard.html` | 5 · See a doctor, standard |
| `DoctorUrgent.html` | 5 · See a doctor, urgent |
| `ProgramNew.html` | 6 · Program, just created (REPLACES Preview + Save) |
| `Program.html` | 6 · Program, saved, started at Level 2 (Level 1 skipped) |
| `ProgramEdge.html` | 6 · Program, long name in collapsed header, level with 8 exercises |
| `ExerciseNoVideo.html` | 7 · Exercise detail as bottom sheet, no video |
| `ExerciseVideo.html` | 7 · Exercise detail, video link + equipment tag |
| `CheckIn.html` | 8 · Check-in as bottom sheet |
| `SessionLogged.html` | 8 · Session logged + caution nudge |
| `ReadyOffer.html` | 8 · "You're moving well" level offer |
| `LevelUnlocked.html` | 8 · Level unlocked (warm moment) |
| `GentleDay.html` | 10 · Gentle day sheet (NEW) |

Sample user name "Meera" and dates are illustrative. All exercise and question copy comes from `data/`; use the data files, never copy text out of the mockups.

## Flow changes vs. the current app

1. **Home is a dashboard.** The hero card is the most recently used program, with a one-tap "Log today's session". With one program there's no separate list; with 2+ the others stack under "Other programs".
2. **Check-in is a bottom sheet**, opened from Home or Program. On submit → Session logged or Ready offer, then back to wherever Log was tapped.
3. **Preview + Save is removed.** The program is saved when generation finishes; the user lands on Program and nothing starts automatically. The first visit shows a "Saved to your programs" banner with "Not quite right? Redo the questions" (confirm → delete this program → Region select).
4. **Exercise Detail is a bottom sheet** over Program. Level rows expand in place (one open at a time; current open by default).
5. **No bottom bar** and no "Home" header button. Back from first-level screens goes to Home. Leave room for a future Today · Progress · Exercises · Ask bar, hidden on immersive screens.
6. **Name on first launch** (skippable) → greeting "Good evening, Meera".
7. **Gentle day sheet** from a "Rough day?" card on Home: 3–4 Level 1 exercises from the program, plus "Log a gentle session".
8. **Settings** (gear on Home): name, opt-in reminders, export data, delete all data, About.
9. **Program deletion:** ⋮ button on every program card and in the Program header (Rename / Delete), plus long-press. Delete always confirms.
10. **No gym tracking.**

## Tokens (put these in `theme/`)

**Colours**
| Token | Value | Use |
|---|---|---|
| bg | `#161118` | Screen ground. Optional top glow: radial `#2A1C2E` → bg (most screens) |
| surface1 | `#211A24` | Cards, sheets, icon buttons |
| surface2 | `#2B2230` | Chips, inputs, rows inside cards, dialogs |
| surface3 | `#372C3D` | Tracks, progress background, pressed secondary |
| surfaceHeader | `#1B151E` | Collapsed header on scroll |
| handle | `#4A3D50` | Sheet handle; "skipped/passed" level segment |
| radioOff | `#6E6168` | Unselected radio/checkbox ring (3:1) |
| text1 | `#F4EDEA` | Primary text |
| text2 | `#C3B7BD` | Body, secondary |
| text3 | `#9A8D95` | Captions, meta |
| primary | `#9CD3B2` | Active, selected, main action. Nothing else |
| onPrimary | `#10241A` | Text/icons on primary |
| primaryPressed | `#86BC9C` | |
| primarySoft | `rgba(156,211,178,0.14)` | Icon tiles, banners |
| selectedFill | `#21302A` | Selected option card |
| warm | `#F3B486` | Celebration only, never warnings |
| onWarm | `#2E1A0C` | |
| caution | `#E5CB78` | Doctor screens + pain nudge only |
| onCaution | `#2A220A` | |
| cautionSoft | `rgba(229,203,120,0.12)` | |
| cautionText | `#EFDDA0` | Body text on caution panels |
| error | `#E8958F` | Rare system failures only, never health copy |
| decoLavender | `#B6A5EA` | "About right", charts, illustrations; no status meaning |
| decoSky | `#8DBBDD` | "Too easy", charts |
| decoRose | `#E2A2BC` | "Too hard", charts |
| scrim | `rgba(8,5,10,0.62)` | Behind sheets/dialogs (no blur) |

**Type: Figtree** (Google Fonts, via `@expo-google-fonts/figtree`, weights 400/500/600/700/800). Sizes in sp.
| Variant | Size/line | Weight | Letter-spacing |
|---|---|---|---|
| display | 34/40 | 700 | -0.02em |
| title | 26/32 | 700 | -0.015em |
| heading | 20/26 | 600 | |
| body | 16/24 | 400 | |
| option | 16/22 | 500 | |
| label | 15/20 | 600 | |
| button | 17/20 | 700 | |
| caption | 13/18 | 500 | |
| stat | 40/44 | 700, tabular numbers | -0.02em |

Large font sizes: nothing has a fixed text height; chip/segmented rows wrap 2×2 at 1.3×; stat widgets stack.

**Radii:** xs 10 (tags) · sm 14 (small icon tiles, level number tiles) · md 20 (inputs, rows) · option 22 · lg 28 (cards) · xl 36 (sheet tops) · pill 999 (buttons, chips, icon buttons).

**Spacing:** 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56. Screen gutter 20, card padding 20, gap between cards 12, between sections 32. Touch targets ≥ 44. Safe areas: use `react-native-safe-area-context` insets. The mockups leave 44 at top and 24 + 4 at bottom.

**Depth:** cards = elevation ~6 + 1px top inner highlight `rgba(255,255,255,0.035)`; sheets = elevation ~16. No hard borders. No blur.

**Motion** (Reanimated `withSpring`):
| Name | Config | Use |
|---|---|---|
| press | stiffness 400, damping 18 | Scale 0.97 on press-in, every tappable (`PressableScale`) |
| standard | stiffness 260, damping 26 | Sheets, dialogs (0.94 → 1), screen pushes, question slides |
| expand | stiffness 220, damping 22 | Level rows, note field, menus; children stagger 25ms |
| celebrate | stiffness 180, damping 14 | Level unlocked only (the one spring that overshoots) |
| fade | 150–200ms ease-out | Opacity only: scrims, status-line cross-fades |

Haptics: light on selections; success on log and unlock.

**Icons:** lucide-react-native, stroke 2, 22 in buttons and 18 in rows. Used: chevron-left/right/down, x, check, plus, ellipsis-vertical, settings-2, lock, leaf, info, stethoscope, moon, bell, download, trash-2, pencil, arrow-up, package. Illustrations in the mockups are simple placeholders (inline SVG shapes); fine to ship as-is or replace later.

## Per-screen behaviour (motion · taps · back)

**0 Welcome, name.** First launch only. Title and input fade up (40ms stagger); keyboard opens automatically, footer rides above it. Continue → Home (empty). Skip → Home, greeting without a name. Back: exits app.

**1 Home.** Header: date (left), settings icon button (right). Greeting by time of day + name. One honest line, chosen from log state: no logs yet → "Ready for your first session?"; logged today → "Logged today, nice."; last log within ~4 days → "Pick up where you left off."; longer → "Been a little while; your program's right here whenever you're ready." (The 4-day threshold is a suggestion: make it a constant.)
Hero program card: "Back Recovery · 27 Sep", "Level 2 · Activation & Stability", 3-segment level track (skipped/passed = `handle` colour, current = primary, locked = surface2), "Level 2 of 3 · 9 sessions logged", primary "Log today's session". Tap body → Program. ⋮ → Rename / Delete.
Widgets (all derived from `sessionLog` at render, never stored): "Last 7 days" count + 7 day-dots (logged = primary, today = ring); "All time" count + "Since <date> · N level up"; "How sessions have felt": Effort pills coloured by difficulty (deco colours) and Pain-after dots sized by pain (none smallest → significant largest), plus one plain sentence (e.g. "Mostly about right. Pain afterwards was none or mild in 7 of 9."). Widgets → Program.
"Rough day?" card → Gentle day sheet. "Start a new program" → Region select.
Widgets stagger in only on cold start. Back: exits app.

**1 Home, edge.** 3+ programs: names clamp to 2 lines. ⋮ menu scales from its origin (0.92 → 1, damping 22) over a light scrim. Back closes the menu first.

**9 Settings.** Rows push sub-screens or open dialogs. Reminders off by default; reminder copy never mentions missed days. Export writes a file of all program objects. Delete all → confirm. The About row and the data note say Regain is a companion, not a medical service, and that answers are sent off the phone only to generate a program (Satvik: confirm this wording). Back → Home.

**2 Region select.** 2-column tile grid that scales to more regions. Neck tile dimmed, not tappable, "Coming soon". Optional shared-element transition of the tile illustration into the question screen; a standard slide is fine. Back → Home.

**3 Questionnaire** (one screen, many states). Header: back (previous question; on Q1 → Region select), 6-segment progress + "N of 6", ✕ (quit-confirm dialog: "Leave the questions?" / "Your answers so far won't be kept." / Leave (secondary) · Keep going (primary)). System back = previous question, never exits.
- Wording and order of questions are locked (`data/intake/backIntake.ts`). Allowed: short intro lines ABOVE a question, never inside it. Q1: "A few questions so we start you in the right place." Checklist: "A routine check before we choose exercises." + "Tick any that apply."
- Option cards: full-width, radius 22, radio (single) or rounded-square check (multi). Selected = `selectedFill` + 1.5px primary ring; radio dot springs 0.6 → 1; light haptic.
- Optional note (questions without `disableFreeText`): field appears only after an option is chosen (height springs open), labelled "Anything else you'd like to add?" + "Optional".
- Free-text-only: Continue enabled once non-blank; placeholder from `freeTextPlaceholder`.
- Checklist: "None of the above" sits below a divider and is exclusive both ways. Calm: neutral ticks, no red, no warning icons.
- Continue: disabled style = surface2 fill + text3 (not opacity). Transition between questions: out 24px left + fade, in from right (spring damping 24); reversed on back. Progress segment fills with the same spring.

**4 Generating.** Three soft rings + core breathe (scale 0.94 → 1.04, 4s loop, 0.6s offsets). Status lines: past line text3 with a check, current text1 with a primary dot, next dimmed. Cross-fade ~every 2s. Show at least 2.5s. Never an error: fall back silently. Back ignored. Then replace the intake stack with Program (just created).

**5 See a doctor.** Copy from `RedFlagDetourScreen.tsx`. Caution colour only here and in the nudge; a faint caution-tinted top glow. Standard: caution icon tile, "Before you start" eyebrow (caution), title, body, neutral info card ("companion… haven't saved anything…"). Urgent: a caution panel at the top naming the reason (bladder/bowel), then title + body. Buttons: Back to Home (primary), Start over (quiet → Region select). Steady fade + 12px rise, no bounce. Back → Home. Nothing persisted; intake cleared from the stack.

**6 Program.** Header: back → Home, ⋮ (Rename / Delete). Hero: "Back Recovery · since 27 Sep · 9 sessions", "Level 2 of 3", level name as title, goal, level track. If started above Level 1: info card "You started at Level 2 based on your answers. Level 1 is still here whenever you want it."
Level rows (radius 24): number tile 40 + name + status caption + chevron.
- skipped: grey number, "Skipped · all N exercises still open", exercises tappable
- passed/unlocked: primary-soft tile with check, "Unlocked · open anytime"
- current: primary tile, 1.5px primary ring at 45% opacity, "Current level · N exercises"
- locked: lock icon, "Preview · offered when you're ready"; expands to names only, dimmed, not tappable
Exercise rows: name + "3 sets · 12 reps · hold 2s" (omit reps when reps = 1; omit hold when null) + chevron → Exercise sheet. Equipment shows as a small "Band" tag.
Expand: height spring (expand), chevron rotates 180°, rows fade in with 25ms stagger.
Sticky "Log today's session" over a bottom fade; last row has ~96px bottom padding. After ~120px of scroll, the program name cross-fades into a collapsed header (1 line, ellipsis). Back → Home.
Just-created state: banner + Redo link on first visit only; title "Starting at Level N".

**7 Exercise sheet.** Opens at ~88% height (standard spring); drag down / scrim tap / back closes. Media area 176 tall: no video → placeholder illustration + "Demo coming soon" (reserve for future image/animation); video → "Watch video" pill (opens `videoUrl` externally) + "Opens outside the app". Then level caption, name (title), equipment tag if any ("Needs a resistance band"), guidance tiles (sets / reps / hold; omit tiles that don't apply) + "Start here, adjust as needed.", "How to do it" (`description`), "Why it helps" (`purpose`). Equipment currently lives only in `indicatedFor`/`description`; surfacing it needs an `equipment` field (CLAUDE.md already anticipates this; ask Satvik).

**8 Check-in sheet.** Title "How did today go?" + program · level caption + close. Three segmented controls (primary fill on the chosen segment): Pain during the session (None/Mild/Moderate/Significant), Pain afterwards (same), How did it feel? (Too easy/About right/Too hard). Optional "Also moved today?" chips (Went for a walk / Other activity): **a proposal, confirm with Satvik before building; it adds a stored field.** "Log session" disabled until the three required rows are answered. Back/drag closes, nothing logged.

**8 Session logged.** Full screen. Circle springs 0.6 → 1, check draws in (~350ms), success haptic. "Session logged" + an honest count ("That's 4 in the last 7 days."). Caution nudge card only when `shouldSuggestProfessional` is true. Done → back to where Log was tapped.

**8 Ready offer.** Arrow-up tile, "You're moving well", body, then evidence: the last `RECENT_WINDOW` sessions (date · difficulty · pain after). The mockup shows 3 rows for illustration; render whatever the gating window is. Next level name + first few exercise names. "Unlock Level N" (primary), "Stay here for now" (quiet), caption "Level N−1 stays open either way." Back = Stay here.

**8 Level unlocked.** Warm only. Rings expand once with the celebrate spring, 8 small coloured dots drift out and fade over 1.2s, success haptic, title rises 200ms after. "Level 2 unlocked" (warm), level name, "N new exercises are ready for you. Take the first few sessions gently." Warm button "See Level N" → Program with that level open.

**10 Gentle day sheet.** Leaf tile, "Gentle day", "Some days are harder. These moves are easy on your back. Do as many as feel good, and stop whenever you like." Caption "From Level 1 of <program>", 3–4 Level 1 exercises from the user's selection (rows → Exercise sheet), "Log a gentle session" (primary), Close.

## Build rules beyond the mockups

- A gentle session is logged and shown in history, but must not count toward or against level readiness (needs a flag on the log entry, e.g. `gentle: true`, so it stays a raw fact).
- Agreed with Satvik: re-show the warning-sign checklist when "Significant" pain is logged twice in a row (same rules as intake: any sign → doctor screen; urgent for bladder/bowel). Exact behaviour after that (pause the program? just inform?) is Satvik's call: ask.
- When a declined level offer is re-offered is Satvik's call; the design doesn't depend on it.
- New stored data the redesign implies (all raw facts, nothing derived): user name; `gentle` flag on log entries; optional `alsoMoved` on log entries (if approved); reminder settings (if built). Ask before adding any of them.
- Every hex, size and radius above goes into `theme/`; screens use tokens only (existing CLAUDE.md rule).

## Known conflicts and open questions for Satvik

1. **Font:** CLAUDE.md says Nunito; the redesign uses Figtree.
2. **Preview + Save:** `SCREENS.md` / the core journey in CLAUDE.md describe a preview step; the redesign removes it.
3. **Header "Home" button:** the current pattern has one; the redesign drops it.
4. **Diagnosed branch has no warning-sign checklist.** CLAUDE.md records this as deliberate ("already professionally screened"). The design review flagged it anyway: a diagnosis doesn't rule out new bladder/bowel changes since that visit. Also, "No / not yet" cleared for exercise still continues to a program. Not changing either without Satvik's explicit decision (the questionnaire is fixed and audited).
5. **New screens:** Welcome/name, Settings, Gentle day are additions; confirm scope and order against the build plan.
6. **Settings copy** about data leaving the phone (the AI calls send intake answers to the Anthropic API).
