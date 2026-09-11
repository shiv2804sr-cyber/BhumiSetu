import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Circle } from "lucide-react";

/* =========================================================
   BHOOMISETU — TYPES
   ========================================================= */

type Language = "en" | "hi";

type DistrictKPI = {
  areaNotified: number;
  areaAcquired: number;
  compensationAssessed: number;
  compensationDisbursed: number;
  familiesAffected: number;
  familiesRnR: number;
};

type StateData = Record<string, Record<string, DistrictKPI>>;

/* =========================================================
   STATE / DISTRICT DEMO DATA
   ========================================================= */

const DISTRICT_SEEDS: Record<string, Record<string, number>> = {
  Delhi: {
    "New Delhi": 11,
    "North Delhi": 12,
    "South Delhi": 13,
    "East Delhi": 14,
    "West Delhi": 15,
  },

  Haryana: {
    Nuh: 21,
    Gurugram: 22,
    Faridabad: 23,
    Rohtak: 24,
    Hisar: 25,
    Ambala: 26,
  },

  "Uttar Pradesh": {
    Lucknow: 31,
    Kanpur: 32,
    Agra: 33,
    Varanasi: 34,
    Noida: 35,
    Meerut: 36,
  },

  Maharashtra: {
    Pune: 41,
    Mumbai: 42,
    Nashik: 43,
    Nagpur: 44,
    Thane: 45,
  },

  "Tamil Nadu": {
    Chennai: 51,
    Kanchipuram: 52,
    Coimbatore: 53,
    Madurai: 54,
  },

  Karnataka: {
    Bangalore: 61,
    Mysore: 62,
    Belgaum: 63,
    Mangalore: 64,
    Hubli: 65,
    Tumkur: 66,
  },

  "Madhya Pradesh": {
    Indore: 71,
    Bhopal: 72,
    Jabalpur: 73,
    Gwalior: 74,
    Ujjain: 75,
    Sagar: 76,
  },

  Rajasthan: {
    Jaipur: 81,
    Jodhpur: 82,
    Udaipur: 83,
    Ajmer: 84,
    Bikaner: 85,
    Kota: 86,
  },

  Jharkhand: {
    Ranchi: 91,
    Dhanbad: 92,
    Giridih: 93,
    Bokaro: 94,
    Hazaribagh: 95,
    Deoghar: 96,
  },

  Bihar: {
    Patna: 101,
    Gaya: 102,
    Muzaffarpur: 103,
    Darbhanga: 104,
    Bhagalpur: 105,
    Madhubani: 106,
  },
};

/* =========================================================
   CREATE DEMO KPI DATA
   ========================================================= */

function createDistrictKPI(seed: number): DistrictKPI {
  const areaNotified = 700 + seed * 37;

  const acquisitionRate =
    0.60 + (seed % 10) * 0.025;

  const areaAcquired = Math.round(
    areaNotified * acquisitionRate
  );

  const compensationAssessed =
    65_000_000 +
    seed * 4_750_000;

  const paidRate =
    0.62 + (seed % 9) * 0.025;

  const compensationDisbursed = Math.round(
    compensationAssessed * paidRate
  );

  const familiesAffected =
    180 +
    seed * 23;

  const rnrRate =
    0.55 + (seed % 8) * 0.04;

  const familiesRnR = Math.round(
    familiesAffected * rnrRate
  );

  return {
    areaNotified,
    areaAcquired,
    compensationAssessed,
    compensationDisbursed,
    familiesAffected,
    familiesRnR,
  };
}

const MOCK_KPI_DATA: StateData =
  Object.fromEntries(
    Object.entries(DISTRICT_SEEDS).map(
      ([state, districts]) => [
        state,
        Object.fromEntries(
          Object.entries(districts).map(
            ([district, seed]) => [
              district,
              createDistrictKPI(seed),
            ]
          )
        ),
      ]
    )
  );

