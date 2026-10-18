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

function getValue(name) {
  const field = form.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
    return field.value.trim();
  }
  return "";
}

function makeDetailRows(fields) {
  const fragment = document.createDocumentFragment();
  fields.forEach(([label, key]) => {
    const value = getValue(key);
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
  const name = getValue("fullName") || "Marriage Biodata";
  requireElement("footerName").textContent = name;
  const meta = templateMeta[paper.dataset.template || "floral"] || templateMeta.floral;
  requireElement("paperTitle").textContent = meta.title;
  requireElement("symbolMark").textContent = meta.symbol;
  requireElement("paperBlessing").textContent = meta.blessing;
  document.title = `${name} — Marriage Biodata`;
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
  document.querySelectorAll(".template-choice").forEach((button) => {
    const active = button === choice;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  paper.dataset.template = template;
  renderDetails();
}

form.addEventListener("input", renderDetails);
photoToggle.addEventListener("change", applyPhotoVisibility);

document.querySelectorAll(".template-choice").forEach((button) => {
  button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
  button.addEventListener("click", () => selectTemplate(button));
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

function printBiodata() {
  renderDetails();
  window.print();
}

async function downloadPdf() {
  renderDetails();
  if (typeof window.html2pdf !== "function") {
    showToast("Direct PDF library did not load. Use Print / Save PDF instead.");
    return;
  }
  const name = (getValue("fullName") || "marriage-biodata")
    .normalize("NFKD").replace(/[^\w -]/g, "").trim().replace(/\s+/g, "-").toLowerCase();
  const options = {
    margin: 0,
    filename: `${name || "marriage-biodata"}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      logging: false,
      scrollX: 0,
      scrollY: 0
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] }
  };
  const buttons = [
    requireElement("downloadBtn"),
    requireElement("downloadTop")
  ];
  buttons.forEach((button) => {
    button.disabled = true;
    button.dataset.oldText = button.textContent ?? "";
    button.textContent = "Preparing…";
  });
  try {
    await window.html2pdf().set(options).from(paper).save();
    showToast("Your biodata PDF is ready.");
  } catch (error) {
    console.error("PDF export failed:", error);
    showToast("PDF export failed. Try Print / Save PDF.");
  } finally {
    buttons.forEach((button) => {
      button.disabled = false;
      button.textContent = button.dataset.oldText || "Download PDF";
    });
  }
}

requireElement("printBtn").addEventListener("click", printBiodata);
requireElement("downloadBtn").addEventListener("click", downloadPdf);
requireElement("downloadTop").addEventListener("click", downloadPdf);

requireElement("resetBtn").addEventListener("click", () => {
  if (!window.confirm("Reset all biodata fields to the starter example?")) return;
  form.reset();
  photoInput.value = "";
  portrait.removeAttribute("src");
  portraitFrame.classList.remove("has-image");
  uploadPreview.replaceChildren();
  const initials = document.createElement("span");
  initials.textContent = "RP";
  uploadPreview.appendChild(initials);
  applyPhotoVisibility();
  const floral = document.querySelector('.template-choice[data-template="floral"]');
  if (floral) selectTemplate(floral);
  else {
    paper.dataset.template = "floral";
    renderDetails();
  }
  showToast("Form reset.");
});

applyPhotoVisibility();
renderDetails();
