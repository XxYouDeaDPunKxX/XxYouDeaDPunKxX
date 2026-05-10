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
  const powerButton = document.getElementById("powerButton");
  const powerMenu = document.getElementById("powerMenu");
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
    boot: "PF",
    r2: "R2"
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

  function focusElement(element) {
    if (!element || typeof element.focus !== "function") return;
    try {
      element.focus({ preventScroll: true });
    } catch {
      element.focus();
    }
  }

  function focusFirstControl(container, selector = "a[href], button:not([disabled])") {
    if (!container) return;
    const control = container.querySelector(selector);
    focusElement(control);
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
    const pageUrl = getProjectPageUrl(project.repo);

    updateSelection(project.id);
    openInspector();
    inspectorBody.innerHTML = `
      <p class="stamp">INSPECTING: ${escapeText(project.module)}</p>
      <h2>${escapeText(project.title)}</h2>
      <p class="subtitle">${escapeText(project.subtitle || project.type)}</p>
      <p class="route-line">${escapeText(project.route)}</p>
      <dl class="spec-strip">
        ${renderSpec("CATEGORY", project.category || project.type)}
        ${renderSpec("TYPE", project.type)}
      </dl>
      <dl class="specs">
        ${renderSpec("JOB", project.job)}
        ${renderSpec("PROBLEM", project.problem)}
        ${renderSpec("OUTPUT", project.output)}
        ${renderSpec("NOTE", project.note)}
      </dl>
      <div class="actions">
        <a href="${escapeText(project.repo)}" target="_blank" rel="noopener noreferrer">open repo</a>
        ${pageUrl ? `<a href="${escapeText(pageUrl)}" target="_blank" rel="noopener noreferrer">gh-page</a>` : ""}
        <button type="button" data-copy="${escapeText(project.repo)}">copy repo url</button>
      </div>
    `;

    const copyButton = inspectorBody.querySelector("[data-copy]");
    if (copyButton) copyButton.addEventListener("click", () => copyRepo(copyButton));
    if (focusInspector) focusInspectorWindow();
  }

  function getProjectPageUrl(repoUrl) {
    try {
      const url = new URL(repoUrl);
      if (url.hostname !== "github.com") return "";
      const [, owner, repo] = url.pathname.split("/");
      if (!owner || !repo) return "";
      return `https://${owner.toLowerCase()}.github.io/${repo.replace(/\/$/, "")}/`;
    } catch {
      return "";
    }
  }

  function renderReadme(focusInspector) {
    if (!inspector || !inspectorBody) return;

    updateSelection("");
    openInspector();
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
        <a href="https://github.com/XxYouDeaDPunKxX/XxYouDeaDPunKxX/tree/gh-pages" target="_blank" rel="noopener noreferrer">this page repo</a>
      </div>
    `;

    if (focusInspector) focusInspectorWindow();
  }

  function openInspector() {
    if (!inspector) return;
    inspector.hidden = false;
    inspector.removeAttribute("aria-hidden");
    inspector.classList.add("is-open");
  }

  function focusInspectorWindow() {
    if (!inspector) return;
    inspector.scrollIntoView({ block: "nearest", behavior: "smooth" });
    focusElement(inspector);
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

  function setStartMenu(open, focusPanel = false, returnFocus = false) {
    if (!startButton || !startMenu) return;
    startMenu.hidden = !open;
    startButton.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      setPowerMenu(false);
      if (focusPanel) window.requestAnimationFrame(() => focusFirstControl(startMenu, ".start-links a, .start-app"));
    } else if (returnFocus) {
      focusElement(startButton);
    }
  }

  function setSearchPanel(open, focusPanel = false, returnFocus = false) {
    if (!searchButton || !searchPanel) return;
    searchPanel.hidden = !open;
    searchButton.setAttribute("aria-expanded", open ? "true" : "false");
    if (open && focusPanel) {
      window.requestAnimationFrame(() => focusFirstControl(searchPanel, ".route-button"));
    } else if (!open && returnFocus) {
      focusElement(searchButton);
    }
  }

  function setPowerMenu(open, focusPanel = false, returnFocus = false) {
    if (!powerButton || !powerMenu) return;
    powerMenu.hidden = !open;
    powerButton.setAttribute("aria-expanded", open ? "true" : "false");
    if (open && focusPanel) {
      window.requestAnimationFrame(() => focusFirstControl(powerMenu, "[data-power-action]"));
    } else if (!open && returnFocus) {
      focusElement(powerButton);
    }
  }

  function toggleStartMenu() {
    if (!startMenu) return;
    setStartMenu(startMenu.hidden, true);
  }

  function toggleSearchPanel() {
    if (!searchPanel) return;
    setSearchPanel(searchPanel.hidden, true);
  }

  function togglePowerMenu() {
    if (!powerMenu) return;
    setPowerMenu(powerMenu.hidden, true);
  }

  function closeInspectorWindow(returnFocus = false) {
    if (!inspector) return;
    inspector.classList.remove("is-open");
    inspector.hidden = true;
    inspector.setAttribute("aria-hidden", "true");
    updateSelection("");
    if (returnFocus) focusElement(readmeButton);
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

  function showMicroToast(target, message = "nice try...") {
    if (!microToast) return;

    const rect = target.getBoundingClientRect();
    const toastWidth = Math.min(352, window.innerWidth - 16);
    const left = Math.min(window.innerWidth - toastWidth - 8, Math.max(8, rect.left + rect.width / 2 - toastWidth / 2));
    const top = Math.min(window.innerHeight - 64, Math.max(8, rect.bottom + 8));

    microToast.style.left = `${left}px`;
    microToast.style.top = `${top}px`;
    microToast.textContent = message;
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
    }, 1600);
  }

  function bindGlobalActions() {
    if (topbarBrand) topbarBrand.addEventListener("click", runFakeReboot);
    if (startButton) startButton.addEventListener("click", toggleStartMenu);
    if (searchButton) searchButton.addEventListener("click", toggleSearchPanel);
    if (closeSearch) closeSearch.addEventListener("click", () => setSearchPanel(false, false, true));
    if (closeInspector) closeInspector.addEventListener("click", () => closeInspectorWindow(true));
    if (powerButton) powerButton.addEventListener("click", togglePowerMenu);
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

    document.querySelectorAll("[data-toast]").forEach((control) => {
      control.addEventListener("click", () => {
        showMicroToast(control, control.dataset.toast || "nice try...");
      });
    });

    document.querySelectorAll("[data-power-action]").forEach((control) => {
      control.addEventListener("click", () => {
        const messages = {
          restart: "Restart? Don't push your luck.",
          sleep: "Sleep? I'll just close my eyes and hope the tape holds.",
          hibernate: "Hibernate? Bold of you to assume I can wake up.",
          shutdown: "shutdown sold separately"
        };
        const message = messages[control.dataset.powerAction] || "nice try...";
        setPowerMenu(false, false, true);
        showMicroToast(powerButton || control, message);
      });
    });

    document.addEventListener("click", (event) => {
      if (!startMenu || !startButton || startMenu.hidden) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!startMenu.contains(target) && !startButton.contains(target)) {
        setStartMenu(false);
        setPowerMenu(false);
      }
    });

    document.addEventListener("click", (event) => {
      if (!powerMenu || !powerButton || powerMenu.hidden) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!powerMenu.contains(target) && !powerButton.contains(target)) setPowerMenu(false);
    });

    document.addEventListener("click", (event) => {
      if (!searchPanel || !searchButton || searchPanel.hidden) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!searchPanel.contains(target) && !searchButton.contains(target)) setSearchPanel(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const powerWasOpen = Boolean(powerMenu && !powerMenu.hidden);
      const startWasOpen = Boolean(startMenu && !startMenu.hidden);
      const searchWasOpen = Boolean(searchPanel && !searchPanel.hidden);
      const returnTarget = startWasOpen || powerWasOpen ? startButton : searchWasOpen ? searchButton : readmeButton;

      setStartMenu(false);
      setSearchPanel(false);
      setPowerMenu(false);
      closeInspectorWindow();
      focusElement(returnTarget);
    });
  }

  function init() {
    if (terminalBody) terminalHome = terminalBody.innerHTML;
    renderProjectButtons();
    bindGlobalActions();
    renderReadme(false);
    window.setTimeout(hideBoot, 4000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
