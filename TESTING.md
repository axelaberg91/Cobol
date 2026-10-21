# Local verification — October 21, 2026

## Automated checks

`node --test tests/*.test.cjs`: 11 tests passed.

Coverage includes content integrity, early Trenton placement, locked chapters,
save restoration and sanitization, malformed/unavailable storage, escaped code
operators, completion gating, reset confirmation, and relative Pages asset paths.
The application is exercised in an isolated VM for save-state tests; these tests
do not substitute for browser interaction.

`node --check` passed for app.js, content.js, and scripts/serve.cjs.
`git diff --check` passed. The inherited GPL license was not modified.

## Browser walkthrough

Verified in the desktop in-app browser, including 390 × 844 and 320 × 740 mobile
viewports:

- All 15 puzzles played through from the start to the final report.
- Incorrect answers permit retry; correct answers show the explanation.
- All three progressive hints work; the fourth hint request is disabled.
- Answer submission is disabled until an answer is selected.
- Chapter 2 unlocks after the third puzzle; chapter 3 after the ninth.
- Reloading the page preserves completed puzzles and the continue destination.
- ADB handbook and historical sources dialog open correctly.
- Escape dismisses the handbook and returns focus to its opener.
- Canceling reset preserves completed progress; confirming reset clears it.
- No horizontal page overflow in the narrow layouts inspected.
- No browser warnings or errors during the walkthrough.
- Test progress was reset after verification, leaving a clean home screen.

Local screenshots are in ignored `test-results/`: desktop-home.jpg,
mobile-home.jpg, and mobile-trenton.jpg.

## Limits

No physical iOS or Android device was used. Native dialog behavior and rendering
on those devices remain to be checked after publication. The COBOL snippets were
reviewed as procedural examples, but were not compiled: there is no COBOL
compiler in this workspace. Tests verify the game behavior and curated answer
mapping, not execution by a COBOL compiler.

## Terminal redesign and difficulty update

- Replaced the light editorial design with dark green terminal panels, pixel
  headings, amber buttons, cream continuous-feed archive paper, and the existing
  warm office illustration.
- Played all 45 variants through the actual browser UI: 15 Mjukstart, 15 Lagom,
  and 15 Klurigt. Every answer reached its success explanation and each full
  walkthrough reached the final report.
- Verified changing difficulty mid-puzzle replaces code and answers and clears
  the previous selection before allowing another submission.
- Automated coverage additionally checks all level banks are complete and
  distinct, per-level hint separation, completion preservation on switching,
  restoration of the selected difficulty/results, and migration of previous saves.

GitHub Pages has not been enabled or deployed. Relative asset paths and the
absence of a build requirement were checked locally. Publishing awaits the
user's approval of the local version.
