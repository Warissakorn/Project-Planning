# Breakdown Planner

> Offline-first WBS, CPM scheduling and Gantt planning in the browser.

🇹🇭 [อ่านฉบับภาษาไทย](README.th.md) · 📖 [User guide](docs/user-guide.en.md) · [คู่มือภาษาไทย](docs/user-guide.th.md)

Breakdown Planner plans a project through breakdown structures — WBS, OBS, CBS, RBS and
PBS — in one place, schedules the work with a real critical path method pass, and draws it
as a Gantt chart. It runs entirely in the browser: no server, no account, and nothing
leaves the machine.

## Features

- **Five structure types in one project.** Work (WBS), organisation (OBS), cost (CBS),
  risk (RBS) and products (PBS), each in the same tree editor with drag and drop, indent
  and outdent, and numbering computed live from a node's position.
- **Leaves are the source of truth.** Dates, progress and cost are entered on leaf tasks;
  parents derive their span, weighted progress and total cost automatically.
- **Real CPM.** FS/SS/FF/SF dependencies with lag and cycle protection feed a forward pass
  that places every bar, marks the critical path in red and shows the slack on the rest.
- **Cross-structure links.** Assign work to an org unit, charge it to a cost category,
  point it at a product or a risk — then read the roll-up from the other side as a
  mini-schedule rather than a bare total.
- **Reports.** A cumulative cost S-curve by category, and an OBS × schedule heatmap of
  task-days for finding the bottleneck.
- **Bilingual.** Thai and English throughout, including the sample projects, the 16
  templates and the user guide. Dates follow the language: Buddhist era in Thai, common
  era in English.
- **Yours alone.** State persists to localStorage; JSON export and import move a project
  between machines, and CSV export opens cleanly in Excel.

## Getting started

```bash
npm install
npm run dev      # Vite dev server
npm test         # vitest
npm run build    # typecheck, then production build into dist/
```

The build is a static bundle — serve `dist/` from any host. GitHub Pages deployment runs
from `.github/workflows/deploy-pages.yml` on pushes to `main`.

New to the app? Open it and click **Load 5 sample projects**: five worked projects with
dates, dependencies and a critical path already in place. The construction sample is the
one to study first — a 273-day critical path with visible slack on the branches around it.

## How it is built

Vite · React · TypeScript · Tailwind · zustand with immer and a persist middleware ·
date-fns. The CPM engine (`src/engine/`) is decoupled from the calendar and covered by
golden tests, so scheduling behaviour is pinned rather than assumed.

```
src/
  components/   tree, gantt, inspector, links, reports, projects, layout, ui
  engine/       CPM, tree operations, analytics
  model/        types, defaults, sample projects, template library
  state/        zustand store, slices, undo history
  lib/          i18n, dates, CSV and JSON export, ids
docs/           the user guide, in Thai and English
```

## Limitations

Worth knowing before you rely on it: there is no backend, so no sharing or real-time
collaboration; the calendar counts consecutive days, so weekends and holidays are working
days; there is no resource levelling or baseline comparison; CSV is export-only; and the
five structure types are fixed presets. [Chapter 10 of the guide](docs/user-guide.en.md#10-how-far-does-this-app-really-go)
covers what that means in practice.

## Licence

[MIT](LICENSE) — Copyright (c) 2026 Warissakorn. Bundled fonts (IBM Plex Sans Thai and
IBM Plex Mono) are licensed separately under the SIL Open Font License; see
[NOTICE](NOTICE) and `public/fonts/OFL.txt`.
