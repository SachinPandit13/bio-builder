function requireElement(id) {
  const element = document.getElementById(id);
  if (element === null) {
    throw new Error(`Missing element #${id}`);
  }
  return element;
}

function requireQuery(selector) {
  const element = document.querySelector(selector);
  if (element === null) {
    throw new Error(`Missing element ${selector}`);
  }
  return element;
}

const form = requireElement("biodataForm");
const paper = requireElement("biodataPaper");
const portrait = requireElement("portrait");
const portraitFrame = requireQuery(".portrait-frame");
const photoInput = requireElement("photoInput");
const photoToggle = requireElement("photoToggle");
const uploadPreview = requireElement("uploadPreview");
const toast = requireElement("toast");
const biodataStudio = requireElement("biodataStudio");
const resumeStudio = requireElement("resumeStudio");
const biodataTab = requireElement("biodataTab");
const resumeTab = requireElement("resumeTab");
const introEyebrow = requireElement("introEyebrow");
const introTitle = requireElement("introTitle");
const introCopy = requireElement("introCopy");
const resumeForm = requireElement("resumeForm");
const resumePaper = requireElement("resumePaper");
const experienceList = requireElement("experienceList");
const educationList = requireElement("educationList");
const skillGroupList = requireElement("skillGroupList");
const certificateList = requireElement("certificateList");

const accentColors = {
  blue: "#1d4f91",
  navy: "#1b2430",
  teal: "#1f6b56",
  burgundy: "#8b2e42"
};

const personalFields = [
  ["Full Name", "fullName"], ["Date of Birth", "dob"], ["Birth Time", "birthTime"],
  ["Birth Place", "birthPlace"], ["Height", "height"], ["Religion", "religion"],
  ["Community", "community"], ["Gotra", "gotra"], ["Rashi", "rashi"],
  ["Manglik Status", "manglik"], ["Complexion", "complexion"], ["Blood Group", "bloodGroup"],
  ["Education", "education"], ["Occupation", "occupation"]
];
const familyFields = [
  ["Father's Name", "fatherName"], ["Father's Occupation", "fatherOccupation"],
  ["Mother's Name", "motherName"], ["Mother's Occupation", "motherOccupation"],
  ["Brothers", "brothers"], ["Sisters", "sisters"], ["Maternal Uncle", "maternalUncle"],
  ["Relatives", "relatives"]
];
const contactFields = [["Mobile Number", "mobile"], ["Address", "address"]];

const templateMeta = {
  floral: { title: "Marriage Biodata", symbol: "ॐ", blessing: "॥ श्री गणेशाय नमः ॥" },
  classic: { title: "विवाह परिचय", symbol: "श्री", blessing: "॥ शुभ मंगलम् ॥" },
  royal: { title: "Marriage Biodata", symbol: "ॐ", blessing: "॥ श्री गणेशाय नमः ॥" },
  minimal: { title: "Marriage Biodata", symbol: "✦", blessing: "A PERSONAL INTRODUCTION" },
  botanical: { title: "Marriage Biodata", symbol: "❧", blessing: "A beautiful beginning" },
  blush: { title: "Marriage Biodata", symbol: "♡", blessing: "॥ शुभ विवाह ॥" },
  maroon: { title: "विवाह बायोडाटा", symbol: "ॐ", blessing: "॥ श्री गणेशाय नमः ॥" }
};

const studioCopy = {
  biodata: {
    eyebrow: "A thoughtful first impression",
    title: "Your story, beautifully arranged.",
    copy: "Create a polished marriage biodata in minutes. Add your details, choose a design, and export a print-ready PDF."
  },
  resume: {
    eyebrow: "A professional first impression",
    title: "Your experience, clearly presented.",
    copy: "Build a polished resume in minutes. Add your roles, choose a format, and export a print-ready PDF."
  }
};

const starterExperience = [
  {
    role: "Senior Product Manager",
    company: "Northstar Labs",
    dates: "2021 — Present",
    location: "Pune",
    bullets: "Led the payments roadmap for a 12-person squad and shipped checkout improvements that raised completion by 18%.\nDefined success metrics with data and design partners, and ran quarterly planning with engineering leadership.\nMentored two associate product managers and introduced a shared discovery ritual."
  },
  {
    role: "Product Manager",
    company: "Brightline",
    dates: "2018 — 2021",
    location: "Mumbai",
    bullets: "Launched a self-serve onboarding flow that cut time-to-value from 6 days to 2.\nPartnered with sales on enterprise requirements and kept the roadmap focused on the highest-retention segments."
  }
];

const starterEducation = [
  { school: "Indian Institute of Management Bangalore", credential: "MBA", year: "2018" },
  { school: "College of Engineering Pune", credential: "B.Tech, Computer Engineering", year: "2016" }
];

