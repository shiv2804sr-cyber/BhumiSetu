import { useEffect } from "react";

type Language = "en" | "hi";

interface Props {
  language: Language;
}

/**
 * BhoomiSetu Global Hindi Translator
 *
 * This is a lightweight global UI translator.
 * It translates visible English UI text without requiring
 * every individual component to be edited.
 */

const TRANSLATIONS: Record<string, string> = {
  /* ============================================================
     COMMON
  ============================================================ */

  "All States": "सभी राज्य",
  "All Districts": "सभी जिले",
  "All Statuses": "सभी स्थितियाँ",
  "Active Session": "सक्रिय सत्र",
  "Guest User": "अतिथि उपयोगकर्ता",
  "Guest": "अतिथि",
  "Sign Out": "साइन आउट",
  "Sign In": "साइन इन",
  "Login": "लॉगिन",
  "Logout": "लॉगआउट",
  "Switch Role or Sign In": "भूमिका बदलें या साइन इन करें",
  "View Alerts": "सूचनाएँ देखें",
  "Notifications": "सूचनाएँ",
  "Alerts": "अधिसूचनाएँ",
  "System Notifications": "सिस्टम सूचनाएँ",
  "System Alerts": "सिस्टम अलर्ट",

  /* ============================================================
     SIDEBAR / NAVIGATION
  ============================================================ */

  "National Dashboard": "राष्ट्रीय डैशबोर्ड",
  "Dashboard": "डैशबोर्ड",
  "Proposals": "प्रस्ताव",
  "GIS Map": "जीआईएस मानचित्र",
  "Compensation": "मुआवज़ा",
  "R&R": "पुनर्वास एवं पुनर्स्थापन",
  "Rehabilitation & Resettlement": "पुनर्वास एवं पुनर्स्थापन",
  "Documents": "दस्तावेज़",
  "Awards": "पुरस्कार",
  "Reports": "रिपोर्ट",
  "Grievance": "शिकायत",
  "Grievance Redressal": "शिकायत निवारण",
  "Map": "मानचित्र",
  "Settings": "सेटिंग्स",
  "Profile": "प्रोफ़ाइल",

  /* ============================================================
     DASHBOARD
  ============================================================ */

  "Live Parcel Map": "लाइव भूमि पार्सल मानचित्र",
  "Auto-sync active": "स्वचालित सिंक सक्रिय",
  "Statutory Lifecycle": "वैधानिक प्रक्रिया चक्र",
  "Compliant": "अनुपालन किया गया",
  "Module": "मॉड्यूल",
  "This module is available in subsequent build phases.":
    "यह मॉड्यूल आगामी निर्माण चरणों में उपलब्ध होगा।",

  "AREA NOTIFIED": "अधिसूचित क्षेत्र",
  "AREA ACQUIRED": "अधिग्रहित क्षेत्र",
  "COMP. ASSESSED": "निर्धारित मुआवज़ा",
  "COMP. PAID": "भुगतान किया गया मुआवज़ा",
  "FAMILIES AFFECTED": "प्रभावित परिवार",
  "R&R SETTLED": "R&R निपटान",

  "Area Notified": "अधिसूचित क्षेत्र",
  "Area Acquired": "अधिग्रहित क्षेत्र",
  "Compensation Assessed": "निर्धारित मुआवज़ा",
  "Compensation Paid": "भुगतान किया गया मुआवज़ा",
  "Families Affected": "प्रभावित परिवार",
  "R&R Settled": "R&R निपटान",

  /* ============================================================
     STATUTORY LIFECYCLE
  ============================================================ */

  "Section 11 Notification": "धारा 11 अधिसूचना",
  "Sec 11 Notification": "धारा 11 अधिसूचना",

  "Section 19 Declaration": "धारा 19 घोषणा",
  "Sec 19 Declaration": "धारा 19 घोषणा",

  "Section 23 Award": "धारा 23 पुरस्कार",
  "Sec 23 Award": "धारा 23 पुरस्कार",

  "Section 23 Award Declaration": "धारा 23 पुरस्कार घोषणा",

  "PFMS Direct Benefit Transfer":
    "PFMS प्रत्यक्ष लाभ अंतरण",

  "Direct Benefit Transfer (DBT)":
    "प्रत्यक्ष लाभ अंतरण (DBT)",

  "Direct Benefit Transfer":
    "प्रत्यक्ष लाभ अंतरण",

  "DBT": "डीबीटी",

  "Section 38 Possession": "धारा 38 भूमि कब्ज़ा",
  "Sec 38 Possession": "धारा 38 भूमि कब्ज़ा",

  "Section 38 Land Possession": "धारा 38 भूमि कब्ज़ा",

  "R&R Settlement": "R&R निपटान",
  "R&R Entitlements Settlement": "R&R अधिकार निपटान",
  "Entitlements Settlement": "अधिकार निपटान",

  "Award / Land Possession": "पुरस्कार / भूमि कब्ज़ा",
  "Proposed Alignment": "प्रस्तावित संरेखण",
  "Map Legend": "मानचित्र संकेत",

  /* ============================================================
     WORKFLOW / STATUS
  ============================================================ */

  "In Survey": "सर्वेक्षण में",
  "Submitted": "जमा किया गया",
  "Under Scrutiny": "जाँच के अधीन",
  "Under Review": "समीक्षा के अधीन",
  "Published": "प्रकाशित",
  "Draft": "मसौदा",
  "Settled": "निपटाया गया",
  "Settlement": "निपटान",
  "Possession": "कब्ज़ा",
  "Award": "पुरस्कार",

  "Processing DBT": "डीबीटी प्रक्रियाधीन",
  "DBT प्रक्रिया में": "डीबीटी प्रक्रियाधीन",

  "Disbursed": "वितरित",
  "Disburse DBT": "डीबीटी वितरित करें",

  "Pending": "लंबित",
  "Pending Awards": "लंबित पुरस्कार",
  "Pending DBT": "लंबित डीबीटी",

  "In Progress": "प्रगति में",
  "Completed": "पूर्ण",
  "Approved": "स्वीकृत",
  "Rejected": "अस्वीकृत",

  /* ============================================================
     ACTION BUTTONS
  ============================================================ */

  "New Proposal": "नया प्रस्ताव",
  "New Award Draft": "नया पुरस्कार मसौदा",
  "New Award": "नया पुरस्कार",

  "Upload Document": "दस्तावेज़ अपलोड करें",
  "Upload Documents": "दस्तावेज़ अपलोड करें",

  "Generate New Report": "नई रिपोर्ट तैयार करें",

  "Mark Resolved": "समाधान किया गया चिह्नित करें",
  "Start Inquiry": "जाँच शुरू करें",
  "Scrutinize": "जाँच करें",
  "Approve": "स्वीकृत करें",
  "Reject": "अस्वीकार करें",
  "Publish": "प्रकाशित करें",
  "Download": "डाउनलोड करें",
  "Download करें": "डाउनलोड करें",
  "Disburse": "वितरित करें",
  "Save": "सहेजें",
  "Cancel": "रद्द करें",
  "Close": "बंद करें",
  "Search": "खोजें",
  "Filter": "फ़िल्टर",
  "View": "देखें",
  "Edit": "संपादित करें",
  "Delete": "हटाएँ",
  "Actions": "कार्यवाही",
  "Action": "कार्यवाही",

  /* ============================================================
     PROPOSALS
  ============================================================ */

  "Project Proposal": "परियोजना प्रस्ताव",
  "Project Name": "परियोजना का नाम",
  "Reference ID": "संदर्भ आईडी",
  "Proposal ID": "प्रस्ताव आईडी",
  "Ministry": "मंत्रालय",
  "Location": "स्थान",
  "Area": "क्षेत्र",
  "Area (Hectares)": "क्षेत्रफल (हेक्टेयर)",
  "Area Notified": "अधिसूचित क्षेत्र",
  "Area Acquired": "अधिग्रहित क्षेत्र",

  "Ministry of Road Transport & Highways":
    "सड़क परिवहन एवं राजमार्ग मंत्रालय",

  "Ministry of Railways": "रेल मंत्रालय",
  "Ministry of Jal Shakti": "जल शक्ति मंत्रालय",

  "Road Transport and Highways Ministry":
    "सड़क परिवहन एवं राजमार्ग मंत्रालय",

  "Department of Land Resources":
    "भूमि संसाधन विभाग",

  "Government of India":
    "भारत सरकार",

  /* ============================================================
     RISK
  ============================================================ */

  "Delay Risk": "विलंब जोखिम",
  "Risk": "जोखिम",
  "High": "उच्च",
  "Medium": "मध्यम",
  "Low": "कम",

  "High Risk": "उच्च जोखिम",
  "Medium Risk": "मध्यम जोखिम",
  "Low Risk": "कम जोखिम",

  "Critical": "गंभीर",
  "Warning": "चेतावनी",
  "WARNING": "चेतावनी",
  "INFO": "जानकारी",

  /* ============================================================
     AWARDS
  ============================================================ */

  "Award Management": "पुरस्कार प्रबंधन",
  "Draft, review and publish land acquisition awards":
    "भूमि अधिग्रहण पुरस्कारों का मसौदा, समीक्षा और प्रकाशन करें",

  "Award Register": "पुरस्कार रजिस्टर",
  "All award drafts and published awards":
    "सभी पुरस्कार मसौदे और प्रकाशित पुरस्कार",

  "Award ID": "पुरस्कार आईडी",
  "Beneficiaries": "लाभार्थी",
  "Authority": "प्राधिकरण",
  "Amount": "राशि",
  "Date": "दिनांक",
  "Status": "स्थिति",

  "4 records": "4 रिकॉर्ड",

  /* ============================================================
     COMPENSATION
  ============================================================ */

  "Compensation Register": "मुआवज़ा रजिस्टर",
  "Compensation & Payment": "मुआवज़ा एवं भुगतान",

  "Market Value": "बाज़ार मूल्य",
  "Solatium (100%)": "सोलैटियम (100%)",
  "Total Assessed Amount": "कुल निर्धारित राशि",
  "Disbursed Amount (PFMS)": "वितरित राशि (PFMS)",

  "Paid": "भुगतान किया गया",
  "Payment": "भुगतान",
  "Payment Status": "भुगतान स्थिति",

  "DBT प्रक्रिया में": "DBT प्रक्रिया में",

  /* ============================================================
     R&R
  ============================================================ */

  "Manage affected families and track statutory entitlements under RFCTLARR Act.":
    "प्रभावित परिवारों का प्रबंधन करें और RFCTLARR अधिनियम के अंतर्गत वैधानिक अधिकारों की निगरानी करें।",

  "Family Head": "परिवार प्रमुख",
  "Category": "श्रेणी",
  "Displacement": "विस्थापन",
  "Entitlements": "अधिकार",
  "Housing": "आवास",
  "Annuity": "वार्षिकी",
  "Employment": "रोज़गार",

  "Displaced": "विस्थापित",
  "Affected Not Displaced": "प्रभावित, विस्थापित नहीं",
  "Tenant": "किरायेदार",
  "Owner": "स्वामी",
  "Agricultural Labourer": "कृषि मज़दूर",

  /* ============================================================
     DOCUMENTS
  ============================================================ */

  "Document Repository": "दस्तावेज़ भंडार",

  "SHA-256 digital signatures, tamper-evident and timestamped evidence document repository.":
    "SHA-256 डिजिटल हस्ताक्षर, छेड़छाड़-रोधी और समय-मुद्रित साक्ष्य दस्तावेज़ भंडार।",

  "Title": "शीर्षक",
  "Type": "प्रकार",
  "Version": "संस्करण",
  "Uploaded By": "अपलोड करने वाला",
  "Uploaded Date": "अपलोड दिनांक",
  "Date": "दिनांक",
  "Checksum (SHA-256)": "चेकसम (SHA-256)",
  "Verified": "सत्यापित",
  "Signature Pending": "हस्ताक्षर लंबित",

  "Survey": "सर्वेक्षण",
  "Legal": "कानूनी",
  "Report": "रिपोर्ट",
  "Gazette": "राजपत्र",

  /* ============================================================
     REPORTS
  ============================================================ */

  "MIS & Statutory Report": "MIS एवं वैधानिक रिपोर्ट",

  "Generate and maintain statutory land acquisition and DBT financial reports.":
    "वैधानिक भूमि अधिग्रहण एवं DBT वित्तीय रिपोर्ट तैयार और प्रबंधित करें।",

  "Generate and maintain statutory land acquisition and DBT financial":
    "वैधानिक भूमि अधिग्रहण एवं DBT वित्तीय",

  "Generate": "तैयार करें",
  "Recent MIS Records": "हाल के MIS रिकॉर्ड",

  "REPORT ID": "रिपोर्ट आईडी",
  "Generated Date": "तैयार दिनांक",
  "Size / Format": "आकार / प्रारूप",

  "TOTAL REPORTS GENERATED": "कुल तैयार रिपोर्ट",
  "AUTOMATED MIS CHECKS": "स्वचालित MIS जाँच",
  "NEXT SCHEDULED STATE REVIEW": "अगली निर्धारित राज्य समीक्षा",

  "Progress": "प्रगति",
  "Financial": "वित्तीय",
  "Social": "सामाजिक",

  "Compliance": "अनुपालन",
  "Compliance rate": "अनुपालन दर",
  "Days": "दिन",

  /* ============================================================
     GRIEVANCE
  ============================================================ */

  "Grievance Redressal": "शिकायत निवारण",

  "Track and resolve complaints from affected families and stakeholders.":
    "प्रभावित परिवारों और हितधारकों की शिकायतों की निगरानी एवं समाधान करें।",

  "Track and resolve complaints":
    "शिकायतों की निगरानी एवं समाधान करें",

  "Tracking ID": "ट्रैकिंग आईडी",
  "Complaint": "शिकायत",
  "Complainant": "शिकायतकर्ता",
  "Submission Date": "जमा दिनांक",
  "Priority": "प्राथमिकता",

  "Measurement Dispute": "माप संबंधी विवाद",
  "R&R Eligibility": "R&R पात्रता",
  "Compensation Assessment": "मुआवज़ा निर्धारण",

  "Open": "खुली",
  "Resolved": "समाधान किया गया",

  "Resolution": "समाधान",
  "AVG. RESOLUTION": "औसत समाधान",
  "14 Days": "14 दिन",

  /* ============================================================
     NOTIFICATIONS
  ============================================================ */

  "System Notifications & Alerts": "सिस्टम सूचनाएँ एवं अधिसूचनाएँ",

  "Role-scoped automated alerts for SLA tracking, approvals, and lapse-risks.":
    "SLA निगरानी, अनुमोदन और समय-सीमा जोखिमों के लिए भूमिका-आधारित स्वचालित सूचनाएँ।",

  "Lapse Risk": "समय-सीमा जोखिम",
  "Lapse जोखिम": "समय-सीमा जोखिम",

  "SLA Breach": "SLA उल्लंघन",

  "Approval Pending": "अनुमोदन लंबित",

  "Section 24(2) lapse risk":
    "धारा 24(2) समय-सीमा जोखिम",

  "is approaching statutory threshold with pending possession":
    "लंबित कब्ज़े के साथ वैधानिक सीमा के निकट है",

  "delayed by": "में देरी हुई",
  "days": "दिन",

  "beyond SLA clearance deadline":
    "SLA स्वीकृति की समय-सीमा से अधिक",

  "submitted compensation award":
    "मुआवज़ा पुरस्कार प्रस्तुत किया",

  "for": "के लिए",

  /* ============================================================
     COMMON MIXED PHRASES FROM NOTIFICATIONS
  ============================================================ */

  "Lapse Risk:": "समय-सीमा जोखिम:",
  "SLA Breach:": "SLA उल्लंघन:",
  "Approval Pending:": "अनुमोदन लंबित:",

  /* ============================================================
     MAP
  ============================================================ */

  "IN India View": "भारत दृश्य",
  "India": "भारत",
  "Zoom In": "ज़ूम इन",
  "Zoom Out": "ज़ूम आउट",
  "Reset View": "दृश्य रीसेट करें",

  /* ============================================================
     DATE / TIME
  ============================================================ */

  "Today": "आज",
  "Yesterday": "कल",
  "Tomorrow": "कल",
  "Monday": "सोमवार",
  "Tuesday": "मंगलवार",
  "Wednesday": "बुधवार",
  "Thursday": "गुरुवार",
  "Friday": "शुक्रवार",
  "Saturday": "शनिवार",
  "Sunday": "रविवार",

  "January": "जनवरी",
  "February": "फ़रवरी",
  "March": "मार्च",
  "April": "अप्रैल",
  "May": "मई",
  "June": "जून",
  "July": "जुलाई",
  "August": "अगस्त",
  "September": "सितंबर",
  "October": "अक्टूबर",
  "November": "नवंबर",
  "December": "दिसंबर",
};

