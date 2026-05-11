# 📟 DeadPunk OS GitHub Page

Static GitHub Pages branch for the `XxYouDeaDPunKxX` profile.

This branch preserves the cyberpunk / terminal skin of DeadPunk OS.

The active GitHub Pages source is `DeadPunk.OS_0.WTH`; this branch is kept as the preserved cyberpunk / terminal variant.

DeadPunk OS is a fake broken desktop interface built around real project links, short project descriptions, public index files, and a cyberpunk / terminal visual skin.

It is a personal static page. The code was shaped through iteration and AI-assisted edits, so it should be reviewed before being reused.

Public page:

```text
https://xxyoudeadpunkxx.github.io/XxYouDeaDPunKxX/
```

## 🔀 Branches

```text
main                         profile README
DeadPunk.OS_0.WTH            active GitHub Pages source, classic desktop skin
deadpunk-os-cyberpunk-skin   preserved cyberpunk / terminal skin
```

## 🖥️ What It Contains

The page includes:

- a simulated desktop;
- a cyberpunk / terminal visual skin;
- a desktop project column;
- project icons and a separate system icon area;
- a terminal block;
- an `EXPLODED.EXE` inspector window;
- a search route panel;
- a Start-like menu;
- a fixed taskbar with tray controls;
- public files for discovery context.

The project data lives in `projects.js`. The desktop icons, Start menu, inspector, search routes, `llms.txt`, and `raw-manifest.json` should describe the same set of projects.

## 🔎 Why The Extra Files Exist

This branch keeps a few public files next to the page:

- `llms.txt`;
- `raw-manifest.json`;
- `robots.txt`;
- `sitemap.xml`.

They are there so the page is easier to inspect from outside the UI: by people, search crawlers, and tools that read plain or structured project context.

They do not make the page special. They just keep the project list and project descriptions visible in more than one form.

## 🔁 Reuse Notes

If you reuse this branch:

- replace profile and repository links;
- replace project data in `projects.js`;
- update `llms.txt`;
- update `raw-manifest.json`;
- update `robots.txt`;
- update `sitemap.xml`;
- test mobile layout;
- test keyboard navigation;
- test every external link;
- keep the license notice.

No build step is required.

## 📁 Files

```text
index.html          page shell, metadata, JSON-LD, OS layout
style.css           visual system, responsive layout, UI states
projects.js         project data used by icons, Start, search routes, inspector
app.js              rendering, window interactions, fake reboot, micro-toast
llms.txt            LLM-readable project index
raw-manifest.json   machine-readable project manifest
robots.txt          crawler rules and sitemap pointer
sitemap.xml         public page discovery
```

## 🧩 Project Data

Edit `projects.js`.

Each project object feeds:

```text
desktop icon
Start menu app
WHAT BROKE? search route
EXPLODED.EXE inspector window
```

Expected fields:

```text
id
module
title
subtitle
type
category
route
job
problem
output
repo
note
icon
```

Adding a normal project should not require layout edits.

## 🛰️ Discovery Files

Keep `llms.txt` and `raw-manifest.json` aligned with `projects.js` when project descriptions, routing, or categories change.

The GitHub Pages derivation rule is also exposed in `llms.txt` and `raw-manifest.json`.

## ⚙️ Runtime Structure

<details>
<summary>File and runtime map</summary>

### 📦 Load Model

DeadPunk OS is served as static GitHub Pages content.

The browser loads `index.html`, `style.css`, `projects.js`, and `app.js` directly. There is no backend, build step, server-side rendering, or package runtime involved in the deployed page.

### 🧱 HTML Shell

`index.html` contains the fixed document shell.

This includes the metadata, JSON-LD block, boot overlay, top bar, desktop surface, desktop column, terminal block, inspector container, search panel, Start menu, taskbar, tray controls, and links to public discovery files.

Inside the desktop surface, the project icons live in `desktop-grid`. Desktop-level system icons, such as Trash, live in `desktop-system-icons`. Both are grouped inside `desktop-column` so they stay visually related without treating Trash as a project.

Project-specific repeated UI is not written one item at a time in the HTML. Those parts are filled by `app.js` from `projects.js`.

### 🎨 CSS Layer

`style.css` defines the simulated OS surface.

It controls the desktop background, responsive layout, terminal styling, icon grid, desktop system icons, inspector window, Start menu, search panel, taskbar, tray icons, toast messages, boot overlay, and mobile states.

The CSS provides presentation and layout. It does not store project data or select projects.

The main desktop spacing uses a small `8 / 13 / 21 / 34` scale through `--phi-*` variables. The taskbar is fixed to the viewport bottom, while the desktop shell reserves bottom space so content is not hidden behind it.

On desktop and laptop widths, long inspector content scrolls inside the inspector window. On mobile, the inspector returns to the normal document flow.

### 🗃️ Project Registry

`projects.js` contains the runtime project list.

Each project is a plain object with fields used by the interface: `id`, `module`, `title`, `subtitle`, `category`, `type`, `route`, `job`, `problem`, `output`, `repo`, `note`, and `icon`.

