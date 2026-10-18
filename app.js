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
  const control = entry.querySelector(`[data-field="${field}"]`);
  return control ? control.value.trim() : "";
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

function createEntry(kind, data) {
  const article = document.createElement("article");
  article.className = "repeat-entry";
  const head = document.createElement("div");
  head.className = "entry-head";
  const title = document.createElement("strong");
  title.textContent = kind === "experience" ? "Role" : "Education";
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "btn btn-quiet entry-remove";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => {
    article.remove();
    renderResume();
  });
  head.append(title, remove);
  const grid = document.createElement("div");
  grid.className = "field-grid";
  if (kind === "experience") {
    grid.append(
      labeledControl("Job title", textControl("role", data.role, "e.g. Product Manager")),
      labeledControl("Company", textControl("company", data.company, "Company")),
      labeledControl("Dates", textControl("dates", data.dates, "2021 — Present")),
      labeledControl("Location", textControl("location", data.location, "City")),
      labeledControl("Highlights", areaControl("bullets", data.bullets, "One achievement per line"), true)
    );
  } else {
    grid.append(
      labeledControl("School", textControl("school", data.school, "School or university"), true),
      labeledControl("Credential", textControl("credential", data.credential, "Degree or certificate")),
      labeledControl("Year", textControl("year", data.year, "2018"))
    );
  }
  article.append(head, grid);
  return article;
}

function fillEntries(list, kind, rows) {
  list.replaceChildren(...rows.map((row) => createEntry(kind, row)));
}

function readEntries(list, fields) {
  return [...list.querySelectorAll(".repeat-entry")].map((entry) => {
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

function renderResume() {
  const name = getValue(resumeForm, "resumeName") || "Resume";
  const title = getValue(resumeForm, "jobTitle");
  const contact = ["email", "phone", "city", "website"].map((key) => getValue(resumeForm, key)).filter(Boolean);
  const summary = getValue(resumeForm, "summary");
  const experience = readEntries(experienceList, ["role", "company", "dates", "location", "bullets"]);
  const education = readEntries(educationList, ["school", "credential", "year"]);
  const skills = getValue(resumeForm, "skills").split(",").map((skill) => skill.trim()).filter(Boolean);

  requireElement("resumeName").textContent = name;
  const roleEl = requireElement("resumeRole");
  roleEl.textContent = title;
  roleEl.hidden = !title;
  const contactEl = requireElement("resumeContact");
  contactEl.textContent = contact.join("  ·  ");
  contactEl.hidden = contact.length === 0;

  const summaryEl = requireElement("resumeSummary");
  summaryEl.textContent = summary;
  requireElement("resumeSummarySection").hidden = !summary;

  const experienceRoot = requireElement("resumeExperience");
  experienceRoot.replaceChildren();
  experience.forEach((item) => {
    const block = document.createElement("article");
    block.className = "role-item";
    const heading = document.createElement("strong");
    heading.className = "role-title";
    heading.textContent = item.role || item.company;
    if (item.role || item.company) block.appendChild(heading);
    const meta = [item.role && item.company ? item.company : "", item.dates, item.location].filter(Boolean).join("  ·  ");
    appendParagraph(block, "resume-meta", meta);
    const lines = item.bullets.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length) {
      const list = document.createElement("ul");
      list.className = "resume-bullets";
      lines.forEach((line) => {
        const li = document.createElement("li");
        li.textContent = line;
        list.appendChild(li);
      });
      block.appendChild(list);
    }
    experienceRoot.appendChild(block);
  });
  requireElement("resumeExperienceSection").hidden = experience.length === 0;

  const educationRoot = requireElement("resumeEducation");
  educationRoot.replaceChildren();
  education.forEach((item) => {
    const block = document.createElement("article");
    block.className = "edu-item";
    const heading = document.createElement("strong");
    heading.className = "edu-credential";
    heading.textContent = item.credential || item.school;
    if (item.credential || item.school) block.appendChild(heading);
    const meta = [item.credential ? item.school : "", item.year].filter(Boolean).join("  ·  ");
    appendParagraph(block, "resume-meta", meta);
    educationRoot.appendChild(block);
  });
  requireElement("resumeEducationSection").hidden = education.length === 0;

  const skillsRoot = requireElement("resumeSkills");
  skillsRoot.replaceChildren();
  skills.forEach((skill) => {
    const li = document.createElement("li");
    li.textContent = skill;
    skillsRoot.appendChild(li);
  });
  requireElement("resumeSkillsSection").hidden = skills.length === 0;

  const summaryHidden = requireElement("resumeSummarySection").hidden;
  const experienceHidden = requireElement("resumeExperienceSection").hidden;
  const educationHidden = requireElement("resumeEducationSection").hidden;
  const skillsHidden = requireElement("resumeSkillsSection").hidden;
  requireElement("resumePrimary").hidden = summaryHidden && experienceHidden;
  requireElement("resumeSecondary").hidden = educationHidden && skillsHidden;

  if (currentMode === "resume") {
    document.title = `${name} — Resume`;
  }
}

function selectFormat(choice) {
  const format = choice.dataset.format || "classic";
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

biodataTab.addEventListener("click", () => setMode("biodata"));
resumeTab.addEventListener("click", () => setMode("resume"));

requireElement("addExperience").addEventListener("click", () => {
  experienceList.appendChild(createEntry("experience", {}));
  renderResume();
});

requireElement("addEducation").addEventListener("click", () => {
  educationList.appendChild(createEntry("education", {}));
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
    button.dataset.oldText = button.textContent ?? "";
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
      button.textContent = button.dataset.oldText || "Download PDF";
    });
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
  const classic = document.querySelector('#resumeFormats .template-choice[data-format="classic"]');
  if (classic) selectFormat(classic);
  else {
    resumePaper.dataset.format = "classic";
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