let currentMode = "biodata";

function getValue(owner, name) {
  const field = owner.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
    return field.value.trim();
  }
  return "";
}

function makeDetailRows(fields) {
  const fragment = document.createDocumentFragment();
  fields.forEach(([label, key]) => {
    const value = getValue(form, key);
    if (!value) return;
    const row = document.createElement("div");
    row.className = "detail-row";
    const labelEl = document.createElement("span");
    labelEl.className = "detail-label";
    labelEl.textContent = label;
    const valueEl = document.createElement("span");
    valueEl.className = "detail-value";
    valueEl.textContent = value;
    row.append(labelEl, valueEl);
    fragment.appendChild(row);
  });
  return fragment;
}

function renderDetails() {
  requireElement("personalDetails").replaceChildren(makeDetailRows(personalFields));
  requireElement("familyDetails").replaceChildren(makeDetailRows(familyFields));
  requireElement("contactDetails").replaceChildren(makeDetailRows(contactFields));
  const name = getValue(form, "fullName") || "Marriage Biodata";
  requireElement("footerName").textContent = name;
  const meta = templateMeta[paper.dataset.template || "floral"] || templateMeta.floral;
  requireElement("paperTitle").textContent = meta.title;
  requireElement("symbolMark").textContent = meta.symbol;
  requireElement("paperBlessing").textContent = meta.blessing;
  if (currentMode === "biodata") {
    document.title = `${name} — Marriage Biodata`;
  }
}

let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function applyPhotoVisibility() {
  paper.classList.toggle("show-photo", photoToggle.checked);
}

const STORAGE_KEY = "vivah_app_state_v1";
let isRestoring = false;
let saveTimer = null;

function serializeForm(formEl) {
  const fields = {};
  const elements = formEl.elements;
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (el.type === "file" || el.type === "submit" || el.type === "button") continue;
    const key = el.name || el.id;
    if (key) {
      if (el.type === "checkbox") {
        fields[key] = el.checked;
      } else {
        fields[key] = el.value;
      }
    }
  }
  return fields;
}

function deserializeForm(formEl, fields) {
  if (!fields || typeof fields !== "object") return;
  Object.entries(fields).forEach(([key, val]) => {
    const el = formEl.elements.namedItem(key) || document.getElementById(key);
    if (!el) return;
    if (el.type === "checkbox") {
      el.checked = Boolean(val);
    } else {
      el.value = val;
    }
  });
}

function saveState() {
  if (isRestoring) return;
  try {
    const state = {
      mode: currentMode,
      biodata: {
        fields: serializeForm(form),
        template: paper.dataset.template || "floral",
        showPhoto: photoToggle.checked,
        portraitData: portrait.getAttribute("src") || ""
      },
      resume: {
        fields: serializeForm(resumeForm),
        format: resumePaper.dataset.format || "it",
        accent: resumePaper.dataset.accent || "blue",
        experience: readExperience(),
        education: readEntries(educationList, ["school", "credential", "year", "score"]),
        skillGroups: readEntries(skillGroupList, ["category", "skills"]),
        certificates: readEntries(certificateList, ["name", "issuer", "date"])
      }
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (quotaErr) {
      if (state.biodata && state.biodata.portraitData) {
        state.biodata.portraitData = "";
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    }
  } catch (err) {
    console.warn("Could not save state to localStorage", err);
  }
}

function debouncedSave() {
  if (isRestoring) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, 250);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : null;
  } catch (err) {
    return null;
  }
}

