import { useEffect } from "react";

type Language = "en" | "hi";

/*
|--------------------------------------------------------------------------
| SAFE HINDI TRANSLATION DICTIONARY
|--------------------------------------------------------------------------
| Important:
| We use exact phrases / complete words.
| We DO NOT replace random substrings.
|--------------------------------------------------------------------------
*/

const translations: Record<string, string> = {
  /* =========================
     COMMON UI
  ========================= */

  Dashboard: "डैशबोर्ड",
  "National Dashboard": "राष्ट्रीय डैशबोर्ड",
  "Live Parcel Map": "लाइव भूमि पार्सल मानचित्र",
  "Auto-sync active": "स्वचालित सिंक सक्रिय",

  Actions: "कार्रवाई",
  Action: "कार्रवाई",
  Status: "स्थिति",
  Location: "स्थान",
  Project: "परियोजना",
  Projects: "परियोजनाएँ",
  "Project Name": "परियोजना का नाम",
  "Reference ID": "संदर्भ आईडी",
  "Tracking ID": "ट्रैकिंग आईडी",

  Search: "खोजें",
  Filter: "फ़िल्टर",
  Filters: "फ़िल्टर",
  Apply: "लागू करें",
  Reset: "रीसेट",
  Close: "बंद करें",
  Cancel: "रद्द करें",
  Save: "सहेजें",
  Submit: "जमा करें",
  Edit: "संपादित करें",
  Delete: "हटाएँ",
  View: "देखें",
  Download: "डाउनलोड",
  Upload: "अपलोड",

  Approve: "स्वीकृत करें",
  Reject: "अस्वीकार करें",
  Publish: "प्रकाशित करें",
  Scrutinize: "जाँच करें",
  "Start Inquiry": "जाँच शुरू करें",
  "Mark Resolved": "समाधान किया गया चिह्नित करें",

  /* =========================
     SIDEBAR
  ========================= */

  Proposals: "प्रस्ताव",
  Compensation: "मुआवज़ा",
  Documents: "दस्तावेज़",
  Awards: "पुरस्कार",
  Reports: "रिपोर्ट",
  Grievance: "शिकायत",
  "GIS Map": "जीआईएस मानचित्र",
  "R&R": "R&R",

  /* =========================
     PROPOSALS
  ========================= */

  "Land Acquisition Proposals": "भूमि अधिग्रहण प्रस्ताव",
  "New Proposal": "नया प्रस्ताव",
  "Project Proposals": "परियोजना प्रस्ताव",
  "Submitted": "जमा किया गया",
  "Under Scrutiny": "जाँच के अधीन",
  "In Survey": "सर्वेक्षण में",
  "New Proposal Draft": "नए प्रस्ताव का मसौदा",

  "Sec 11 Notification": "धारा 11 अधिसूचना",
  "Section 11 Notification": "धारा 11 अधिसूचना",
  "Section 11": "धारा 11",
  "Sec 19 Declaration": "धारा 19 घोषणा",
  "Section 19 Declaration": "धारा 19 घोषणा",
  "Sec 23 Award": "धारा 23 पुरस्कार",
  "Section 23 Award": "धारा 23 पुरस्कार",
  Possession: "कब्ज़ा",
  "Section 38 Possession": "धारा 38 भूमि कब्ज़ा",
  "Section 38 Land Possession": "धारा 38 भूमि कब्ज़ा",

  /* =========================
     COMPENSATION
  ========================= */

  "Compensation Management": "मुआवज़ा प्रबंधन",
  "Compensation Assessment": "मुआवज़ा आकलन",
  "Compensation Assessment": "मुआवज़ा आकलन",
  Beneficiaries: "लाभार्थी",
  Settled: "निपटाया गया",
  "Disburse DBT": "DBT वितरित करें",
  Disbursement: "वितरण",

  "Direct Benefit Transfer (DBT)": "प्रत्यक्ष लाभ अंतरण (DBT)",
  "PFMS Direct Benefit Transfer": "PFMS प्रत्यक्ष लाभ अंतरण",
  "Processing DBT": "DBT प्रक्रिया में",

  /* =========================
     AWARDS
  ========================= */

  "Award Management": "पुरस्कार प्रबंधन",
  "Draft, review and publish land acquisition awards":
    "भूमि अधिग्रहण पुरस्कारों का मसौदा तैयार करें, समीक्षा करें और प्रकाशित करें",

  "New Award Draft": "नए पुरस्कार का मसौदा",
  "Award Register": "पुरस्कार रजिस्टर",
  "All award drafts and published awards":
    "सभी पुरस्कार मसौदे और प्रकाशित पुरस्कार",

  "Award ID": "पुरस्कार आईडी",
  "Date": "दिनांक",
  Amount: "राशि",
  Authority: "प्राधिकरण",

  Award: "पुरस्कार",
  "Under Review": "समीक्षा के अधीन",
  Draft: "मसौदा",
  Published: "प्रकाशित",
  Review: "समीक्षा",

  /* =========================
     R&R
  ========================= */

  "R&R Settlement": "R&R निपटान",
  "R&R Entitlements Settlement": "R&R अधिकार निपटान",

  "Family Head": "परिवार प्रमुख",
  Category: "श्रेणी",
  Displacement: "विस्थापन",
  Housing: "आवास",
  Annuity: "वार्षिकी",
  Employment: "रोज़गार",
  Settlement: "निपटान",

  "Settle Claim": "दावा निपटाएँ",

  /* =========================
     DOCUMENTS
  ========================= */

  "Upload Document": "दस्तावेज़ अपलोड करें",
  "Document Type": "दस्तावेज़ प्रकार",
  "Uploaded By": "अपलोड करने वाला",
  Survey: "सर्वेक्षण",
  Legal: "कानूनी",
  Report: "रिपोर्ट",
  Gazette: "राजपत्र",
  "Field Surveyor": "क्षेत्र सर्वेक्षक",
  "SHA-256": "SHA-256",

  /* =========================
     REPORTS
  ========================= */

  "MIS & Statutory Reports": "MIS एवं वैधानिक रिपोर्ट",
  "MIS & Statutory रिपोर्ट": "MIS एवं वैधानिक रिपोर्ट",

  "Generate New Report": "नई रिपोर्ट बनाएँ",
  "Recent MIS Records": "हाल की MIS रिपोर्ट",
  "REPORT ID": "रिपोर्ट आईडी",
  "AUTOMATED MIS CHECKS": "स्वचालित MIS जाँच",
  "SCHEDULED STATE REVIEW": "निर्धारित राज्य समीक्षा",

  "Total Reports": "कुल रिपोर्ट",
  Generated: "जनरेट की गई",
  Progress: "प्रगति",

  /* =========================
     GRIEVANCE
  ========================= */

  "Grievance Management": "शिकायत प्रबंधन",
  "AVG. RESOLUTION": "औसत समाधान",
  "Tracking ID": "ट्रैकिंग आईडी",
  Complainant: "शिकायतकर्ता",
  "Submission Date": "जमा करने की तारीख",
  Priority: "प्राथमिकता",
  "Measurement Dispute": "माप संबंधी विवाद",
  "R&R Eligibility": "R&R पात्रता",
  "Compensation Assessment": "मुआवज़ा आकलन",
  Redressed: "समाधान किया गया",

  /* =========================
     ALERTS
  ========================= */

  "System Notifications & Alerts":
    "सिस्टम सूचनाएँ एवं अलर्ट",

  "System सूचनाएँ & अधिसूचनाएँ":
    "सिस्टम सूचनाएँ एवं अधिसूचनाएँ",

  "View Alerts": "अलर्ट देखें",
  "Lapse Risk": "समाप्ति जोखिम",

  /* =========================
     DASHBOARD
  ========================= */

  "Workflow Tracker": "कार्यप्रवाह ट्रैकर",
  "Predictive Risk": "पूर्वानुमानित जोखिम",

  "Section 11 Notification": "धारा 11 अधिसूचना",
  "Section 19 Declaration": "धारा 19 घोषणा",
  "Section 23 Award": "धारा 23 पुरस्कार",
  "Section 38 Possession": "धारा 38 भूमि कब्ज़ा",

  "R&R Entitlements Settlement":
    "R&R अधिकार निपटान",

  "R&R Settlement":
    "R&R निपटान",

  /* =========================
     USER / SESSION
  ========================= */

  "Active Session": "सक्रिय सत्र",
  "Guest User": "अतिथि उपयोगकर्ता",
  "Sign Out": "साइन आउट",
  "Switch Role or Sign In":
    "भूमिका बदलें या साइन इन करें",

  /* =========================
     MODULE
  ========================= */

  Module: "मॉड्यूल",

  "This module is available in subsequent build phases.":
    "यह मॉड्यूल आगामी निर्माण चरणों में उपलब्ध होगा।",

  /* =========================
     COMMON PHRASES
  ========================= */

  "Track and manage land acquisition proposals across all ministries.":
    "सभी मंत्रालयों में भूमि अधिग्रहण प्रस्तावों को ट्रैक और प्रबंधित करें।",

  "Manage land acquisition proposals across all ministries.":
    "सभी मंत्रालयों में भूमि अधिग्रहण प्रस्तावों का प्रबंधन करें।",

  "Live GIS Data":
    "लाइव जीआईएस डेटा",

  "Parcel Visualization":
    "भूमि पार्सल दृश्यांकन",

  "Proposed Alignment":
    "प्रस्तावित संरेखण",

  "Parcel Details":
    "पार्सल विवरण",

  /* =========================
     STATUS
  ========================= */

  Pending: "लंबित",
  Approved: "स्वीकृत",
  Disputed: "विवादित",
  Disbursed: "वितरित",
  "In Progress": "प्रगति में",
  Processing: "प्रक्रिया में",
  Completed: "पूर्ण",
};

