const grid = document.getElementById("moduleGrid");
const inspector = document.getElementById("inspector");
const seoList = document.getElementById("seoList");
const seoProjects = document.querySelector(".seo-projects");

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
      <div><dt>NOTE</dt><dd>${project.note}</dd></div>
    </dl>

    <div class="actions">
      <a href="${project.repo}" target="_blank" rel="noreferrer">open repo</a>
      <a href="${project.repo}/stargazers" target="_blank" rel="noreferrer">star project</a>
      <button type="button" id="copyRepo">copy repo url</button>
    </div>
  `;

  const copyButton = document.getElementById("copyRepo");
  copyButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(project.repo);
      copyButton.textContent = "copied";
      setTimeout(() => copyButton.textContent = "copy repo url", 1200);
    } catch {
      copyButton.textContent = "copy failed";
      setTimeout(() => copyButton.textContent = "copy repo url", 1200);
    }
  });
}

function renderSeoFallback() {
  seoList.innerHTML = PROJECTS.map(project => `
    <li>
      <a href="${project.repo}">${project.title}</a>: ${project.job}
    </li>
  `).join("");

  seoProjects?.setAttribute("hidden", "");
}

renderModules();
renderSeoFallback();

setTimeout(() => {
  document.getElementById("boot")?.classList.add("hidden");
}, 4000);

if (PROJECTS[0]) {
  const first = document.querySelector(".module");
  first?.classList.add("selected");
  openProject(PROJECTS[0]);
}