function selectTemplate(choice) {
  const template = choice.dataset.template || "floral";
  document.querySelectorAll("#templateStrip .template-choice").forEach((button) => {
    const active = button === choice;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  paper.dataset.template = template;
  renderDetails();
  saveState();
}

function entryValue(entry, field) {
  const control = entry.querySelector(`:scope > .field-grid [data-field="${field}"]`);
  return control ? control.value.trim() : "";
}

function sectionEnabled(id) {
  const toggle = document.getElementById(id);
  return !toggle || toggle.checked;
}

function labeledControl(label, control, full) {
  const wrap = document.createElement("label");
  wrap.className = full ? "field full" : "field";
  const caption = document.createElement("span");
  caption.textContent = label;
  wrap.append(caption, control);
  return wrap;
}

function textControl(field, value, placeholder) {
  const input = document.createElement("input");
  input.dataset.field = field;
  input.value = value || "";
  input.placeholder = placeholder || "";
  return input;
}

function areaControl(field, value, placeholder) {
  const area = document.createElement("textarea");
  area.dataset.field = field;
  area.rows = 3;
  area.value = value || "";
  area.placeholder = placeholder || "";
  return area;
}

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}
window.refreshIcons = refreshIcons;

function createProject(data) {
  const article = document.createElement("article");
  article.className = "repeat-entry project-entry";
  const head = document.createElement("div");
  head.className = "entry-head";
  const title = document.createElement("strong");
  title.textContent = "Project";
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "btn btn-quiet entry-remove";
  remove.innerHTML = '<i data-lucide="trash-2"></i> Remove';
  remove.addEventListener("click", () => {
    article.remove();
    renderResume();
    saveState();
  });
  head.append(title, remove);
  const grid = document.createElement("div");
  grid.className = "field-grid";
  grid.append(
    labeledControl("Project name", textControl("projectName", data.name, "Project name"), true),
    labeledControl("Dates", textControl("projectDates", data.dates, "2024 — Present")),
    labeledControl("Highlights", areaControl("projectBullets", data.bullets, "One highlight per line"), true)
  );
  article.append(head, grid);
  return article;
}

function createEntry(kind, data) {
  const article = document.createElement("article");
  article.className = "repeat-entry";
  const head = document.createElement("div");
  head.className = "entry-head";
  const title = document.createElement("strong");
  const labels = { experience: "Role", education: "Education", skill: "Skill group", certificate: "Certificate" };
  title.textContent = labels[kind] || "Entry";
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "btn btn-quiet entry-remove";
  remove.innerHTML = '<i data-lucide="trash-2"></i> Remove';
  remove.addEventListener("click", () => {
    article.remove();
    renderResume();
    saveState();
  });
  head.append(title, remove);
  const grid = document.createElement("div");
  grid.className = "field-grid";
  if (kind === "experience") {
    grid.append(
      labeledControl("Job title", textControl("role", data.role, "e.g. Software Engineer")),
      labeledControl("Company", textControl("company", data.company, "Company")),
      labeledControl("Dates", textControl("dates", data.dates, "2021 — Present")),
      labeledControl("Location", textControl("location", data.location, "City")),
      labeledControl("Highlights", areaControl("bullets", data.bullets, "One highlight per line"), true)
    );
    const projects = document.createElement("div");
    projects.className = "project-list";
    (data.projects || []).forEach((project) => projects.appendChild(createProject(project)));
    const addProject = document.createElement("button");
    addProject.type = "button";
    addProject.className = "btn btn-outline add-entry";
    addProject.innerHTML = '<i data-lucide="plus"></i> Add project';
    addProject.addEventListener("click", () => {
      projects.appendChild(createProject({}));
      refreshIcons();
      renderResume();
      saveState();
    });
    article.append(head, grid, projects, addProject);
    return article;
  }
  if (kind === "skill") {
    grid.append(
      labeledControl("Category", textControl("category", data.category, "e.g. Languages"), true),
      labeledControl("Skills", textControl("skills", data.skills, "Python, SQL, TypeScript"), true)
    );
  } else if (kind === "certificate") {
    grid.append(
      labeledControl("Name", textControl("name", data.name, "Certificate name"), true),
      labeledControl("Issuer", textControl("issuer", data.issuer, "Issuer")),
      labeledControl("Date", textControl("date", data.date, "2024"))
    );
  } else {
    grid.append(
      labeledControl("School", textControl("school", data.school, "School or university"), true),
      labeledControl("Credential", textControl("credential", data.credential, "Degree or certificate")),
      labeledControl("Year", textControl("year", data.year, "2018")),
      labeledControl("Score", textControl("score", data.score, "CGPA: 7.93 / 10"))
    );
  }
  article.append(head, grid);
  return article;
}

function fillEntries(list, kind, rows) {
  list.replaceChildren(...rows.map((row) => createEntry(kind, row)));
  refreshIcons();
}

function readEntries(list, fields) {
  return [...list.querySelectorAll(":scope > .repeat-entry")].map((entry) => {
    const record = {};
    fields.forEach((field) => {
      record[field] = entryValue(entry, field);
    });
    return record;
  }).filter((record) => Object.values(record).some(Boolean));
}

function appendParagraph(parent, className, text) {
  if (!text) return;
  const paragraph = document.createElement("p");
  paragraph.className = className;
  paragraph.textContent = text;
  parent.appendChild(paragraph);
}

function appendBullets(parent, text) {
  const lines = String(text || "").split("\n").map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return;
  const list = document.createElement("ul");
  list.className = "resume-bullets";
  lines.forEach((line) => {
    const item = document.createElement("li");
    item.textContent = line;
    list.appendChild(item);
  });
  parent.appendChild(list);
}

function readProjects(entry) {
  return [...entry.querySelectorAll(":scope > .project-list > .project-entry")].map((project) => ({
    name: entryValue(project, "projectName"),
    dates: entryValue(project, "projectDates"),
    bullets: entryValue(project, "projectBullets")
  })).filter((project) => project.name || project.dates || project.bullets);
}

function readExperience() {
  return [...experienceList.querySelectorAll(":scope > .repeat-entry")].map((entry) => {
    const record = {
      role: entryValue(entry, "role"),
      company: entryValue(entry, "company"),
      dates: entryValue(entry, "dates"),
      location: entryValue(entry, "location"),
      bullets: entryValue(entry, "bullets"),
      projects: readProjects(entry)
    };
    return record;
  }).filter((record) => record.role || record.company || record.dates || record.location || record.bullets || record.projects.length);
}

function setHeading(id, text) {
  const heading = requireElement(id).querySelector("h3");
  if (heading) heading.textContent = text;
}

function renderResume() {
  const it = (resumePaper.dataset.format || "it") === "it";
  const name = getValue(resumeForm, "resumeName") || "Resume";
  const title = getValue(resumeForm, "jobTitle");
  const contact = ["email", "phone", "linkedin", "website", "github", "city"].map((key) => getValue(resumeForm, key)).filter(Boolean);
  const summary = getValue(resumeForm, "summary");
  const experience = readExperience();
  const education = readEntries(educationList, ["school", "credential", "year", "score"]);
  const skillGroups = readEntries(skillGroupList, ["category", "skills"]);
  const skills = getValue(resumeForm, "skills").split(",").map((skill) => skill.trim()).filter(Boolean);
  const achievements = getValue(resumeForm, "achievements").split("\n").map((line) => line.trim()).filter(Boolean);
  const certificates = readEntries(certificateList, ["name", "issuer", "date"]);

  requireElement("resumeName").textContent = name;
  const roleEl = requireElement("resumeRole");
  roleEl.textContent = title;
  roleEl.hidden = !title;
  const contactEl = requireElement("resumeContact");
  contactEl.textContent = contact.join("  ·  ");
  contactEl.hidden = contact.length === 0;

  setHeading("resumeSummarySection", it ? "Professional Summary" : "Summary");
  setHeading("resumeSkillsSection", it ? "Core Technical Skills" : "Skills");
  setHeading("resumeExperienceSection", it ? "Professional Experience" : "Experience");
  setHeading("resumeEducationSection", "Education");

  const summaryEl = requireElement("resumeSummary");
  summaryEl.textContent = summary;
  requireElement("resumeSummarySection").hidden = !sectionEnabled("toggleSummary") || !summary;

  const experienceRoot = requireElement("resumeExperience");
  experienceRoot.replaceChildren();
  experience.forEach((item) => {
    const block = document.createElement("article");
    block.className = "role-item";
    if (it) {
      const line = document.createElement("div");
      line.className = "role-line";
      const heading = document.createElement("strong");
      heading.className = "role-title";
      heading.textContent = [item.role, item.company, item.location].filter(Boolean).join(" | ");
      line.appendChild(heading);
      if (item.dates) {
        const dates = document.createElement("span");
        dates.className = "role-dates";
        dates.textContent = item.dates;
        line.appendChild(dates);
      }
      if (heading.textContent || item.dates) block.appendChild(line);
      if (item.projects.length) {
        item.projects.forEach((project) => {
          const projectBlock = document.createElement("article");
          projectBlock.className = "project-item";
          if (project.name) {
            const projectName = document.createElement("p");
            projectName.className = "project-name";
            projectName.textContent = `Project: ${project.name}`;
            projectBlock.appendChild(projectName);
          }
          appendParagraph(projectBlock, "resume-meta", project.dates);
          appendBullets(projectBlock, project.bullets);
          block.appendChild(projectBlock);
        });
      } else {
        appendBullets(block, item.bullets);
      }
    } else {
      const heading = document.createElement("strong");
      heading.className = "role-title";
      heading.textContent = item.role || item.company;
      if (item.role || item.company) block.appendChild(heading);
      const meta = [item.role && item.company ? item.company : "", item.dates, item.location].filter(Boolean).join("  ·  ");
      appendParagraph(block, "resume-meta", meta);
      appendBullets(block, item.bullets);
    }
    experienceRoot.appendChild(block);
  });
  requireElement("resumeExperienceSection").hidden = !sectionEnabled("toggleExperience") || experience.length === 0;

  const educationRoot = requireElement("resumeEducation");
  educationRoot.replaceChildren();
  education.forEach((item) => {
    const block = document.createElement("article");
    block.className = "edu-item";
    if (it) {
      const line = document.createElement("p");
      line.className = "edu-line";
      const credential = document.createElement("strong");
      credential.textContent = item.credential || item.school;
      line.appendChild(credential);
      const rest = [item.credential ? item.school : "", item.year].filter(Boolean);
      if (rest.length) line.append(` | ${rest.join(" | ")}`);
      if (credential.textContent) block.appendChild(line);
      appendParagraph(block, "resume-meta", item.score);
    } else {
      const heading = document.createElement("strong");
      heading.className = "edu-credential";
      heading.textContent = item.credential || item.school;
      if (item.credential || item.school) block.appendChild(heading);
      const meta = [item.credential ? item.school : "", item.year, item.score].filter(Boolean).join("  ·  ");
      appendParagraph(block, "resume-meta", meta);
    }
    educationRoot.appendChild(block);
  });
  requireElement("resumeEducationSection").hidden = !sectionEnabled("toggleEducation") || education.length === 0;

  const skillsRoot = requireElement("resumeSkills");
  skillsRoot.replaceChildren();
  if (it) {
    skillGroups.forEach((group) => {
      const row = document.createElement("div");
      row.className = "skill-row";
      const label = document.createElement("strong");
      label.textContent = group.category;
      const value = document.createElement("span");
      value.textContent = group.skills;
      if (group.category) row.appendChild(label);
      if (group.skills) row.appendChild(value);
      skillsRoot.appendChild(row);
    });
    requireElement("resumeSkillsSection").hidden = !sectionEnabled("toggleSkills") || skillGroups.length === 0;
  } else {
    const list = document.createElement("ul");
    list.className = "resume-skills";
    skills.forEach((skill) => {
      const li = document.createElement("li");
      li.textContent = skill;
      list.appendChild(li);
    });
    skillsRoot.appendChild(list);
    requireElement("resumeSkillsSection").hidden = !sectionEnabled("toggleSkills") || skills.length === 0;
  }

  const achievementsRoot = requireElement("resumeAchievements");
  achievementsRoot.replaceChildren();
  achievements.forEach((line) => {
    const item = document.createElement("li");
    item.textContent = line;
    achievementsRoot.appendChild(item);
  });
  requireElement("resumeAchievementsSection").hidden = !it || !sectionEnabled("toggleAchievements") || achievements.length === 0;

  const certificatesRoot = requireElement("resumeCertificates");
  certificatesRoot.replaceChildren();
  certificates.forEach((item) => {
    const block = document.createElement("article");
    block.className = "cert-item";
    const line = document.createElement("div");
    line.className = "role-line";
    const heading = document.createElement("strong");
    heading.className = "role-title";
    heading.textContent = [item.name, item.issuer].filter(Boolean).join(" | ");
    line.appendChild(heading);
    if (item.date) {
      const date = document.createElement("span");
      date.className = "role-dates";
      date.textContent = item.date;
      line.appendChild(date);
    }
    block.appendChild(line);
    certificatesRoot.appendChild(block);
  });
  requireElement("resumeCertificatesSection").hidden = !it || !sectionEnabled("toggleCertificates") || certificates.length === 0;

  if (currentMode === "resume") {
    document.title = `${name} — Resume`;
  }
}

function selectAccent(choice) {
  const accent = accentColors[choice.dataset.accent] ? choice.dataset.accent : "blue";
  document.querySelectorAll("#accentRow .accent-swatch").forEach((button) => {
    const active = button === choice;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  resumePaper.dataset.accent = accent;
  saveState();
}

function selectFormat(choice) {
  const format = choice.dataset.format || "it";
  document.querySelectorAll("#resumeFormats .template-choice").forEach((button) => {
    const active = button === choice;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  resumePaper.dataset.format = format;
  renderResume();
  saveState();
}

function setMode(mode) {
  currentMode = mode;
  const copy = studioCopy[mode];
  biodataStudio.hidden = mode !== "biodata";
  resumeStudio.hidden = mode !== "resume";
  biodataTab.setAttribute("aria-selected", mode === "biodata" ? "true" : "false");
  resumeTab.setAttribute("aria-selected", mode === "resume" ? "true" : "false");
  biodataTab.tabIndex = mode === "biodata" ? 0 : -1;
  resumeTab.tabIndex = mode === "resume" ? 0 : -1;
  introEyebrow.textContent = copy.eyebrow;
  introTitle.textContent = copy.title;
  introCopy.textContent = copy.copy;
  if (mode === "biodata") renderDetails();
  else renderResume();
  refreshIcons();
  saveState();
}

function slugify(value) {
  return value.normalize("NFKD").replace(/[^\w -]/g, "").trim().replace(/\s+/g, "-").toLowerCase();
}

function activePaper() {
  return currentMode === "resume" ? resumePaper : paper;
}

form.addEventListener("submit", (event) => event.preventDefault());
resumeForm.addEventListener("submit", (event) => event.preventDefault());
form.addEventListener("input", () => {
  renderDetails();
  debouncedSave();
});
form.addEventListener("change", () => {
  renderDetails();
  debouncedSave();
});
photoToggle.addEventListener("change", () => {
  applyPhotoVisibility();
  saveState();
});
resumeForm.addEventListener("input", () => {
  renderResume();
  debouncedSave();
});
resumeForm.addEventListener("change", () => {
  renderResume();
  debouncedSave();
});

document.querySelectorAll("#templateStrip .template-choice").forEach((button) => {
  button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
  button.addEventListener("click", () => selectTemplate(button));
});

document.querySelectorAll("#resumeFormats .template-choice").forEach((button) => {
  button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
  button.addEventListener("click", () => selectFormat(button));
});

document.querySelectorAll("#accentRow .accent-swatch").forEach((button) => {
  button.addEventListener("click", () => selectAccent(button));
});

biodataTab.addEventListener("click", () => setMode("biodata"));
resumeTab.addEventListener("click", () => setMode("resume"));

requireElement("addExperience").addEventListener("click", () => {
  experienceList.appendChild(createEntry("experience", {}));
  refreshIcons();
  renderResume();
  saveState();
});

requireElement("addEducation").addEventListener("click", () => {
  educationList.appendChild(createEntry("education", {}));
  refreshIcons();
  renderResume();
  saveState();
});

requireElement("addSkillGroup").addEventListener("click", () => {
  skillGroupList.appendChild(createEntry("skill", {}));
  refreshIcons();
  renderResume();
  saveState();
});

requireElement("addCertificate").addEventListener("click", () => {
  certificateList.appendChild(createEntry("certificate", {}));
  refreshIcons();
  renderResume();
  saveState();
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Please choose an image file.");
    photoInput.value = "";
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast("Please choose an image smaller than 10 MB.");
    photoInput.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result;
    if (typeof result !== "string") return;
    portrait.src = result;
    portraitFrame.classList.add("has-image");
    uploadPreview.replaceChildren();
    const thumb = document.createElement("img");
    thumb.src = result;
    thumb.alt = "Uploaded portrait preview";
    uploadPreview.appendChild(thumb);
    saveState();
  };
  reader.readAsDataURL(file);
});

function printActive() {
  if (currentMode === "resume") renderResume();
  else renderDetails();
  window.print();
}

function lockA4Box(element) {
  element.style.setProperty("left", "0", "important");
  element.style.setProperty("right", "auto", "important");
  element.style.setProperty("top", "0", "important");
  element.style.setProperty("position", "relative", "important");
  element.style.setProperty("transform", "none", "important");
  element.style.setProperty("width", "794px", "important");
  element.style.setProperty("height", "1122px", "important");
  element.style.setProperty("max-width", "none", "important");
  element.style.setProperty("min-width", "794px", "important");
  element.style.setProperty("min-height", "1122px", "important");
  element.style.setProperty("aspect-ratio", "auto", "important");
  element.style.setProperty("margin", "0", "important");
  element.style.setProperty("box-shadow", "none", "important");
  element.style.setProperty("overflow", "hidden", "important");
  element.style.setProperty("box-sizing", "border-box", "important");
}

function downloadButtons() {
  return ["downloadBtn", "downloadTop", "downloadBtnResume"]
    .map((id) => document.getElementById(id))
    .filter((button) => button !== null);
}

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

async function deliverPdf(blob, filename) {
  const file = new File([blob], filename, { type: "application/pdf" });
  const canShareFile = typeof navigator.canShare === "function"
    && navigator.canShare({ files: [file] });
  if (isIos() && canShareFile) {
    try {
      await navigator.share({ files: [file], title: filename });
      return true;
    } catch (error) {
      if (error && error.name === "AbortError") return false;
    }
  }
  const url = URL.createObjectURL(blob);
  if (isIos()) {
    window.location.assign(url);
    return true;
  }
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  return true;
}

function renderPdfSheet(source) {
  const host = document.createElement("div");
  host.className = "pdf-render-host";
  const sheet = source.cloneNode(true);
  sheet.removeAttribute("id");
  sheet.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
  sheet.classList.add("pdf-export");
  lockA4Box(sheet);
  host.appendChild(sheet);
  document.body.appendChild(host);
  return host;
}

async function downloadPdf() {
  if (currentMode === "resume") renderResume();
  else renderDetails();
  if (typeof window.html2pdf !== "function") {
    showToast("Direct PDF library did not load. Use Print / Save PDF instead.");
    return;
  }
  const sourceName = currentMode === "resume"
    ? (getValue(resumeForm, "resumeName") || "resume")
    : (getValue(form, "fullName") || "marriage-biodata");
  const slug = slugify(sourceName);
  const filename = currentMode === "resume"
    ? `${slug || "resume"}-resume.pdf`
    : `${slug || "marriage-biodata"}.pdf`;
  const buttons = downloadButtons();
  buttons.forEach((button) => {
    button.disabled = true;
    button.dataset.oldHtml = button.innerHTML;
    button.textContent = "Preparing…";
  });
  const host = renderPdfSheet(activePaper());
  const sheet = host.firstElementChild;
  const previousScroll = window.scrollY;
  const previousOverflow = document.body.style.overflow;
  const previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  document.body.style.overflow = "visible";
  window.scrollTo(0, 0);
  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
    const blob = await window.html2pdf().set({
      margin: 0,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
        windowHeight: 1122,
        width: 794,
        height: 1122,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          const overlay = clonedDoc.querySelector(".html2pdf__overlay");
          const container = clonedDoc.querySelector(".html2pdf__container");
          const rendered = clonedDoc.querySelector(".pdf-export");
          [overlay, container, rendered].forEach((node) => {
            if (!node) return;
            node.style.setProperty("left", "0", "important");
            node.style.setProperty("right", "auto", "important");
            node.style.setProperty("top", "0", "important");
            node.style.setProperty("width", "794px", "important");
            node.style.setProperty("height", "1122px", "important");
            node.style.setProperty("margin", "0", "important");
            node.style.setProperty("overflow", "hidden", "important");
            node.style.setProperty("position", "absolute", "important");
          });
          if (rendered) lockA4Box(rendered);
        }
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    }).from(sheet).outputPdf("blob");
    const saved = await deliverPdf(blob, filename);
    if (saved) {
      showToast(currentMode === "resume" ? "Your resume PDF is ready." : "Your biodata PDF is ready.");
    }
  } catch (error) {
    console.error("PDF export failed:", error);
    showToast("PDF export failed. Try Print / Save PDF.");
  } finally {
    host.remove();
    document.body.style.overflow = previousOverflow;
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
    window.scrollTo(0, previousScroll);
    buttons.forEach((button) => {
      button.disabled = false;
      button.innerHTML = button.dataset.oldHtml || '<i data-lucide="download"></i> Download PDF';
    });
    refreshIcons();
  }
}

function resetBiodata() {
  form.reset();
  photoInput.value = "";
  portrait.removeAttribute("src");
  portraitFrame.classList.remove("has-image");
  uploadPreview.replaceChildren();
  const initials = document.createElement("span");
  initials.textContent = "RP";
  uploadPreview.appendChild(initials);
  applyPhotoVisibility();
  const floral = document.querySelector('#templateStrip .template-choice[data-template="floral"]');
  if (floral) selectTemplate(floral);
  else {
    paper.dataset.template = "floral";
    renderDetails();
  }
  showToast("Form reset.");
  saveState();
}

function resetResume() {
  resumeForm.reset();
  fillEntries(experienceList, "experience", starterExperience);
  fillEntries(educationList, "education", starterEducation);
  fillEntries(skillGroupList, "skill", []);
  fillEntries(certificateList, "certificate", []);
  const blue = document.querySelector('#accentRow .accent-swatch[data-accent="blue"]');
  if (blue) selectAccent(blue);
  else resumePaper.dataset.accent = "blue";
  const itFormat = document.querySelector('#resumeFormats .template-choice[data-format="it"]');
  if (itFormat) selectFormat(itFormat);
  else {
    resumePaper.dataset.format = "it";
    renderResume();
  }
  showToast("Resume reset.");
  saveState();
}

function bindClick(id, handler) {
  const element = document.getElementById(id);
  if (element) element.addEventListener("click", handler);
}

bindClick("printBtn", printActive);
bindClick("printBtnResume", printActive);
bindClick("downloadBtn", downloadPdf);
bindClick("downloadTop", downloadPdf);
bindClick("downloadBtnResume", downloadPdf);

bindClick("resetBtn", () => {
  if (currentMode === "resume") {
    if (!window.confirm("Reset the resume to the starter example?")) return;
    resetResume();
    return;
  }
  if (!window.confirm("Reset all biodata fields to the starter example?")) return;
  resetBiodata();
});

function holdViewport(anchor) {
  const startTop = anchor.getBoundingClientRect().top;
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  let running = true;
  const tick = () => {
    if (!running) return;
    const drift = anchor.getBoundingClientRect().top - startTop;
    if (Math.abs(drift) > 0.5) window.scrollTo(0, window.scrollY + drift);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  window.setTimeout(() => {
    running = false;
    root.style.scrollBehavior = previous;
  }, 420);
}

function setupSectionAccordion(formEl) {
  const sections = [...formEl.querySelectorAll(":scope > .form-section")];
  sections.forEach((section) => {
    const heading = section.querySelector(":scope > h3");
    if (!heading || section.querySelector(":scope > .section-body")) return;
    const body = document.createElement("div");
    const inner = document.createElement("div");
    body.className = "section-body";
    inner.className = "section-body-inner";
    while (heading.nextSibling) inner.appendChild(heading.nextSibling);
    body.appendChild(inner);
    section.appendChild(body);
  });
  const setOpen = (target) => {
    sections.forEach((section) => {
      const open = section === target;
      section.classList.toggle("is-open", open);
      const heading = section.querySelector(":scope > h3");
      const body = section.querySelector(":scope > .section-body");
      if (heading) heading.setAttribute("aria-expanded", open ? "true" : "false");
      if (body) {
        body.inert = !open;
        body.setAttribute("aria-hidden", open ? "false" : "true");
      }
    });
  };
  sections.forEach((section, index) => {
    const heading = section.querySelector(":scope > h3");
    if (!heading) return;
    heading.setAttribute("role", "button");
    heading.tabIndex = 0;
    heading.setAttribute("aria-expanded", index === 0 ? "true" : "false");
    const toggle = () => {
      holdViewport(heading);
      setOpen(section.classList.contains("is-open") ? null : section);
    };
    heading.addEventListener("click", toggle);
    heading.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggle();
    });
  });
  setOpen(sections[0] || null);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      sections.forEach((section) => section.classList.add("accordion-ready"));
    });
  });
}

