(function () {
  "use strict";

  const projects = Array.isArray(window.DEADPUNK_PROJECTS) ? window.DEADPUNK_PROJECTS : [];
  const topbarBrand = document.querySelector(".topbar-brand");
  const terminal = document.querySelector(".terminal-window");
  const terminalBody = document.querySelector(".terminal-body");
  const desktopIcons = document.getElementById("desktopIcons");
  const routeList = document.getElementById("routeList");
  const inspector = document.getElementById("inspector");
  const inspectorBody = document.getElementById("inspectorBody");
  const closeInspector = document.getElementById("closeInspector");
  const readmeButton = document.getElementById("readmeButton");
  const searchButton = document.getElementById("searchButton");
  const searchPanel = document.getElementById("searchPanel");
  const closeSearch = document.getElementById("closeSearch");
  const startButton = document.getElementById("startButton");
  const startMenu = document.getElementById("startMenu");
  const startApps = document.getElementById("startApps");
  const bootScreen = document.getElementById("bootScreen");
  const microToast = document.getElementById("microToast");
  let toastTimer = 0;
  let terminalHome = "";
  let rebootTimer = 0;

  const glyphs = {
    dial: "AD",
    tape: "MS",
    scale: "PV",
    lens: "PM",
    rail: "SR",
    filter: "CS",
    frame: "SX",
    boot: "PF"
  };

  function escapeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function renderProjectButtons() {
    if (!desktopIcons || !startApps || !routeList) return;

    desktopIcons.innerHTML = "";
    startApps.innerHTML = "";
    routeList.innerHTML = "";

    projects.forEach((project) => {
      desktopIcons.appendChild(createDesktopIcon(project));
      startApps.appendChild(createStartApp(project));
      routeList.appendChild(createRouteButton(project));
    });
  }

  function createDesktopIcon(project) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "desktop-icon";
    button.dataset.id = project.id;
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = `
      <span class="icon-plate" aria-hidden="true">
        <span class="icon-glyph">${escapeText(glyphs[project.icon] || "OS")}</span>
      </span>
      <span class="icon-label">${escapeText(project.title)}</span>
    `;
    button.addEventListener("click", () => {
      selectProject(project.id, true);
      setSearchPanel(false);
    });
    return button;
  }

  function createStartApp(project) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "start-app";
    button.dataset.id = project.id;
    button.innerHTML = `
      <span class="mini-icon" aria-hidden="true">${escapeText(glyphs[project.icon] || "OS")}</span>
      <span>
        <strong>${escapeText(project.title)}</strong>
        <small>${escapeText(project.category || project.type)}</small>
      </span>
    `;
    button.addEventListener("click", () => {
      selectProject(project.id, true);
      setStartMenu(false);
    });
    return button;
  }

  function createRouteButton(project) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "route-button";
    button.dataset.id = project.id;
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = `
      <span>${escapeText(project.route)}</span>
      <strong>${escapeText(project.title)}</strong>
    `;
    button.addEventListener("click", () => selectProject(project.id, true));
    return button;
  }

  function selectProject(projectId, focusInspector) {
    const project = projects.find((item) => item.id === projectId) || projects[0];
    if (!project || !inspector || !inspectorBody) return;

    updateSelection(project.id);
    inspector.classList.add("is-open");
    inspectorBody.innerHTML = `
      <p class="stamp">INSPECTING: ${escapeText(project.module)}</p>
      <h2>${escapeText(project.title)}</h2>
      <p class="subtitle">${escapeText(project.subtitle || project.type)}</p>
      <dl class="specs">
        ${renderSpec("CATEGORY", project.category || project.type)}
        ${renderSpec("TYPE", project.type)}
        ${renderSpec("JOB", project.job)}
        ${renderSpec("PROBLEM", project.problem)}
        ${renderSpec("OUTPUT", project.output)}
        ${renderSpec("NOTE", project.note)}
      </dl>
      <div class="actions">
        <a href="${escapeText(project.repo)}" target="_blank" rel="noopener noreferrer">open repo</a>
        <a href="${escapeText(project.repo)}/stargazers" target="_blank" rel="noopener noreferrer">star project</a>
        <button type="button" data-copy="${escapeText(project.repo)}">copy repo url</button>
      </div>
    `;

    const copyButton = inspectorBody.querySelector("[data-copy]");
    if (copyButton) copyButton.addEventListener("click", () => copyRepo(copyButton));
    if (focusInspector) inspector.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function renderReadme(focusInspector) {
    if (!inspector || !inspectorBody) return;

    updateSelection("");
    inspector.classList.add("is-open");
    inspectorBody.innerHTML = `
      <p class="stamp">INSPECTING: README.TXT</p>
      <h2>README</h2>
      <div class="readme-copy">
        <p>Not a portfolio.</p>
        <p>A small OS-shaped index for text systems, behavioral contracts, AI protocols, and project-control tools.</p>
        <p>I built these tools to reduce drift, force useful decisions, and keep messy AI-assisted work usable.</p>
      </div>
      <div class="actions">
        <a href="https://github.com/XxYouDeaDPunKxX" target="_blank" rel="noopener noreferrer">GitHub profile</a>
        <a href="https://github.com/XxYouDeaDPunKxX?tab=repositories" target="_blank" rel="noopener noreferrer">repositories</a>
        <a href="https://github.com/XxYouDeaDPunKxX/XxYouDeaDPunKxX" target="_blank" rel="noopener noreferrer">this page repo</a>
      </div>
    `;

    if (focusInspector) inspector.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function updateSelection(projectId) {
    document.querySelectorAll(".desktop-icon, .route-button").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.id === projectId ? "true" : "false");
    });

    document.querySelectorAll(".start-app").forEach((button) => {
      if (button.dataset.id === projectId) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  function renderSpec(label, value) {
    return `
      <div class="spec-row">
        <dt>${escapeText(label)}</dt>
        <dd>${escapeText(value)}</dd>
      </div>
    `;
  }

  async function copyRepo(button) {
    const repo = button.dataset.copy || "";
    try {
      await navigator.clipboard.writeText(repo);
      button.textContent = "copied";
    } catch {
      button.textContent = "copy failed";
    }

    window.setTimeout(() => {
      button.textContent = "copy repo url";
    }, 1200);
  }

  function setStartMenu(open) {
    if (!startButton || !startMenu) return;
    startMenu.hidden = !open;
    startButton.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function setSearchPanel(open) {
    if (!searchButton || !searchPanel) return;
    searchPanel.hidden = !open;
    searchButton.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function toggleStartMenu() {
    if (!startMenu) return;
    setStartMenu(startMenu.hidden);
  }

  function toggleSearchPanel() {
    if (!searchPanel) return;
    setSearchPanel(searchPanel.hidden);
  }

  function closeInspectorWindow() {
    if (!inspector) return;
    inspector.classList.remove("is-open");
    updateSelection("");
  }

  function hideBoot() {
    if (!bootScreen) return;
    bootScreen.classList.add("is-hidden");
  }

  function restoreTerminal() {
    if (!terminal || !terminalBody || !terminalHome) return;
    terminal.classList.remove("is-rebooting");
    terminalBody.innerHTML = terminalHome;
  }

  function runFakeReboot(event) {
    event.preventDefault();
    if (!terminal || !terminalBody || !terminalHome) return;

    window.clearTimeout(rebootTimer);
    terminal.classList.add("is-rebooting");
    terminalBody.innerHTML = `
      <ol class="fake-reboot" aria-label="DeadPunk OS fake reboot">
        <li><span class="check-warn">[!]</span> DEADPUNK_OS refused to look professional.</li>
        <li><span class="check-cold">[?]</span> system reboot</li>
        <li><span class="check-ok">[OK]</span> i'm joking <b aria-hidden="true">&lt;*&gt;</b></li>
        <li><span class="check-bad">[NO]</span> reboot denied. it barely started.</li>
      </ol>
    `;

    rebootTimer = window.setTimeout(restoreTerminal, 5200);
  }

  function showMicroToast(target) {
    if (!microToast) return;

    const rect = target.getBoundingClientRect();
    const left = Math.min(window.innerWidth - 120, Math.max(8, rect.left + rect.width / 2 - 48));
    const top = Math.min(window.innerHeight - 64, Math.max(8, rect.bottom + 8));

    microToast.style.left = `${left}px`;
    microToast.style.top = `${top}px`;
    microToast.hidden = false;
    microToast.classList.remove("is-visible");

    window.clearTimeout(toastTimer);
    window.requestAnimationFrame(() => {
      microToast.classList.add("is-visible");
    });

    toastTimer = window.setTimeout(() => {
      microToast.classList.remove("is-visible");
      window.setTimeout(() => {
        microToast.hidden = true;
      }, 120);
    }, 740);
  }

  function bindGlobalActions() {
    if (topbarBrand) topbarBrand.addEventListener("click", runFakeReboot);
    if (startButton) startButton.addEventListener("click", toggleStartMenu);
    if (searchButton) searchButton.addEventListener("click", toggleSearchPanel);
    if (closeSearch) closeSearch.addEventListener("click", () => setSearchPanel(false));
    if (closeInspector) closeInspector.addEventListener("click", closeInspectorWindow);
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("#readmeButton")) renderReadme(true);
    });

    document.querySelectorAll("[data-dead-control]").forEach((control) => {
      control.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        showMicroToast(control);
      });
    });

    document.addEventListener("click", (event) => {
      if (!startMenu || !startButton || startMenu.hidden) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!startMenu.contains(target) && !startButton.contains(target)) setStartMenu(false);
    });

    document.addEventListener("click", (event) => {
      if (!searchPanel || !searchButton || searchPanel.hidden) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!searchPanel.contains(target) && !searchButton.contains(target)) setSearchPanel(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      setStartMenu(false);
      setSearchPanel(false);
      closeInspectorWindow();
    });
  }

  function init() {
    if (terminalBody) terminalHome = terminalBody.innerHTML;
    renderProjectButtons();
    bindGlobalActions();
    selectProject(projects[0]?.id, false);
    window.setTimeout(hideBoot, 4000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
