(function () {
  "use strict";

  const projects = Array.isArray(window.DEADPUNK_PROJECTS) ? window.DEADPUNK_PROJECTS : [];
  const moduleList = document.getElementById("moduleList");
  const inspector = document.getElementById("inspector");
  const eventLog = document.getElementById("eventLog");
  const moduleCount = document.getElementById("moduleCount");
  const diskCount = document.getElementById("diskCount");
  const bootScreen = document.getElementById("bootScreen");

  const icons = {
    dial: "◎",
    tape: "◈",
    scale: "⚖",
    lens: "⌕",
    rail: "╫",
    filter: "⌬",
    frame: "▤",
    boot: "⚒"
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

  function setCount() {
    const count = String(projects.length);
    if (moduleCount) moduleCount.textContent = count;
    if (diskCount) diskCount.textContent = count;
  }

  function appendLog(message) {
    if (!eventLog) return;

    const index = String(eventLog.children.length).padStart(2, "0");
    const item = document.createElement("li");
    item.innerHTML = `<span>${index}</span> ${escapeText(message)}`;
    eventLog.appendChild(item);

    while (eventLog.children.length > 7) {
      eventLog.removeChild(eventLog.firstElementChild);
    }
  }

  function renderModules() {
    if (!moduleList) return;

    moduleList.innerHTML = "";

    projects.forEach((project, index) => {
      const item = document.createElement("li");
      item.className = "module-item";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "module-card";
      button.dataset.id = project.id;
      button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      button.innerHTML = `
        <span class="module-icon" aria-hidden="true">${escapeText(icons[project.icon] || "□")}</span>
        <span class="module-name">${escapeText(project.module)}</span>
        <span class="module-type">${escapeText(project.type)}</span>
      `;
      button.addEventListener("click", () => selectProject(project.id, true));
      item.appendChild(button);
      moduleList.appendChild(item);
    });
  }

  function selectProject(projectId, userInitiated) {
    const project = projects.find((item) => item.id === projectId) || projects[0];
    if (!project || !inspector) return;

    document.querySelectorAll(".module-card").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.id === project.id ? "true" : "false");
    });

    inspector.innerHTML = `
      <p class="stamp">INSPECTING: ${escapeText(project.module)}</p>
      <h2>${escapeText(project.title)}</h2>
      <p class="subtitle">${escapeText(project.subtitle || project.type)}</p>
      <dl class="specs">
        ${renderSpec("TYPE", project.type)}
        ${renderSpec("JOB", project.job)}
        ${renderSpec("PROBLEM", project.problem)}
        ${renderSpec("OUTPUT", project.output)}
        ${renderSpec("NOTE", project.note)}
      </dl>
      <div class="actions">
        <a href="${escapeText(project.repo)}" rel="noreferrer">open repo</a>
        <a href="${escapeText(project.repo)}/stargazers" rel="noreferrer">star project</a>
        <button type="button" data-copy="${escapeText(project.repo)}">copy repo url</button>
      </div>
    `;

    const copyButton = inspector.querySelector("[data-copy]");
    if (copyButton) {
      copyButton.addEventListener("click", () => copyRepo(copyButton));
    }

    appendLog(`${project.module} mounted${userInitiated ? " by operator" : " on boot"}`);
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
      appendLog("repo URL copied to clipboard");
    } catch {
      button.textContent = "copy failed";
      appendLog("clipboard refused the spare wire");
    }

    window.setTimeout(() => {
      button.textContent = "copy repo url";
    }, 1200);
  }

  function hideBoot() {
    if (!bootScreen) return;
    bootScreen.classList.add("is-hidden");
  }

  function init() {
    setCount();
    renderModules();
    selectProject(projects[0]?.id, false);
    window.setTimeout(hideBoot, 4000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