function initApp() {
  setupSectionAccordion(form);
  setupSectionAccordion(resumeForm);
  const saved = loadState();
  if (saved) {
    isRestoring = true;
    try {
      if (saved.biodata) {
        if (saved.biodata.fields) {
          deserializeForm(form, saved.biodata.fields);
        }
        if (typeof saved.biodata.showPhoto === "boolean") {
          photoToggle.checked = saved.biodata.showPhoto;
        }
        applyPhotoVisibility();

        if (saved.biodata.portraitData) {
          portrait.src = saved.biodata.portraitData;
          portraitFrame.classList.add("has-image");
          uploadPreview.replaceChildren();
          const thumb = document.createElement("img");
          thumb.src = saved.biodata.portraitData;
          thumb.alt = "Uploaded portrait preview";
          uploadPreview.appendChild(thumb);
        }

        const template = saved.biodata.template || "floral";
        document.querySelectorAll("#templateStrip .template-choice").forEach((button) => {
          const active = button.dataset.template === template;
          button.classList.toggle("active", active);
          button.setAttribute("aria-pressed", active ? "true" : "false");
        });
        paper.dataset.template = template;
      } else {
        applyPhotoVisibility();
      }

      if (saved.resume) {
        if (saved.resume.fields) {
          deserializeForm(resumeForm, saved.resume.fields);
        }

        const format = saved.resume.format || "it";
        document.querySelectorAll("#resumeFormats .template-choice").forEach((button) => {
          const active = button.dataset.format === format;
          button.classList.toggle("active", active);
          button.setAttribute("aria-pressed", active ? "true" : "false");
        });
        resumePaper.dataset.format = format;

        const accent = saved.resume.accent || "blue";
        document.querySelectorAll("#accentRow .accent-swatch").forEach((button) => {
          const active = button.dataset.accent === accent;
          button.classList.toggle("active", active);
          button.setAttribute("aria-pressed", active ? "true" : "false");
        });
        resumePaper.dataset.accent = accent;

        fillEntries(experienceList, "experience", Array.isArray(saved.resume.experience) ? saved.resume.experience : starterExperience);
        fillEntries(educationList, "education", Array.isArray(saved.resume.education) ? saved.resume.education : starterEducation);
        fillEntries(skillGroupList, "skill", Array.isArray(saved.resume.skillGroups) ? saved.resume.skillGroups : []);
        fillEntries(certificateList, "certificate", Array.isArray(saved.resume.certificates) ? saved.resume.certificates : []);
      } else {
        fillEntries(experienceList, "experience", starterExperience);
        fillEntries(educationList, "education", starterEducation);
        fillEntries(skillGroupList, "skill", []);
        fillEntries(certificateList, "certificate", []);
      }

      renderDetails();
      renderResume();
      setMode(saved.mode === "resume" ? "resume" : "biodata");
    } catch (e) {
      console.error("Error restoring state:", e);
      applyPhotoVisibility();
      fillEntries(experienceList, "experience", starterExperience);
      fillEntries(educationList, "education", starterEducation);
      fillEntries(skillGroupList, "skill", []);
      fillEntries(certificateList, "certificate", []);
      renderDetails();
      renderResume();
      setMode("biodata");
    } finally {
      document.documentElement.classList.remove("mode-resume-init");
      isRestoring = false;
    }
  } else {
    applyPhotoVisibility();
    fillEntries(experienceList, "experience", starterExperience);
    fillEntries(educationList, "education", starterEducation);
    fillEntries(skillGroupList, "skill", []);
    fillEntries(certificateList, "certificate", []);
    renderDetails();
    renderResume();
    setMode("biodata");
  }

  refreshIcons();
}

initApp();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
window.addEventListener("load", refreshIcons);
window.addEventListener("beforeunload", () => {
  clearTimeout(saveTimer);
  saveState();
});