/*
|--------------------------------------------------------------------------
| DO NOT TRANSLATE THESE
|--------------------------------------------------------------------------
| Project IDs, ULPIN, SHA hashes, MoRTH etc. should remain intact.
|--------------------------------------------------------------------------
*/

const ignoredTags = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "TEXTAREA",
]);

const originalText = new WeakMap<Text, string>();

/*
|--------------------------------------------------------------------------
| SORT LONGEST FIRST
|--------------------------------------------------------------------------
| Example:
| "Section 11 Notification" should be checked before "Section 11".
|--------------------------------------------------------------------------
*/

const sortedTranslations = Object.entries(translations).sort(
  ([a], [b]) => b.length - a.length
);

/*
|--------------------------------------------------------------------------
| SAFE TEXT TRANSLATION
|--------------------------------------------------------------------------
*/

function translateText(text: string): string {
  const trimmed = text.trim();

  if (!trimmed) {
    return text;
  }

  /*
   * Exact match first.
   * This prevents project names / sentences from becoming broken.
   */

  const exact = translations[trimmed];

  if (exact) {
    return text.replace(trimmed, exact);
  }

  let result = text;

  /*
   * Only replace complete words/phrases.
   *
   * This prevents:
   * Highway -> उच्चway
   *
   * because "highway" is treated as a complete word.
   */

  for (const [english, hindi] of sortedTranslations) {
    if (
      english.length < 3 ||
      english.includes(" ")
    ) {
      continue;
    }

    const escaped = english.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const regex = new RegExp(
      `(^|[^A-Za-z0-9])${escaped}(?=$|[^A-Za-z0-9])`,
      "gi"
    );

    result = result.replace(
      regex,
      `$1${hindi}`
    );
  }

  return result;
}