/**
 * Longer phrases must be replaced first.
 * This prevents:
 *
 * "Section 38 Land Possession"
 *
 * from becoming partially translated before the
 * complete phrase gets translated.
 */
const SORTED_KEYS = Object.keys(TRANSLATIONS).sort(
  (a, b) => b.length - a.length
);

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function translateText(text: string): string {
  if (!text.trim()) return text;

  let result = text;

  for (const english of SORTED_KEYS) {
    const hindi = TRANSLATIONS[english];

    const regex = new RegExp(
      escapeRegExp(english),
      "gi"
    );

    result = result.replace(regex, hindi);
  }

  return result;
}

function isTranslatableTextNode(node: Node): boolean {
  const parent = node.parentElement;

  if (!parent) return false;

  const tag = parent.tagName;

  if (
    tag === "SCRIPT" ||
    tag === "STYLE" ||
    tag === "NOSCRIPT" ||
    tag === "CODE"
  ) {
    return false;
  }

  return true;
}

export default function GlobalHindiTranslator({
  language,
}: Props) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    /**
     * Store the original English text.
     * This is important because the old translator
     * could not restore English after switching back.
     */
    const originalTexts = new WeakMap<Text, string>();

    const originalAttributes = new WeakMap<
      HTMLElement,
      {
        placeholder?: string;
        title?: string;
        ariaLabel?: string;
      }
    >();

    let isApplying = false;
    let timer: number | undefined;

    const saveOriginalText = (node: Text) => {
      if (!originalTexts.has(node)) {
        originalTexts.set(node, node.nodeValue ?? "");
      }
    };

    const translateNode = (node: Text) => {
      if (!isTranslatableTextNode(node)) return;

      saveOriginalText(node);

      const original = originalTexts.get(node) ?? "";

      if (language === "hi") {
        const translated = translateText(original);

        if (node.nodeValue !== translated) {
          node.nodeValue = translated;
        }
      } else {
        if (node.nodeValue !== original) {
          node.nodeValue = original;
        }
      }
    };

    const translateAttributes = (element: HTMLElement) => {
      if (!originalAttributes.has(element)) {
        originalAttributes.set(element, {
          placeholder: element.getAttribute("placeholder") ?? undefined,
          title: element.getAttribute("title") ?? undefined,
          ariaLabel: element.getAttribute("aria-label") ?? undefined,
        });
      }

      const original = originalAttributes.get(element);

      if (!original) return;

      if (language === "hi") {
        if (original.placeholder !== undefined) {
          element.setAttribute(
            "placeholder",
            translateText(original.placeholder)
          );
        }

        if (original.title !== undefined) {
          element.setAttribute(
            "title",
            translateText(original.title)
          );
        }

        if (original.ariaLabel !== undefined) {
          element.setAttribute(
            "aria-label",
            translateText(original.ariaLabel)
          );
        }
      } else {
        if (original.placeholder !== undefined) {
          element.setAttribute(
            "placeholder",
            original.placeholder
          );
        }

        if (original.title !== undefined) {
          element.setAttribute("title", original.title);
        }

        if (original.ariaLabel !== undefined) {
          element.setAttribute(
            "aria-label",
            original.ariaLabel
          );
        }
      }
    };

    const translatePage = () => {
      if (isApplying) return;

      isApplying = true;

      try {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT
        );

        const textNodes: Text[] = [];

        let current = walker.nextNode();

        while (current) {
          textNodes.push(current as Text);
          current = walker.nextNode();
        }

        for (const node of textNodes) {
          translateNode(node);
        }

        const elements = document.body.querySelectorAll<HTMLElement>(
          "input, textarea, button, [title], [aria-label]"
        );

        elements.forEach((element) => {
          translateAttributes(element);
        });
      } finally {
        isApplying = false;
      }
    };

    const scheduleTranslation = () => {
      if (timer) {
        window.clearTimeout(timer);
      }

      timer = window.setTimeout(() => {
        translatePage();
      }, 30);
    };

    /**
     * Initial translation.
     */
    translatePage();

    /**
     * Watch dynamically rendered React content.
     *
     * This is important for:
     * - Notifications
     * - API data
     * - Tables
     * - Modals
     * - New rows
     * - Dashboard updates
     */
    const observer = new MutationObserver(() => {
      if (!isApplying) {
        scheduleTranslation();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        "placeholder",
        "title",
        "aria-label",
      ],
    });

    return () => {
      observer.disconnect();

      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [language]);

  return null;
}