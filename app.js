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

function selectTemplate(choice) {
  const template = choice.dataset.template || "floral";
  document.querySelectorAll("#templateStrip .template-choice").forEach((button) => {
    const active = button === choice;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  paper.dataset.template = template;
  renderDetails();
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
}

function slugify(value) {
  return value.normalize("NFKD").replace(/[^\w -]/g, "").trim().replace(/\s+/g, "-").toLowerCase();
}

function activePaper() {
  return currentMode === "resume" ? resumePaper : paper;
}

form.addEventListener("submit", (event) => event.preventDefault());
resumeForm.addEventListener("submit", (event) => event.preventDefault());
form.addEventListener("input", renderDetails);
photoToggle.addEventListener("change", applyPhotoVisibility);
resumeForm.addEventListener("input", renderResume);

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
});

requireElement("addEducation").addEventListener("click", () => {
  educationList.appendChild(createEntry("education", {}));
  refreshIcons();
  renderResume();
});

requireElement("addSkillGroup").addEventListener("click", () => {
  skillGroupList.appendChild(createEntry("skill", {}));
  refreshIcons();
  renderResume();
});

requireElement("addCertificate").addEventListener("click", () => {
  certificateList.appendChild(createEntry("certificate", {}));
  refreshIcons();
  renderResume();
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
  const buttons = [
    requireElement("downloadBtn"),
    requireElement("downloadTop"),
    requireElement("downloadBtnResume")
  ];
  buttons.forEach((button) => {
    button.disabled = true;
    button.dataset.oldHtml = button.innerHTML;
    button.textContent = "Preparing…";
  });
  const host = renderPdfSheet(activePaper());
  const sheet = host.firstElementChild;
  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
    await window.html2pdf().set({
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
    }).from(sheet).save();
    showToast(currentMode === "resume" ? "Your resume PDF is ready." : "Your biodata PDF is ready.");
  } catch (error) {
    console.error("PDF export failed:", error);
    showToast("PDF export failed. Try Print / Save PDF.");
  } finally {
    host.remove();
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
}

requireElement("printBtn").addEventListener("click", printActive);
requireElement("printBtnResume").addEventListener("click", printActive);
requireElement("downloadBtn").addEventListener("click", downloadPdf);
requireElement("downloadTop").addEventListener("click", downloadPdf);
requireElement("downloadBtnResume").addEventListener("click", downloadPdf);

requireElement("resetBtn").addEventListener("click", () => {
  if (currentMode === "resume") {
    if (!window.confirm("Reset the resume to the starter example?")) return;
    resetResume();
    return;
  }
  if (!window.confirm("Reset all biodata fields to the starter example?")) return;
  resetBiodata();
});

applyPhotoVisibility();
fillEntries(experienceList, "experience", starterExperience);
fillEntries(educationList, "education", starterEducation);
renderDetails();
renderResume();
setMode("biodata");
refreshIcons();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
window.addEventListener("load", refreshIcons);