/* =========================================================
   KPI HELPERS
   ========================================================= */

function emptyKPI(): DistrictKPI {
  return {
    areaNotified: 0,
    areaAcquired: 0,
    compensationAssessed: 0,
    compensationDisbursed: 0,
    familiesAffected: 0,
    familiesRnR: 0,
  };
}

function addKPI(
  first: DistrictKPI,
  second: DistrictKPI
): DistrictKPI {
  return {
    areaNotified:
      first.areaNotified +
      second.areaNotified,

    areaAcquired:
      first.areaAcquired +
      second.areaAcquired,

    compensationAssessed:
      first.compensationAssessed +
      second.compensationAssessed,

    compensationDisbursed:
      first.compensationDisbursed +
      second.compensationDisbursed,

    familiesAffected:
      first.familiesAffected +
      second.familiesAffected,

    familiesRnR:
      first.familiesRnR +
      second.familiesRnR,
  };
}

function calculateKPI(
  selectedState: string,
  selectedDistrict: string
): DistrictKPI {
  /* SPECIFIC DISTRICT */

  if (
    selectedState !== "All States" &&
    selectedDistrict !== "All Districts"
  ) {
    const stateData =
      MOCK_KPI_DATA[selectedState];

    if (!stateData) {
      return emptyKPI();
    }

    const districtData =
      stateData[selectedDistrict];

    if (!districtData) {
      return emptyKPI();
    }

    return districtData;
  }

  /* SPECIFIC STATE — ALL DISTRICTS */

  if (
    selectedState !== "All States" &&
    selectedDistrict === "All Districts"
  ) {
    const stateData =
      MOCK_KPI_DATA[selectedState];

    if (!stateData) {
      return emptyKPI();
    }

    return Object.values(stateData).reduce(
      (total, district) =>
        addKPI(total, district),
      emptyKPI()
    );
  }

  /* ALL STATES — ALL DISTRICTS */

  return Object.values(MOCK_KPI_DATA)
    .flatMap((state) =>
      Object.values(state)
    )
    .reduce(
      (total, district) =>
        addKPI(total, district),
      emptyKPI()
    );
}

/* =========================================================
   FORMATTERS
   ========================================================= */

function formatNumber(value: number): string {
  return new Intl.NumberFormat(
    "en-IN"
  ).format(value);
}

function formatRupees(
  value: number,
  language: Language
): string {
  if (value >= 10_000_000) {
    return `₹${(
      value / 10_000_000
    ).toFixed(1)} ${
      language === "hi"
        ? "करोड़"
        : "Cr"
    }`;
  }

  if (value >= 100_000) {
    return `₹${(
      value / 100_000
    ).toFixed(1)} ${
      language === "hi"
        ? "लाख"
        : "L"
    }`;
  }

  return `₹${formatNumber(value)}`;
}

/* =========================================================
   KPI LEDGER
   ========================================================= */

