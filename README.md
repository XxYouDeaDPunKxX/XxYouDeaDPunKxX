# DeadPunk OS GitHub Page

Static GitHub Page for the `XxYouDeaDPunKxX` profile.

This is not a portfolio page. It is an OS-shaped index for text systems, behavioral contracts, AI protocols, and project-control tools.

Public page:

```text
https://xxyoudeadpunkxx.github.io/XxYouDeaDPunKxX/
```

## Files

```text
index.html          page shell, SEO metadata, OS layout
style.css           visual system, responsive layout, UI states
projects.js         project data used by icons, Start, router, inspector
app.js              rendering, window interactions, fake reboot, micro-toast
llms.txt            LLM-readable project index
raw-manifest.json   machine-readable project manifest
robots.txt          crawler rules and sitemap pointer
sitemap.xml         public page discovery
```

## Project Data

Edit `projects.js`.

Each project object feeds:

```text
desktop icon
Start menu app
WHAT BROKE? search route
INSPECTING window
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

## Discovery Files

Keep `llms.txt` and `raw-manifest.json` aligned with `projects.js` when project descriptions, routing, or categories change.

## License

This branch is licensed under Creative Commons Attribution-ShareAlike 4.0 International.

SPDX: `CC-BY-SA-4.0`

See [LICENSE](LICENSE).
