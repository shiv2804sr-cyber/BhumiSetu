import { useState, useEffect, useMemo } from "react";
import { KPI } from "../types";
import { motion } from "motion/react";
import { CheckCircle2, Circle } from "lucide-react";

/* =========================================================
   BHOOMISETU — UNIQUE STATE / DISTRICT DEMO DATA
   ========================================================= */

type DistrictKPI = {
  areaNotified: number;
  areaAcquired: number;
  compensationAssessed: number;
  compensationDisbursed: number;
  familiesAffected: number;
  familiesRnR: number;
};

type StateData = Record<string, Record<string, DistrictKPI>>;

/*
 * Every district has a UNIQUE seed.
 * This guarantees different numbers for every district.
 *
 * These district names exactly match the State/District
 * selector used in TopNav.
 */
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

/*
 * Create deterministic and unique KPI data.
 *
 * Rules:
 * Area Acquired < Area Notified
 * Compensation Paid < Compensation Assessed
 * R&R Settled < Families Affected
 */
function createDistrictKPI(seed: number): DistrictKPI {
  const areaNotified = 700 + seed * 37;

  const acquisitionRate =
    0.60 + ((seed % 10) * 0.025);

  const areaAcquired = Math.round(
    areaNotified * acquisitionRate
  );

  const compensationAssessed =
    65_000_000 +
    seed * 4_750_000;

  const paidRate =
    0.62 + ((seed % 9) * 0.025);

  const compensationDisbursed = Math.round(
    compensationAssessed * paidRate
  );

  const familiesAffected =
    180 +
    seed * 23;

  const rnrRate =
    0.55 + ((seed % 8) * 0.04);

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

/*
 * Build the complete mock dataset.
 */
const MOCK_KPI_DATA: StateData = Object.fromEntries(
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
   KPI CALCULATION HELPERS
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

/*
 * Exact State + District calculation.
 */
function calculateKPI(
  selectedState: string,
  selectedDistrict: string
): DistrictKPI {

  /*
   * -------------------------------------------------------
   * SPECIFIC DISTRICT
   * -------------------------------------------------------
   */
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

  /*
   * -------------------------------------------------------
   * SPECIFIC STATE — ALL DISTRICTS
   * -------------------------------------------------------
   */
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

  /*
   * -------------------------------------------------------
   * ALL STATES — ALL DISTRICTS
   * -------------------------------------------------------
   */
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

function formatRupees(value: number): string {
  if (value >= 10_000_000) {
    return `₹${(
      value / 10_000_000
    ).toFixed(1)} Cr`;
  }

  if (value >= 100_000) {
    return `₹${(
      value / 100_000
    ).toFixed(1)} L`;
  }

  return `₹${formatNumber(value)}`;
}

/* =========================================================
   KPI LEDGER
   ========================================================= */

export function KPILedger({
  selectedState = "All States",
  selectedDistrict = "All Districts",
}: {
  selectedState?: string;
  selectedDistrict?: string;
}) {

  /*
   * KPI recalculates whenever State or District changes.
   *
   * NO API CALL HERE.
   *
   * This guarantees that every demo district has data.
   */
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
      label: "Area Notified",
      value: `${formatNumber(
        kpis.areaNotified
      )} Ha`,
      bgColor: "bg-[#E8F3ED]",
      bottomBorder:
        "border-b-2 border-forest-light/40",
    },

    {
      label: "Area Acquired",
      value: `${formatNumber(
        kpis.areaAcquired
      )} Ha`,
      bgColor: "bg-[#E7F4F2]",
      bottomBorder:
        "border-b-2 border-graticule-teal/40",
    },

    {
      label: "Comp. Assessed",
      value: formatRupees(
        kpis.compensationAssessed
      ),
      bgColor: "bg-[#FFF5DE]",
      bottomBorder:
        "border-b-2 border-earth-accent/40",
    },

    {
      label: "Comp. Paid",
      value: formatRupees(
        kpis.compensationDisbursed
      ),
      bgColor: "bg-[#EAF2FA]",
      bottomBorder:
        "border-b-2 border-blue-500/40",
    },

    {
      label: "Families Affected",
      value: formatNumber(
        kpis.familiesAffected
      ),
      bgColor: "bg-[#F9EEEE]",
      bottomBorder:
        "border-b-2 border-red-400/40",
    },

    {
      label: "R&R Settled",
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

export function PredictiveRisk() {

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

      <div className="mb-6 pb-4 border-b border-neutral-stone/20">

        <h3 className="font-serif text-lg font-semibold text-heading-dark">
          Predictive Delay Risk
        </h3>

        <p className="text-xs text-secondary-text font-medium mt-1">
          RFCTLARR statistical forecast
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
              High Delay Risk
            </h4>

            <p className="text-xs text-secondary-text mt-0.5">
              Requires immediate action
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
              Medium Risk
            </h4>

            <p className="text-xs text-secondary-text mt-0.5">
              Monitor closely
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
              Low Risk / On Schedule
            </h4>

            <p className="text-xs text-secondary-text mt-0.5">
              On track
            </p>

          </div>

        </motion.div>

      </div>

    </motion.div>
  );
}

/* =========================================================
   WORKFLOW TRACKER
   ========================================================= */

export function WorkflowTracker() {

  const [stages, setStages] =
    useState([
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
        name: "Section 23 Award",
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
    ]);

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

      <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-stone/20">

        <div>

          <h3 className="font-serif text-lg font-semibold text-heading-dark">
            Statutory Lifecycle
          </h3>

          <p className="text-xs text-secondary-text font-medium mt-1">
            Delhi-Mumbai Exp. (PRJ-2026-001)
          </p>

        </div>

        <motion.div
          whileHover={{
            scale: 1.05,
          }}
          className="px-3 py-1.5 bg-badge-green-bg text-badge-green-text border border-forest-light/30 text-[10px] font-semibold rounded-md flex items-center gap-1.5 shadow-sm"
        >

          <CheckCircle2 className="w-3.5 h-3.5" />

          Compliant

        </motion.div>

      </div>

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

              {/* Status icon */}

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

              {/* Stage details */}

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
                  {stage.name}
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
                  {stage.date}
                </div>

              </div>

            </motion.div>

          )
        )}

      </div>

    </motion.div>
  );
}