At runtime, this file is the source used for project icons, Start menu app entries, search routes, and inspector project views.

The `icon` field is resolved through the `glyphs` map in `app.js`. If an icon key is not present in that map, the UI falls back to `OS`.

### ⚙️ Runtime Script

`app.js` connects the fixed HTML shell with the project registry.

On load, it reads the project list, creates desktop icons, creates Start menu app entries, creates search routes, and prepares the inspector behavior.

It also handles local interactions such as Start menu opening, search panel opening, copy-repo feedback, toast messages, boot hiding, and fake reboot animation.

It derives each project GitHub Pages URL from the project repository URL when rendering the inspector action links.

The derived URL follows the standard GitHub Pages repository pattern: `https://{owner}.github.io/{repository-name}/`.

### 🟢 Initial State

The page opens with the inspector in a README state.

No project is selected by default. The README state is rendered by `app.js` into the same inspector container used for projects.

The README inspector state is inline markup rendered by `app.js`. It is not loaded from `README.md`.

The terminal is independent from project selection. It keeps its static status/control text unless the fake reboot interaction temporarily replaces it.

### 🧭 Project Selection

A project can be selected from three places: a desktop icon, the installed app list inside Start, or a search route.

When one of these controls is clicked, `app.js` reads the project id attached to the control, finds the matching object in `projects.js`, updates the selected visual state, and renders that project into the inspector window.

The same project object feeds every entry point, so the desktop, Start menu, search panel, and inspector point to the same data source.

### 🔬 Inspector

The inspector is a reusable window, not a separate block for every project.

When a project is selected, the inspector body is replaced with markup generated from that project object.

The rendered project view contains module, title, subtitle, route, category, type, job, problem, output, note, repository actions, and a derived GitHub Pages link.

The inspector window is labeled `EXPLODED.EXE` in the title bar. The label is visual chrome; the inspector still performs the same project-reading function.

The route is rendered as its own line because it is the fastest human entry point into the project: it explains when that project is useful.

Category and type are rendered together in a compact `spec-strip`. Job, problem, output, and note are rendered below in the main `specs` list.

The inspector is allowed to scroll internally on desktop and laptop when a project description is longer than the available viewport. This keeps the desktop layout stable without cutting project information.

### 🗂️ Start Menu

The Start menu is a fixed panel in `index.html`.

Its system/profile links are static HTML. Its installed app list is generated by `app.js` from `projects.js`.

The power menu is local UI fiction. Restart, sleep, hibernate, and power off do not call system APIs or reload the page. They trigger short toast messages.

### 🔎 Search Panel

The search panel is a secondary project entry point.

`app.js` creates its route list from project data. Each route represents a problem-style path back to one project.

Clicking a route opens the matching project in the inspector.

### 🔔 Tray And Toasts

The tray controls are local interface controls for help, volume, and settings.

They do not change persistent page state. When clicked, they pass a message to the toast function.

The toast is positioned near the clicked control, shown temporarily, then hidden again.

The same toast function is also used by fake window controls, Trash, and the Start power menu.

### 🔁 Fake Reboot

The `DEADPUNK_OS` label in the top bar is also an interactive control.

When it is clicked, `app.js` stores the current terminal markup, replaces the terminal content with a short fake reboot sequence, waits for the sequence timeout, then writes the original terminal markup back into the terminal.

This does not reload the page and does not reset project state. It only changes the terminal block temporarily.

### ⏳ Boot Overlay

The boot screen is the full-page overlay shown when the page first loads.

It sits above the OS interface and displays the boot text before the desktop becomes visible.

During normal execution, `app.js` hides the overlay after the configured delay.

If JavaScript is unavailable, the `noscript` fallback hides the boot overlay so the static page content is not permanently covered.

### 🛰️ Discovery Files

The branch includes static discovery files next to the page.

`llms.txt` is a plain-text project index. `raw-manifest.json` is a structured project manifest. `robots.txt` contains crawler rules and points to the sitemap. `sitemap.xml` exposes the public page URL.

These files are not generated in the browser at runtime. They are separate static files served with the page.

`llms.txt` and `raw-manifest.json` also include a short interface-structure note so readers can understand how the page exposes the same project set through desktop icons, Start entries, search routes, and inspector views.

### 🧾 Project Description Surfaces

The project set appears in multiple places.

The interactive page renders project views from `projects.js`. `llms.txt` describes the projects in plain text. `raw-manifest.json` describes them as structured JSON. The JSON-LD block in `index.html` provides page-level structured metadata.

These surfaces exist in parallel; they are not automatically synchronized by the browser.

</details>

## 🤖 AI-Assisted Work

This page was built through iterative work with AI assistance.

The concept, direction, review, corrections, and final decisions were human-led. AI was used for drafting, code edits, refactoring, debugging, and documentation support.

## 📜 License

This branch is licensed under Creative Commons Attribution-ShareAlike 4.0 International.

SPDX: `CC-BY-SA-4.0`

See [LICENSE](LICENSE).
