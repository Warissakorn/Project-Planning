# Breakdown Planner user guide

> A web app for planning projects with breakdown structures (WBS / OBS / CBS / RBS / PBS),
> a Gantt chart and the critical path — running entirely in the browser, offline.

> 🇹🇭 [อ่านคู่มือฉบับภาษาไทย](user-guide.th.md)

---

## Contents

1. [Overview](#1-overview)
2. [Start in 3 minutes](#2-start-in-3-minutes)
3. [Concepts to know first](#3-concepts-to-know-first)
4. [Building and organising the work](#4-building-and-organising-the-work)
5. [Schedule, progress and cost](#5-schedule-progress-and-cost)
6. [Dependencies](#6-dependencies)
7. [Gantt chart and critical path](#7-gantt-chart-and-critical-path)
8. [Cross-structure links](#8-cross-structure-links)
9. [Undo, export and import](#9-undo-export-and-import)
10. [How far does this app really go?](#10-how-far-does-this-app-really-go)
11. [Five sample projects to learn from](#11-five-sample-projects-to-learn-from)
12. [FAQ](#12-faq)
13. [Reports: S-curve and resource loading](#13-reports-s-curve-and-resource-loading)

---

## 1. Overview

Breakdown Planner is built on the **breakdown structure** — breaking a large piece of
work down until each part is unambiguous, the standard approach in project management
(PMBOK). One project can carry five kinds of structure at once:

| Type | Full name | What it is for |
|---|---|---|
| **WBS** | Work Breakdown Structure | Tasks, schedule and cost |
| **OBS** | Organizational Breakdown Structure | Who or which unit is responsible for what |
| **CBS** | Cost Breakdown Structure | Which category a cost falls into, and the totals |
| **RBS** | Risk Breakdown Structure | Risk register: likelihood × impact |
| **PBS** | Product Breakdown Structure | Products and modules to deliver, and their versions |

**Highlights**

- 🌳 One tree editor for every structure — drag and drop, indent and outdent, automatic numbering (1, 1.1, 1.1.1)
- 📅 Enter start dates and durations on leaf tasks only; parents **compute themselves** (span, weighted progress, total cost)
- 🔗 FS/SS/FF/SF dependencies with lag, and automatic cycle protection
- 📊 A Gantt that draws the critical path in red, plus slack, a today marker and day/week/month zoom
- ↔️ Link WBS↔OBS (assignments) and WBS→CBS (charges), then read the roll-up from the other side
- 🌐 A Thai-English toggle on every screen · undo/redo · JSON and CSV export · JSON import
- 💾 Data lives in the browser's localStorage — **no server, no login, nothing leaves the machine**

Best for: planning small to mid-sized projects, personal work and small teams, and
learning WBS, Gantt and CPM through something concrete.

---

## 2. Start in 3 minutes

### Create a new project

1. Open the app — the first page is your project list
2. Type a project name, for example `Office building extension` → click **New project**
3. The app opens the workspace on a WBS tab whose root carries the project name

### Or try a sample project (recommended if you are new)

Click **💡 Load 5 sample projects** on the first page and you get five projects in five
styles (construction / mobile app / seminar / marketing campaign / office relocation),
complete with dates, progress, dependencies and a critical path. Clicking again never
duplicates them, because their ids are fixed.

### Start real work from a template

Click **Create from template** on the first page — choose from **16 templates in 6
categories** (🏗️ construction · 💻 IT/software · 📣 marketing · 🎪 events · 🏪 business ·
🎓 personal): building a house, a mobile app MVP, a product launch, a seminar, a coffee
shop, a thesis, a house move. The search box matches Thai and English alike.

Every template ships with **phases, tasks, durations, dependencies and milestones** in the
standard WBS shape. Pick one and the app creates the project immediately: CPM computes
every start and finish from today and draws the Gantt and critical path, leaving you to
rename, add or remove tasks and enter real progress. Instantiate the same template as
often as you like — each one is a separate project — and add OBS/CBS/RBS/PBS later from
**+ Add structure** in the workspace.

> 💡 The **? button in the header** (on both the project list and the workspace) opens this
> guide inside the app at any time — no separate file needed.

### Add your first task

- Click **Add child** — adds a task under the selected row (nothing selected = a top-level row)
- Double-click a name to edit it; Enter saves, Esc cancels

---

## 3. Concepts to know first

### Leaf tasks are the source of truth

The single most important rule:

| | Leaf task (no children) | Parent (has children) |
|---|---|---|
| Start date / duration | ✏️ Entered | 🔒 Span of its children (min start - max end) |
| Progress % | ✏️ Entered | 🔒 Weighted by child duration |
| Status | ✏️ Chosen | 🔒 Derived from progress |
| Cost | ✏️ Entered | 🔒 Sum of all descendants |

Edit a leaf once and every parent above it updates immediately — there is no refresh button.

### Numbering is computed live, never stored

1, 1.1 and 1.1.1 are derived from the node's actual position on every render, so the
numbers stay correct wherever you drag a row.

### One tab, one structure

A project can hold several structure instances (one WBS plus two CBS for two budget years,
say). Add one with **+ Add structure** at the end of the tab bar, rename a tab by
double-clicking it, and delete one with the × on the active tab (deleting a structure
deletes every node inside it).

---

## 4. Building and organising the work

### The toolbar above the table

| Button | What it does |
|---|---|
| ➕ Add child | Adds a child under the selected row (nothing selected = under the root) |
| Add sibling | Adds a node at the same level, after the selected row |
| ⇥ / ⇤ (indent/outdent) | Moves a row one level in or out |
| Collapse / expand all | Collapses or expands every branch |
| 🗑 Delete | Deletes the selected row and all its children (behind a confirmation dialog) |
| 📋 / 📊 toggle | Switches between table and Gantt (scheduling structures such as WBS only) |

### Drag and drop

Grab the **six-dot handle** in front of the name and drag:

- Drop on the **upper part (first 30%)** of the target row to place it *before* that row
- Drop on the **lower part (last 30%)** to place it *after*
- Drop on the **middle of a row** to place it *inside*, as a child

A node cannot be dropped into its own subtree, so the tree can never loop back on itself.

### Keyboard navigation

| Key | Effect |
|---|---|
| ↑ / ↓ | Move the selection up and down (Home / End jump to the first or last row) |
| → | Expand a collapsed branch, or step into the first child |
| ← | Collapse a branch, or step up to the parent |
| Ctrl+Z / Ctrl+Y | Undo / redo (every action, drag and drop included) |

The selected row scrolls into view on its own.

---

## 5. Schedule, progress and cost

Click any row and the **inspector** on the right shows its detail:

- **Name and notes** — editable on every node
- **WBS leaf**: start date (date picker), duration in days, a **Milestone** checkbox (a
  zero-day marker, drawn as a ◆ on the Gantt), progress %, status (to do / in progress /
  done) and cost
- **WBS parent**: derived values, read-only, with a status badge
- **OBS**: owner · **CBS**: budget · **RBS**: likelihood (%), impact (low/medium/high) and
  response plan · **PBS**: version

> 💡 **Tip:** table columns edit in place like a spreadsheet — click a cell and type.

The status bar at the bottom warns how many tasks **still lack a start date or duration**,
and shows how much storage is in use.

---

## 6. Dependencies

Add them from the inspector of a **WBS leaf**: click **+ Add dependency** → pick the
predecessor → set the type and lag (in days, negative allowed):

| Type | Name | Meaning |
|---|---|---|
| **FS** | Finish-to-Start | The predecessor **finishes** before the successor can **start** (by far the most common) |
| **SS** | Start-to-Start | Both start together (+lag starts the successor that many days later) |
| **FF** | Finish-to-Finish | Both finish together |
| **SF** | Start-to-Finish | The predecessor starts before the successor can finish (rare) |

**Rules enforced automatically**, each with its own message:

- ❌ No self-links and no cycles — the whole subtree is checked before a link is accepted
- ❌ No duplicate edges
- ❌ Only schedulable leaves, and both ends must be **in the same structure** (WBS to WBS)

Dependencies are what CPM uses to compute the critical path in chapter 7.

---

## 7. Gantt chart and critical path

Switch with the 📊 button in the toolbar (scheduling tabs only) — the name pane on the left
stays in sync with the tree, collapsed branches included:

- **Zoom**: day (26px/day) / week / month
- **Today marker**: the red vertical line
- **Bars**: the es-ef range CPM computed; hover for the real dates and slack in days
- **Critical path**: red bars are tasks with slack ≤ 0 — a single day late there and the whole project slips
- **Milestones**: a yellow ◆

**The principle:** bar positions come from a forward pass over the dependency network, in
which the start date you enter acts as a pin. Where a constraint forces a later start, the
constraint wins and the bar moves right — so the Gantt and the table agree whenever your
dates do not contradict your dependencies.

Tasks with no dates leave an empty row, and the status bar says so.

> 📌 **The scope of the critical path:** CPM applies only to scheduling structures such as
> the WBS, because a critical path needs a network of durations and dependencies. OBS
> (organisation), CBS (cost), RBS (risk) and PBS (products) carry neither, so there is no
> network to analyse — and standard practice likewise runs CPM only over the activity
> network derived from the WBS. The other structures receive roll-ups through links
> (chapter 8) instead.

---

## 8. Cross-structure links

The heart of planning across structures — link from the inspector of a WBS node:

- **🏢 Assign to org unit (assigns)** — WBS → OBS: who does this work
- **🪙 Charge to category (charges)** — WBS → CBS: which budget this work draws on
- **📦 Deliver to product (delivers)** — WBS → PBS: which product or module this work delivers
- **🛡️ Mitigate risk (mitigates)** — WBS → RBS: which risk this work responds to

Each link button filters the picker down to the right structure, the same pair cannot be
linked twice, and every link is undoable like any other edit.

On the receiving side (open an OBS/CBS/RBS/PBS tab and click a node) you get an **inbound
mini-schedule**: the WBS tasks pointing at it, each with a status dot (to do / in progress
/ done), a date range and progress, ordered by start date, eight at a time with the rest one
click away. Click a "materials" category, for instance, and you see the piling and
foundation tasks charged to it with their schedules — not just a total.

> 💡 You can link a **parent node (a branch)** too — the app expands it across every task
> inside (assigning the whole "foundation works" branch to one unit rather than clicking
> through task by task), without double-counting a child that is also linked directly.

---

## 9. Undo, export and import

| Feature | How to use it |
|---|---|
| Undo / redo | Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y), or the header buttons — 50 levels deep |
| Export JSON | Header → **Export → Export JSON** — a full project backup, carrying a schemaVersion |
| Export CSV | Header → **Export → Export CSV** — the open tab only, with a UTF-8 BOM so Excel reads Thai correctly, plus Code / Level / roll-up columns |
| Import JSON | First page → **Import JSON** — checked first: broken JSON, not an export of this app, or created by a newer version, each with its own message |

Importing a project whose id already exists gets a fresh id, so both can live side by side.

> ⚠️ Everything lives in this browser's localStorage and nowhere else — clearing site data
> or switching browsers leaves it behind. Exporting JSON now and then is the best backup you
> have.

---

## 10. How far does this app really go?

**✅ Works well for:**

- Small to mid-sized projects (hundreds of tasks) with a single planner holding the plan
- Work whose scope has to be argued: construction, software, events, campaigns, consulting, relocations
- Teaching and learning PM fundamentals — WBS, dependencies, CPM and cost roll-up in one place
- Offline and confidential environments (not a byte leaves the machine)

**⚠️ Not yet suited to (worth knowing first):**

| Limitation | What it means in practice |
|---|---|
| No backend or accounts | No sharing and no real-time collaboration; the data stays on that machine and browser |
| Consecutive-day calendar | Weekends and holidays count as working days, so real elapsed time runs longer than shown |
| No resource levelling or baseline | Over-allocation is not prevented, and there is no plan-versus-actual comparison |
| ~5MB of storage | Comfortable into the hundreds and low thousands of nodes; beyond that the status bar turns red |
| CSV is export-only | CSV cannot be imported — only this app's own JSON |
| Fixed structure types | There is no UI yet for a custom structure type; the five presets are what you get |

**In short:** as a personal planning tool and a teaching aid it is complete and genuinely
in control. As an enterprise PM suite with collaboration and resource management, it is not
— and was never meant to be.

---

## 11. Five sample projects to learn from

Click **Load 5 sample projects** on the first page (their ids are fixed, so clicking again
changes nothing):

| # | Sample | What it teaches | Structures |
|---|---|---|---|
| 1 | **Office building construction** | The full showcase: ~35 leaf tasks over four levels, a 273-day critical path (~9 months), two pile zones running in parallel before they converge, a near-critical branch (painting, ~8 days of slack), slack you can see (lift 48 / air conditioning 38 / landscaping 37 days), and topping-out and handover milestones | WBS + OBS + CBS + RBS |
| 2 | **FoodieGo app development** | Parallel branches (design ∥ backend ∥ mobile app) converging on QA, development split across two sub-teams over three levels, a launch milestone, and a PBS broken out by module and version | WBS + PBS + OBS |
| 3 | **Digital Transformation seminar** | A tight timeline mid-flight (past tasks done, current ones in progress) with dependencies that carry real logic: handouts print only after registration closes, because the headcount decides the quantity | WBS + OBS + CBS |
| 4 | **AIRA X1 launch campaign** | A serious RBS (likelihood × impact plus response plans), several branches converging on the on-sale milestone, and a campaign budget as a CBS | WBS + CBS + RBS |
| 5 | **Office relocation** | A complete plan from the WBS alone: positive lag (cabling waits for the plaster to dry), a furniture branch with plenty of slack, and a moving-day milestone | WBS |

**How to read the critical path in sample 1:**

1. Open the WBS tab and switch to the Gantt — the red bars are the critical path (slack ≤ 0)
2. Follow the red chain: site survey → design → BOQ → permit → piling zone A → foundations →
   levels 1-3 → topping out → partitions → tiling → ceilings → lobby → commissioning →
   handover (273 days in total)
3. Hover an indigo bar such as "Install the passenger lift" (48 days of slack) or
   "Landscaping" (37 days) — either can slip a long way without moving the handover date
4. Compare that with "Painting throughout the building" (~8 days) — a near-critical branch
   that turns critical the moment it slips past eight days
5. Change the duration of "Apply for the construction permit" from 30 to 45 days and watch
   the whole chain, and the handover date, move with it

Every sample is scheduled by the real CPM engine and has its statuses stamped against
today's date, so whenever you open one, the tasks that should read done or in progress do.

---

## 12. FAQ

**Q: Do I lose my data when I close the browser?**
No — every edit persists to localStorage immediately. Clearing site data does erase it,
which is why exporting JSON now and then is worth the habit.

**Q: Why can't I edit a parent's start date?**
By design — a parent is derived from its children. Edit the leaf and the parent follows.

**Q: Why doesn't the Gantt bar match the start date I entered?**
CPM takes the later of the two: your pinned date and the constraint from its dependencies.
To make them agree, adjust the dependency or its lag.

**Q: Can I use it on more than one machine?**
Export JSON on machine A and import it on machine B — there is no automatic sync.

**Q: Thai comes out garbled when I open the CSV?**
The file already carries a BOM — in another editor, open it as UTF-8.

**Q: Do OBS / CBS / RBS / PBS have a critical path?**
Not in principle. The critical path method analyses a network of tasks that carry durations
and dependencies, which is what the WBS provides as an activity network. OBS is an
organisation chart, CBS aggregates money, and RBS and PBS hold no relationships in time —
none of them offer a network to analyse, and standard practice (PMBOK) likewise confines CPM
to the project schedule. So the Gantt and dependency features open on the WBS only; OBS,
CBS, RBS and PBS instead receive roll-ups (task counts, total cost) through links.

**Q: Why doesn't the cost in the S-curve match the CBS budget column?**
They are different fields. The S-curve uses the **cost of each individual WBS task**, spread
across its schedule, while "budget" is an attribute of a CBS node that you type in the
inspector on the CBS side. They do not sync, by design: per-task cost is the source of truth
for the reports, and the CBS budget serves as the ceiling or target you compare against
later.

---

## 13. Reports: S-curve and resource loading

The workspace's third view (the 📈 button beside table and Gantt) draws on **every
structure** at once: the WBS supplies schedule and cost, the CBS supplies cost categories,
and the OBS supplies org units. It opens from any tab as long as the project has at least
one schedulable structure.

### 13.1 Cumulative cost (S-curve)

- **The heavy purple line is the total** — cumulative cost across every scheduled task, each counted once
- **The coloured lines are CBS cost categories** from charges links, so you can see when money flows into which category
- The red dashed vertical is today · switch between **weekly and monthly** in the bar above
- Hover the chart for the cumulative value of every line at that bucket

**Calculation rules worth knowing:**

| Rule | What it means |
|---|---|
| Cost spreads evenly | A 100,000 baht task over 4 days is 25,000 a day |
| Milestones land on one day | The whole amount falls on the start date (zero duration) |
| Tasks with no start date | Excluded from the curve, with a yellow note under the chart naming the value left out |
| Tasks charged to several categories | Each category counts the **full** cost of that task (the footnote says so) — the total line still counts it once |
| Tasks charged to nothing | Collected into the grey "unassigned" line |

> Beyond four CBS categories, the fifth onwards fold into a grey "other" line so the chart
> stays readable.

### 13.2 Resource loading (OBS × schedule)

A heatmap of **task-days** — how many days each org unit is committed:

- One row per OBS unit; parent rows roll up the work of every unit beneath them, exactly as the tree does
- Darker means heavier load (against the table's own maximum), white means free
- Click a row to open that unit in the inspector · hover a cell for the tasks consuming those days
- The "unassigned" row at the bottom is the task-days of work nobody owns yet, if any

Use it to find the **bottleneck**: which unit is under most pressure and in which week, and
which work still has no owner.

### 13.3 The links that came with the reports

`delivers` (WBS→PBS) and `mitigates` (WBS→RBS) — how to use them is in
[chapter 8](#8-cross-structure-links). Both reports count assigns and charges only;
delivers and mitigates connect the product and risk views to the work instead (click a
product in the PBS, for instance, and you get a mini-schedule of the tasks that deliver it).

---

*Guide v0.1 · Breakdown Planner (Vite + React + zustand, all data stored locally)*