export function KPILedger({
  selectedState = "All States",
  selectedDistrict = "All Districts",
  language = "en",
}: {
  selectedState?: string;
  selectedDistrict?: string;
  language?: Language;
}) {
  const kpis = useMemo(() => {
    return calculateKPI(
      selectedState,
      selectedDistrict
    );
  }, [
    selectedState,
    selectedDistrict,
  ]);

  const metrics = [
    {
      label:
        language === "hi"
          ? "अधिसूचित क्षेत्र"
          : "Area Notified",

      value: `${formatNumber(
        kpis.areaNotified
      )} ${
        language === "hi"
          ? "हेक्टेयर"
          : "Ha"
      }`,

      bgColor: "bg-[#E8F3ED]",

      bottomBorder:
        "border-b-2 border-forest-light/40",
    },

    {
      label:
        language === "hi"
          ? "अधिग्रहित क्षेत्र"
          : "Area Acquired",

      value: `${formatNumber(
        kpis.areaAcquired
      )} ${
        language === "hi"
          ? "हेक्टेयर"
          : "Ha"
      }`,

      bgColor: "bg-[#E7F4F2]",

      bottomBorder:
        "border-b-2 border-graticule-teal/40",
    },

    {
      label:
        language === "hi"
          ? "मुआवज़ा आकलित"
          : "Comp. Assessed",

      value: formatRupees(
        kpis.compensationAssessed,
        language
      ),

      bgColor: "bg-[#FFF5DE]",

      bottomBorder:
        "border-b-2 border-earth-accent/40",
    },

    {
      label:
        language === "hi"
          ? "मुआवज़ा भुगतान"
          : "Comp. Paid",

      value: formatRupees(
        kpis.compensationDisbursed,
        language
      ),

      bgColor: "bg-[#EAF2FA]",

      bottomBorder:
        "border-b-2 border-blue-500/40",
    },

    {
      label:
        language === "hi"
          ? "प्रभावित परिवार"
          : "Families Affected",

      value: formatNumber(
        kpis.familiesAffected
      ),

      bgColor: "bg-[#F9EEEE]",

      bottomBorder:
        "border-b-2 border-red-400/40",
    },

    {
      label:
        language === "hi"
          ? "R&R निपटान"
          : "R&R Settled",

      value: formatNumber(
        kpis.familiesRnR
      ),

      bgColor: "bg-[#EEF3F0]",

      bottomBorder:
        "border-b-2 border-forest-light/40",
    },
  ];

  return (
    <div className="flex flex-nowrap overflow-x-auto border-b border-neutral-stone/20 bg-card-primary card-shadow rounded-lg">
      {metrics.map(
        (metric, i) => (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: i * 0.08,
              duration: 0.4,
            }}
            key={metric.label}
            className={`
              flex-1
              min-w-[140px]
              p-5
              hover:opacity-90
              transition-all
              duration-300
              cursor-pointer
              group
              ${metric.bgColor}
              ${metric.bottomBorder}
            `}
            whileHover={{
              y: -2,
            }}
          >
            <div className="text-[10px] font-semibold uppercase tracking-wider text-secondary-text mb-2">
              {metric.label}
            </div>

            <div className="text-2xl font-serif font-bold text-heading-dark">
              {metric.value}
            </div>

            <motion.div
              initial={{
                width: 0,
              }}
              whileHover={{
                width: "1.5rem",
              }}
              className="h-0.5 bg-forest-light mt-2 rounded-full"
            />
          </motion.div>
        )
      )}
    </div>
  );
}

/* =========================================================
   PREDICTIVE RISK
   ========================================================= */

