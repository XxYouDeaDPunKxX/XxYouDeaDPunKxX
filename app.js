const grid = document.getElementById("moduleGrid");
const inspector = document.getElementById("inspector");
const seoList = document.getElementById("seoList");

const iconMap = {
  dial: "◉",
  tape: "▣",
  scale: "⚖",
  lens: "⌕",
  rail: "╫",
  filter: "⌬",
  frame: "▤",
  boot: "▰"
};

function renderModules() {
  grid.innerHTML = PROJECTS.map((project, index) => `
    <button class="module" data-id="${project.id}" style="--tilt:${index % 2 === 0 ? "-1.5deg" : "1.2deg"}">
      <span class="module-icon">${iconMap[project.icon] || "□"}</span>
      <span class="module-name">${project.module}</span>
      <span class="module-type">${project.type}</span>
    </button>
  `).join("");

  document.querySelectorAll(".module").forEach((button) => {
    button.addEventListener("click", () => {
      const project = PROJECTS.find((item) => item.id === button.dataset.id);
      openProject(project);
      document.querySelectorAll(".module").forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
    });
  });
}

function openProject(project) {
  if (!project) return;

  inspector.innerHTML = `
    <p class="stamp">INSPECTING: ${project.module}</p>
    <h1>${project.title}</h1>
    <p class="subtitle">${project.subtitle || project.type}</p>

    <dl class="specs">
      <div><dt>TYPE</dt><dd>${project.type}</dd></div>
      <div><dt>JOB</dt><dd>${project.job}</dd></div>
      <div><dt>PROBLEM</dt><dd>${project.problem}</dd></div>
      <div><dt>OUTPUT</dt><dd>${project.output}</dd></div>
      <div><dt>STATUS</dt><dd>${project.status}</dd></div>
    </dl>

    <div class="actions">
      <a href="${project.repo}" target="_blank" rel="noreferrer">open repo</a>
      <button type="button" id="copyModule">copy module name</button>
    </div>
  `;

  const copyButton = document.getElementById("copyModule");
  copyButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(project.module);
      copyButton.textContent = "copied";
      setTimeout(() => copyButton.textContent = "copy module name", 1200);
    } catch {
      copyButton.textContent = "copy failed";
      setTimeout(() => copyButton.textContent = "copy module name", 1200);
    }
  });
}

function renderSeoFallback() {
  seoList.innerHTML = PROJECTS.map(project => `
    <li>
      <a href="${project.repo}">${project.title}</a>: ${project.job}
    </li>
  `).join("");
}

renderModules();
renderSeoFallback();

setTimeout(() => {
  document.getElementById("boot")?.classList.add("hidden");
}, 1700);

if (PROJECTS[0]) {
  const first = document.querySelector(".module");
  first?.classList.add("selected");
  openProject(PROJECTS[0]);
}
