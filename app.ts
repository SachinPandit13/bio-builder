interface TemplateCopy {
  title: string;
  symbol: string;
  blessing: string;
}

interface PaperHeading {
  paperTitle: HTMLElement;
  symbolMark: HTMLElement;
  paperBlessing: HTMLElement;
}

interface PdfExportOptions {
  margin: number;
  filename: string;
  image: { type: string; quality: number };
  html2canvas: {
    scale: number;
    useCORS: boolean;
    backgroundColor: string | null;
    logging: boolean;
    scrollX: number;
    scrollY: number;
  };
  jsPDF: { unit: string; format: string; orientation: string };
  pagebreak: { mode: string[] };
}

interface Html2PdfWorker {
  set(options: PdfExportOptions): Html2PdfWorker;
  from(source: HTMLElement): Html2PdfWorker;
  save(): Promise<void>;
}

type DetailField = readonly [string, string];

interface Window {
  html2pdf?: () => Html2PdfWorker;
}

function requireElement<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (element === null) {
    throw new Error(`Missing element #${id}`);
  }
  return element as T;
}

function requireQuery<T extends Element = Element>(selector: string): T {
  const element = document.querySelector(selector);
  if (element === null) {
    throw new Error(`Missing element ${selector}`);
  }
  return element as T;
}

const form = requireElement<HTMLFormElement>("biodataForm");
const paper = requireElement("biodataPaper");
const portrait = requireElement<HTMLImageElement>("portrait");
const portraitFrame = requireQuery<HTMLElement>(".portrait-frame");
const photoInput = requireElement<HTMLInputElement>("photoInput");
const uploadPreview = requireElement("uploadPreview");
const toast = requireElement("toast");

const personalFields = [
  ["Full Name", "fullName"], ["Date of Birth", "dob"], ["Birth Time", "birthTime"],
  ["Birth Place", "birthPlace"], ["Height", "height"], ["Religion", "religion"],
  ["Community", "community"], ["Gotra", "gotra"], ["Rashi", "rashi"],
  ["Manglik Status", "manglik"], ["Complexion", "complexion"], ["Blood Group", "bloodGroup"],
  ["Education", "education"], ["Occupation", "occupation"]
] as const satisfies readonly DetailField[];
const familyFields = [
  ["Father's Name", "fatherName"], ["Father's Occupation", "fatherOccupation"],
  ["Mother's Name", "motherName"], ["Mother's Occupation", "motherOccupation"],
  ["Brothers", "brothers"], ["Sisters", "sisters"], ["Maternal Uncle", "maternalUncle"],
  ["Relatives", "relatives"]
] as const satisfies readonly DetailField[];
const contactFields = [["Mobile Number", "mobile"], ["Address", "address"]] as const satisfies readonly DetailField[];

const templateMeta: Record<string, TemplateCopy> = {
  floral: { title: "Marriage Biodata", symbol: "ॐ", blessing: "॥ श्री गणेशाय नमः ॥" },
  classic: { title: "विवाह परिचय", symbol: "श्री", blessing: "॥ शुभ मंगलम् ॥" },
  royal: { title: "Marriage Biodata", symbol: "ॐ", blessing: "॥ श्री गणेशाय नमः ॥" },
  minimal: { title: "Marriage Biodata", symbol: "✦", blessing: "A PERSONAL INTRODUCTION" },
  botanical: { title: "Marriage Biodata", symbol: "❧", blessing: "A beautiful beginning" },
  blush: { title: "Marriage Biodata", symbol: "♡", blessing: "॥ शुभ विवाह ॥" },
  maroon: { title: "विवाह बायोडाटा", symbol: "ॐ", blessing: "॥ श्री गणेशाय नमः ॥" }
};

function getValue(name: string): string {
  const field = form.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
    return field.value.trim();
  }
  return "";
}

function makeDetailRows(fields: readonly DetailField[]): DocumentFragment {
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

function renderDetails(): void {
  requireElement("personalDetails").replaceChildren(makeDetailRows(personalFields));
  requireElement("familyDetails").replaceChildren(makeDetailRows(familyFields));
  requireElement("contactDetails").replaceChildren(makeDetailRows(contactFields));
  const name = getValue("fullName") || "Marriage Biodata";
  requireElement("footerName").textContent = name;
  const meta: TemplateCopy = templateMeta[paper.dataset.template ?? "floral"] ?? templateMeta.floral;
  const heading: PaperHeading = {
    paperTitle: requireElement("paperTitle"),
    symbolMark: requireElement("symbolMark"),
    paperBlessing: requireElement("paperBlessing")
  };
  heading.paperTitle.textContent = meta.title;
  heading.symbolMark.textContent = meta.symbol;
  heading.paperBlessing.textContent = meta.blessing;
  document.title = `${name} — Marriage Biodata`;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

form.addEventListener("input", renderDetails);

requireElement("templateStrip").addEventListener("click", (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const choice = target.closest<HTMLElement>("[data-template]");
  if (!choice) return;
  document.querySelectorAll<HTMLElement>(".template-choice").forEach((button) => {
    const active = button === choice;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  paper.dataset.template = choice.dataset.template ?? "floral";
  renderDetails();
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

function printBiodata(): void {
  renderDetails();
  window.print();
}

async function downloadPdf(): Promise<void> {
  renderDetails();
  if (typeof window.html2pdf !== "function") {
    showToast("Direct PDF library did not load. Use Print / Save PDF instead.");
    return;
  }
  const name = (getValue("fullName") || "marriage-biodata")
    .normalize("NFKD").replace(/[^\w -]/g, "").trim().replace(/\s+/g, "-").toLowerCase();
  const options: PdfExportOptions = {
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
    requireElement<HTMLButtonElement>("downloadBtn"),
    requireElement<HTMLButtonElement>("downloadTop")
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
  paper.dataset.template = "floral";
  document.querySelectorAll<HTMLElement>(".template-choice").forEach((button) => {
    button.classList.toggle("active", button.dataset.template === "floral");
  });
  renderDetails();
  showToast("Form reset.");
});

renderDetails();