export function PredictiveRisk({
  language = "en",
}: {
  language?: Language;
}) {
  const [summary, setSummary] =
    useState<{
      high: number;
      medium: number;
      low: number;
    }>({
      high: 1,
      medium: 2,
      low: 2,
    });

  useEffect(() => {
    fetch(
      "/api/v1/dashboard/summary"
    )
      .then((res) =>
        res.json()
      )
      .then((resData) => {
        if (
          resData.data?.riskDistribution
        ) {
          setSummary(
            resData.data
              .riskDistribution
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="bg-card-info p-6 border border-card-accent-blue rounded-lg h-full flex flex-col mt-6 hover:shadow-md transition-shadow duration-300 card-shadow"
    >
      {/* Header */}

      <div className="mb-6 pb-4 border-b border-neutral-stone/20">
        <h3 className="font-serif text-lg font-semibold text-heading-dark">
          {language === "hi"
            ? "पूर्वानुमानित विलंब जोखिम"
            : "Predictive Delay Risk"}
        </h3>

        <p className="text-xs text-secondary-text font-medium mt-1">
          {language === "hi"
            ? "RFCTLARR सांख्यिकीय पूर्वानुमान"
            : "RFCTLARR statistical forecast"}
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">

        {/* HIGH RISK */}

        <motion.div
          whileHover={{
            y: -2,
          }}
          className="flex gap-4 items-center p-4 rounded-lg bg-red-50 border-l-4 border-alluvium-red border border-neutral-stone/15 hover:shadow-sm transition-all duration-300"
        >
          <div className="w-12 h-12 shrink-0 rounded-lg bg-red-100/60 border border-alluvium-red/30 flex items-center justify-center">
            <span className="text-sm font-bold text-alluvium-red">
              {summary.high}
            </span>
          </div>

          <div className="flex-1">
            <h4 className="font-semibold text-heading-dark text-sm">
              {language === "hi"
                ? "उच्च विलंब जोखिम"
                : "High Delay Risk"}
            </h4>

            <p className="text-xs text-secondary-text mt-0.5">
              {language === "hi"
                ? "तत्काल कार्रवाई आवश्यक"
                : "Requires immediate action"}
            </p>
          </div>
        </motion.div>

        {/* MEDIUM RISK */}

        <motion.div
          whileHover={{
            y: -2,
          }}
          className="flex gap-4 items-center p-4 rounded-lg bg-amber-50 border-l-4 border-earth-accent border border-neutral-stone/15 hover:shadow-sm transition-all duration-300"
        >
          <div className="w-12 h-12 shrink-0 rounded-lg bg-amber-100/60 border border-earth-accent/30 flex items-center justify-center">
            <span className="text-sm font-bold text-earth-accent">
              {summary.medium}
            </span>
          </div>

          <div className="flex-1">
            <h4 className="font-semibold text-heading-dark text-sm">
              {language === "hi"
                ? "मध्यम जोखिम"
                : "Medium Risk"}
            </h4>

            <p className="text-xs text-secondary-text mt-0.5">
              {language === "hi"
                ? "नज़दीकी निगरानी रखें"
                : "Monitor closely"}
            </p>
          </div>
        </motion.div>

        {/* LOW RISK */}

        <motion.div
          whileHover={{
            y: -2,
          }}
          className="flex gap-4 items-center p-4 rounded-lg bg-soft-green border-l-4 border-forest-light border border-neutral-stone/15 hover:shadow-sm transition-all duration-300"
        >
          <div className="w-12 h-12 shrink-0 rounded-lg bg-green-100/60 border border-forest-light/30 flex items-center justify-center">
            <span className="text-sm font-bold text-forest-light">
              {summary.low}
            </span>
          </div>

          <div className="flex-1">
            <h4 className="font-semibold text-heading-dark text-sm">
              {language === "hi"
                ? "कम जोखिम / समयानुसार"
                : "Low Risk / On Schedule"}
            </h4>

            <p className="text-xs text-secondary-text mt-0.5">
              {language === "hi"
                ? "कार्य प्रगति पर है"
                : "On track"}
            </p>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

/* =========================================================
   WORKFLOW TRANSLATION
   ========================================================= */

function translateStageName(
  name: string,
  language: Language
): string {
  if (language === "en") {
    return name;
  }

  const normalizedName =
    name.trim();

  const translations: Record<
    string,
    string
  > = {
    "Section 11 Notification":
      "धारा 11 अधिसूचना",

    "Section 11":
      "धारा 11",

    "Section 19 Declaration":
      "धारा 19 घोषणा",

    "Section 19":
      "धारा 19",

    "Section 23 Award":
      "धारा 23 पुरस्कार",

    "Section 23 Award Declaration":
      "धारा 23 पुरस्कार घोषणा",

    "Section 23":
      "धारा 23 पुरस्कार",

    "Award Declaration":
      "पुरस्कार घोषणा",

    "PFMS Direct Benefit Transfer":
      "PFMS प्रत्यक्ष लाभ अंतरण",

    "Direct Benefit Transfer (DBT)":
      "प्रत्यक्ष लाभ अंतरण (DBT)",

    "Direct Benefit Transfer":
      "प्रत्यक्ष लाभ अंतरण",

    "Section 38 Possession":
      "धारा 38 भूमि कब्ज़ा",

    "Section 38":
      "धारा 38 भूमि कब्ज़ा",

    "Possession":
      "भूमि कब्ज़ा",

    "R&R Settlement":
      "R&R निपटान",

    "R&R Entitlements Settlement":
      "R&R अधिकार निपटान",

    "R&R Entitlement Settlement":
      "R&R अधिकार निपटान",

    "Rehabilitation & Resettlement":
      "पुनर्वास एवं पुनर्स्थापन",

    "Rehabilitation and Resettlement":
      "पुनर्वास एवं पुनर्स्थापन",

    "Rehabilitation":
      "पुनर्वास",

    "Resettlement":
      "पुनर्स्थापन",
  };

  /* Exact match first */
  if (translations[normalizedName]) {
    return translations[normalizedName];
  }

  /*
   * Extra protection for API values such as:
   * "Section 23 Award Declaration - ..."
   */
  if (
    normalizedName
      .toLowerCase()
      .includes("section 23 award declaration")
  ) {
    return normalizedName.replace(
      /Section 23 Award Declaration/gi,
      "धारा 23 पुरस्कार घोषणा"
    );
  }

  if (
    normalizedName
      .toLowerCase()
      .includes("section 23 award")
  ) {
    return normalizedName.replace(
      /Section 23 Award/gi,
      "धारा 23 पुरस्कार"
    );
  }

  if (
    normalizedName
      .toLowerCase()
      .includes("section 19 declaration")
  ) {
    return normalizedName.replace(
      /Section 19 Declaration/gi,
      "धारा 19 घोषणा"
    );
  }

  if (
    normalizedName
      .toLowerCase()
      .includes("section 11 notification")
  ) {
    return normalizedName.replace(
      /Section 11 Notification/gi,
      "धारा 11 अधिसूचना"
    );
  }

  if (
    normalizedName
      .toLowerCase()
      .includes("section 38 possession")
  ) {
    return normalizedName.replace(
      /Section 38 Possession/gi,
      "धारा 38 भूमि कब्ज़ा"
    );
  }

  if (
    normalizedName
      .toLowerCase()
      .includes("pfms direct benefit transfer")
  ) {
    return normalizedName.replace(
      /PFMS Direct Benefit Transfer/gi,
      "PFMS प्रत्यक्ष लाभ अंतरण"
    );
  }

  if (
    normalizedName
      .toLowerCase()
      .includes("r&r settlement")
  ) {
    return normalizedName.replace(
      /R&R Settlement/gi,
      "R&R निपटान"
    );
  }

  return normalizedName;
}

/* =========================================================
   WORKFLOW DATE TRANSLATION
   ========================================================= */

function translateStageDate(
  date: string,
  language: Language
): string {
  if (language === "en") {
    return date;
  }

  const normalizedDate =
    date.trim();

  const translations: Record<
    string,
    string
  > = {
    "12 Oct 2025":
      "12 अक्टूबर 2025",

    "05 Nov 2025":
      "05 नवंबर 2025",

    "15 Mar 2026":
      "15 मार्च 2026",

    "In Scrutiny (Due: 15 Mar)":
      "जांच में (देय: 15 मार्च)",

    "Pending Award":
      "पुरस्कार लंबित",

    "Pending DBT":
      "DBT लंबित",

    "In Survey":
      "सर्वेक्षण में",

    "Completed":
      "पूर्ण",

    "Pending":
      "लंबित",

    "Current":
      "वर्तमान",
  };

  if (translations[normalizedDate]) {
    return translations[normalizedDate];
  }

  /*
   * Handle API date formats such as:
   * 2025-10-12
   * 2025-11-05
   */
  const isoDateMatch =
    normalizedDate.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (isoDateMatch) {
    const year =
      isoDateMatch[1];

    const month =
      isoDateMatch[2];

    const day =
      isoDateMatch[3];

    const months: Record<
      string,
      string
    > = {
      "01": "जनवरी",
      "02": "फ़रवरी",
      "03": "मार्च",
      "04": "अप्रैल",
      "05": "मई",
      "06": "जून",
      "07": "जुलाई",
      "08": "अगस्त",
      "09": "सितंबर",
      "10": "अक्टूबर",
      "11": "नवंबर",
      "12": "दिसंबर",
    };

    return `${day} ${
      months[month] || month
    } ${year}`;
  }

  /*
   * Handle common English month names
   */
  const monthTranslations: Record<
    string,
    string
  > = {
    January: "जनवरी",
    February: "फ़रवरी",
    March: "मार्च",
    April: "अप्रैल",
    May: "मई",
    June: "जून",
    July: "जुलाई",
    August: "अगस्त",
    September: "सितंबर",
    October: "अक्टूबर",
    November: "नवंबर",
    December: "दिसंबर",
  };

  let translatedDate =
    normalizedDate;

  Object.entries(
    monthTranslations
  ).forEach(
    ([englishMonth, hindiMonth]) => {
      translatedDate =
        translatedDate.replace(
          new RegExp(
            englishMonth,
            "gi"
          ),
          hindiMonth
        );
    }
  );

  translatedDate =
    translatedDate.replace(
      /In Scrutiny/gi,
      "जांच में"
    );

  translatedDate =
    translatedDate.replace(
      /Due/gi,
      "देय"
    );

  translatedDate =
    translatedDate.replace(
      /Pending Award/gi,
      "पुरस्कार लंबित"
    );

  translatedDate =
    translatedDate.replace(
      /Pending DBT/gi,
      "DBT लंबित"
    );

  translatedDate =
    translatedDate.replace(
      /In Survey/gi,
      "सर्वेक्षण में"
    );

  return translatedDate;
}

/* =========================================================
   WORKFLOW STATUS TRANSLATION
   ========================================================= */

function translateStatus(
  status: string,
  language: Language
): string {
  if (language === "en") {
    return status;
  }

  const translations: Record<
    string,
    string
  > = {
    completed: "पूर्ण",
    current: "वर्तमान",
    pending: "लंबित",
    complete: "पूर्ण",
    active: "सक्रिय",
    in_progress: "प्रगति पर",
  };

  return (
    translations[
      status.toLowerCase()
    ] || status
  );
}

/* =========================================================
   WORKFLOW TRACKER
   ========================================================= */

export function WorkflowTracker({
  language = "en",
}: {
  language?: Language;
}) {
  const defaultStages = [
    {
      id: 1,
      name: "Section 11 Notification",
      status: "completed",
      date: "12 Oct 2025",
    },

    {
      id: 2,
      name: "Section 19 Declaration",
      status: "completed",
      date: "05 Nov 2025",
    },

    {
      id: 3,
      name: "Section 23 Award Declaration",
      status: "current",
      date: "In Scrutiny (Due: 15 Mar)",
    },

    {
      id: 4,
      name: "PFMS Direct Benefit Transfer",
      status: "pending",
      date: "Pending Award",
    },

    {
      id: 5,
      name: "Section 38 Possession",
      status: "pending",
      date: "Pending DBT",
    },

    {
      id: 6,
      name: "R&R Settlement",
      status: "pending",
      date: "In Survey",
    },
  ];

  const [stages, setStages] =
    useState(defaultStages);

  useEffect(() => {
    fetch(
      "/api/v1/projects/PRJ-2026-001"
    )
      .then((res) =>
        res.json()
      )
      .then((resData) => {
        const milestones =
          resData.data?.milestones;

        if (
          milestones &&
          milestones.length > 0
        ) {
          const mapped =
            milestones.map(
              (m: any) => ({
                id: m.stageNumber,
                name: m.name,
                status: m.status,
                date:
                  m.completedDate ||
                  m.targetDate ||
                  "-",
              })
            );

          setStages(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        delay: 0.1,
      }}
      className="bg-card-lifecycle p-6 border-l-4 border-graticule-teal border border-card-accent-teal rounded-lg h-full flex flex-col hover:shadow-md transition-shadow duration-300 card-shadow"
    >
      {/* ================= HEADER ================= */}

      <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-stone/20">

        <div>
          <h3 className="font-serif text-lg font-semibold text-heading-dark">
            {language === "hi"
              ? "वैधानिक जीवनचक्र"
              : "Statutory Lifecycle"}
          </h3>

          <p className="text-xs text-secondary-text font-medium mt-1">
            {language === "hi"
              ? "दिल्ली-मुंबई एक्सप्रेसवे (PRJ-2026-001)"
              : "Delhi-Mumbai Exp. (PRJ-2026-001)"}
          </p>
        </div>

        {/* Compliance */}

        <motion.div
          whileHover={{
            scale: 1.05,
          }}
          className="px-3 py-1.5 bg-badge-green-bg text-badge-green-text border border-forest-light/30 text-[10px] font-semibold rounded-md flex items-center gap-1.5 shadow-sm"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />

          {language === "hi"
            ? "अनुपालन"
            : "Compliant"}
        </motion.div>
      </div>

      {/* ================= TIMELINE ================= */}

      <div className="relative flex-1 flex flex-col">

        {stages.map(
          (stage, i) => (
            <motion.div
              initial={{
                opacity: 0,
                x: -15,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: i * 0.1,
              }}
              key={stage.id}
              className="relative flex gap-4 pb-6 flex-1"
            >

              {/* Connecting line */}

              {i !==
                stages.length - 1 && (
                <div
                  className={`
                    absolute
                    left-3.5
                    top-8
                    bottom-0
                    w-0.5
                    ${
                      stage.status ===
                      "completed"
                        ? "bg-forest-light/40"
                        : stage.status ===
                          "current"
                        ? "bg-earth-accent/40"
                        : "bg-neutral-stone/25"
                    }
                    -translate-x-1/2
                  `}
                />
              )}

              {/* Status Icon */}

              <div className="relative z-10">

                {stage.status ===
                "completed" ? (

                  <div className="p-1 bg-badge-green-bg rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-forest-light" />
                  </div>

                ) : stage.status ===
                  "current" ? (

                  <motion.div
                    animate={{
                      scale: [
                        1,
                        1.1,
                        1,
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="w-7 h-7 rounded-full border-2 border-earth-accent flex items-center justify-center bg-badge-gold-bg"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-earth-accent" />
                  </motion.div>

                ) : (

                  <Circle className="w-7 h-7 text-neutral-stone/40" />

                )}

              </div>

              {/* Stage Details */}

              <div className="flex-1 pt-0.5">

                <div
                  className={`
                    text-sm
                    font-semibold
                    ${
                      stage.status ===
                      "pending"
                        ? "text-secondary-text"
                        : stage.status ===
                          "completed"
                        ? "text-forest-light"
                        : "text-earth-accent"
                    }
                  `}
                >
                  {translateStageName(
                    stage.name,
                    language
                  )}
                </div>

                <div
                  className={`
                    text-xs
                    mt-1
                    font-medium
                    ${
                      stage.status ===
                      "current"
                        ? "text-earth-accent/80"
                        : stage.status ===
                          "completed"
                        ? "text-forest-light/70"
                        : "text-secondary-text/70"
                    }
                  `}
                >
                  {translateStageDate(
                    stage.date,
                    language
                  )}
                </div>

                {/* Optional status label */}
                {stage.status &&
                  stage.status !==
                    "completed" &&
                  false && (
                    <div className="text-[10px] mt-1 text-secondary-text/60">
                      {translateStatus(
                        stage.status,
                        language
                      )}
                    </div>
                  )}

              </div>
            </motion.div>
          )
        )}

      </div>
    </motion.div>
  );
}