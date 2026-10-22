# Maria's Mainframe

A personal, Swedish-language COBOL puzzle game for Maria. Designed for mobile
browsers and static hosting on GitHub Pages. No build step or runtime dependencies.

[Play Maria's Mainframe](https://axelaberg91.github.io/Cobol/)

## Play locally

Install Node.js, then run `npm start` from the repository root. Open
http://127.0.0.1:4173 in a browser. Run `npm test` for the automated checks.

The preview binds only to the local computer. It is not accessible from a phone
over the network. Browser responsive mode can be used for local mobile review.

## First version

- 15 puzzles in three chapters: TP-data (3), Trenton (6), monthly reporting (6).
- Three switchable difficulties: Mjukstart, Lagom, and Klurigt, with 45 distinct
  puzzle variants in total. Change difficulty on the home screen or within a job.
- Dark green phosphor-terminal design, pixel headings, amber controls, a warm
  illustrated office, and a historical note on continuous-feed paper.
- Three progressive hints per puzzle, explanations, and an ADB handbook.
- No timer, lives, account, analytics, backend, or paid service.
- Progress is stored in localStorage on the current browser and origin. Clearing
  browser data removes it; the preview and published site have separate saves.
- Completion in any difficulty advances the story. Completed jobs are retained
  when switching. Answers in progress are cleared on a level change; completed
  variants and hint counts are stored separately for each difficulty. Older saves
  are migrated to Lagom without losing completed jobs.
- Replay completed chapters. Reset progress from the About dialog, with a
  confirmation before deletion.
- Responsive layouts, keyboard operation, visible focus, native modal dialogs,
  live feedback, and reduced-motion support.

The interface uses Google Fonts with local system fallbacks. The game remains
playable if the font service is unavailable. Font loading contacts Google;
answers and progress are not sent there. The game is not an offline-installed app.

## GitHub Pages

All site paths are relative and work under `/Cobol/`. Publication to `main` was
approved on October 21, 2026. Pages uses **Deploy from a branch → main / (root)**.
Future pushes to `main` automatically rebuild the public site.
The `.nojekyll` file disables unnecessary Jekyll processing.

## Historical scope

Maria's COBOL work at TP-data, the Trelleborg connection, and her time in Trenton
come from the family account. Goodall is a plausible employer/project connection
because of its Trenton operations and Trelleborg ownership; Maria's assignment
and Goodall's use of COBOL have not been independently verified.

All game assignments, numeric examples, dialogue, and office imagery are fiction.
The equipment illustration does not depict a verified TP-data computer model.
The game is not affiliated with or endorsed by the named companies.

Sources are also accessible inside the game:

- [SOU 1985:50, appendix 1, p. 185](https://lagen.nu/sou/1985:50): TP-Data staff
  participated in PLM training. This does not establish ownership.
- [Trelleborg history](https://www.trelleborg.com/en/about-us/history): the
  industrial conglomerate period, 1980–1995.
- [SEC News Digest, October 17, 1985](https://www.sec.gov/news/digest/1985/dig101785.pdf):
  Trelleborg's Goodall acquisition filing.
- [U.S. Department of Labor historical records](https://www.dol.gov/agencies/eta/tradeact/petitioners/petitions?page=1701&sort=company&sort_order=asc):
  Goodall operations in Trenton in 1984 and 1990.
- [MacDonald, 1989](https://aisel.aisnet.org/jise/vol1/iss3/3/): COBOL's contemporary
  role in business applications; not confirmation of a specific company's stack.

## COBOL examples

These are excerpts, not complete standalone compilation units. Each puzzle
shows its data declarations and procedure excerpt. They use procedural COBOL
appropriate to the period; the final puzzle uses the intrinsic MOD function
introduced with the 1989 intrinsic-function amendment. No actual COBOL code is
executed in the browser: answers are curated multiple-choice puzzles. No compiler
is included. Swedish decimal notation is used in answers, while code uses a dot.

The amendment is documented by [ANSI X3.23a-1989](https://webstore.ansi.org/standards/incits/ANSIINCITS23a1989R2001)
and [ISO 1989:1985/Amd 1:1992](https://www.iso.org/standard/6725.html).

The office illustration was generated with the built-in imagegen tool. Its
[final prompt](assets/office.prompt.txt) is kept with the asset for reproducibility.
The current [Swedish 1980s office illustration](assets/office-v3.png) uses the
older single-triangle Trelleborg emblem as a historical reference; see its
[edit prompt and source credit](assets/office-v2.prompt.txt). The desk support
was corrected in a [follow-up edit](assets/office-v3.prompt.txt). The calendar and
office are fictional. Trelleborg's marks retain their own rights and are not
included in the CC BY-NC license for the original illustration.

## Rights

Original contributions: © 2026 axelaberg91, CC BY-NC 4.0; see
[LICENSE-original.md](LICENSE-original.md). The pre-existing GPL-3.0 text in
[LICENSE](LICENSE) remains unchanged. Third-party material retains its own rights.
