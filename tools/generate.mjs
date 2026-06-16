#!/usr/bin/env node
// Regenerates the discovery surfaces from projects.js, the single source of truth.
//
//   node tools/generate.mjs          write llms.txt, raw-manifest.json, index.html JSON-LD
//   node tools/generate.mjs --check  fail (exit 1) if any surface is out of sync
//
// Static prose/metadata lives in tools/templates/. Only project-derived sections
// are generated here, so the project list can never silently drift between files.

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templates = path.join(root, "tools", "templates");
const rel = (p) => path.relative(root, p);

function loadProjects() {
  const code = fs.readFileSync(path.join(root, "projects.js"), "utf8");
  const sandbox = { window: {} };
  vm.runInContext(code, vm.createContext(sandbox));
  const projects = sandbox.window.DEADPUNK_PROJECTS;
  if (!Array.isArray(projects) || projects.length === 0) {
    throw new Error("projects.js did not define window.DEADPUNK_PROJECTS");
  }
  return projects;
}

const VALID_SCHEMA_TYPES = new Set(["CreativeWork", "SoftwareSourceCode"]);
const REQUIRED_FIELDS = [
  "id",
  "schemaType",
  "module",
  "title",
  "type",
  "category",
  "route",
  "job",
  "problem",
  "output",
  "repo",
  "note",
  "icon",
];

function validateProjects(projects) {
  const errors = [];
  const seenIds = new Map();
  const seenRoutes = new Map();

  projects.forEach((p, index) => {
    const label = p.id ? `project "${p.id}"` : `project at index ${index}`;

    for (const field of REQUIRED_FIELDS) {
      if (typeof p[field] !== "string" || p[field].trim() === "") {
        errors.push(`${label} is missing required field: ${field}`);
      }
    }

    if (p.schemaType && !VALID_SCHEMA_TYPES.has(p.schemaType)) {
      errors.push(
        `${label} has invalid schemaType "${p.schemaType}" ` +
          `(expected one of: ${[...VALID_SCHEMA_TYPES].join(", ")})`,
      );
    }

    if (p.id) {
      if (seenIds.has(p.id)) errors.push(`duplicate id: ${p.id}`);
      seenIds.set(p.id, true);
    }
    if (p.route) {
      if (seenRoutes.has(p.route)) errors.push(`duplicate route: ${p.route}`);
      seenRoutes.set(p.route, true);
    }
  });

  if (errors.length) {
    throw new Error(
      `Invalid projects.js (the single source of truth):\n` +
        errors.map((e) => `  - ${e}`).join("\n"),
    );
  }
}

function uniqueCategories(projects) {
  return [...new Set(projects.map((p) => p.category))];
}

function buildLlms(projects) {
  const head = fs.readFileSync(path.join(templates, "llms-head.txt"), "utf8");
  const routing = projects.map((p) => `${p.route} -> ${p.title}`).join("\n");
  const categories = uniqueCategories(projects)
    .map((c) => `- ${c}`)
    .join("\n");
  const blocks = projects
    .map((p) =>
      [
        `### ${p.title}`,
        `Category: ${p.category}`,
        `Type: ${p.type}`,
        `Route: ${p.route}`,
        `Job: ${p.job}`,
        `Problem: ${p.problem}`,
        `Output: ${p.output}`,
        `Note: ${p.note}`,
        `Repository: ${p.repo}`,
      ].join("\n"),
    )
    .join("\n\n");
  return `${head}${routing}\n\n## Categories\n\n${categories}\n\n## Projects\n\n${blocks}\n`;
}

function buildManifest(projects) {
  const meta = JSON.parse(
    fs.readFileSync(path.join(templates, "manifest-meta.json"), "utf8"),
  );
  const routing = projects.map((p) => ({ trigger: p.route, project_id: p.id }));
  const projectList = projects.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    type: p.type,
    route: p.route,
    job: p.job,
    problem: p.problem,
    output: p.output,
    note: p.note,
    repository: p.repo,
  }));
  const manifest = {
    ...meta,
    routing,
    projects: projectList,
    categories: uniqueCategories(projects),
  };
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

function buildJsonLd(projects) {
  const base = JSON.parse(
    fs.readFileSync(path.join(templates, "jsonld-base.json"), "utf8"),
  );
  base.hasPart.itemListElement = projects.map((p, index) => {
    const item = {
      "@type": p.schemaType,
      name: p.title,
      description: p.problem,
    };
    if (p.schemaType === "SoftwareSourceCode") {
      item.codeRepository = p.repo;
    } else {
      item.url = p.repo;
    }
    return { "@type": "ListItem", position: index + 1, item };
  });
  return JSON.stringify(base, null, 2);
}

const LD_BLOCK = /(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/;

function buildIndexHtml(projects) {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  if (!LD_BLOCK.test(html)) {
    throw new Error("Could not find the JSON-LD <script> block in index.html");
  }
  const jsonLd = buildJsonLd(projects);
  return html.replace(LD_BLOCK, `$1\n${jsonLd}\n  $2`);
}

const targets = (projects) => [
  { file: path.join(root, "llms.txt"), content: buildLlms(projects) },
  { file: path.join(root, "raw-manifest.json"), content: buildManifest(projects) },
  { file: path.join(root, "index.html"), content: buildIndexHtml(projects) },
];

function main() {
  const check = process.argv.includes("--check");
  const projects = loadProjects();
  validateProjects(projects);
  const outputs = targets(projects);
  const stale = [];

  for (const { file, content } of outputs) {
    if (check) {
      const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
      if (current !== content) stale.push(rel(file));
    } else {
      fs.writeFileSync(file, content);
      console.log(`wrote ${rel(file)}`);
    }
  }

  if (check) {
    if (stale.length) {
      console.error(
        `Discovery files are out of sync with projects.js:\n` +
          stale.map((f) => `  - ${f}`).join("\n") +
          `\n\nRun "npm run generate" and commit the result.`,
      );
      process.exit(1);
    }
    console.log(`All discovery files are in sync (${projects.length} projects).`);
  }
}

main();