/*
|--------------------------------------------------------------------------
| TRANSLATE DOM
|--------------------------------------------------------------------------
*/

function translatePageToHindi() {
  const root = document.body;

  if (!root) {
    return;
  }

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT
  );

  const textNodes: Text[] = [];

  let current: Node | null;

  while ((current = walker.nextNode())) {
    const textNode = current as Text;

    const parent = textNode.parentElement;

    if (!parent) {
      continue;
    }

    if (ignoredTags.has(parent.tagName)) {
      continue;
    }

    if (
      parent.closest(
        "[data-no-translate='true']"
      )
    ) {
      continue;
    }

    textNodes.push(textNode);
  }

  textNodes.forEach((node) => {
    if (!originalText.has(node)) {
      originalText.set(node, node.nodeValue || "");
    }

    const original =
      originalText.get(node) || "";

    const translated =
      translateText(original);

    if (node.nodeValue !== translated) {
      node.nodeValue = translated;
    }
  });
}

/*
|--------------------------------------------------------------------------
| RESTORE ENGLISH
|--------------------------------------------------------------------------
*/

function restoreEnglish() {
  const root = document.body;

  if (!root) {
    return;
  }

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT
  );

  let current: Node | null;

  while ((current = walker.nextNode())) {
    const textNode = current as Text;

    const original =
      originalText.get(textNode);

    if (original !== undefined) {
      if (textNode.nodeValue !== original) {
        textNode.nodeValue = original;
      }
    }
  }
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

interface GlobalHindiTranslatorProps {
  language: Language;
}

export default function GlobalHindiTranslator({
  language,
}: GlobalHindiTranslatorProps) {
  useEffect(() => {
    let observer: MutationObserver | null = null;

    const runTranslation = () => {
      if (language === "hi") {
        translatePageToHindi();
      } else {
        restoreEnglish();
      }
    };

    /*
     * Initial translation
     */

    runTranslation();

    /*
     * React changes the DOM dynamically.
     * MutationObserver handles new content.
     */

    observer = new MutationObserver(() => {
      if (language === "hi") {
        translatePageToHindi();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer?.disconnect();
    };
  }, [language]);

  return null;
}