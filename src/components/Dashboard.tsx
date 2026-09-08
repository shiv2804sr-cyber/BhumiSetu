import { useState, useEffect } from "react";
import { KPI } from "../types";
import { motion } from "motion/react";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

export function KPILedger({ selectedState = "All States", selectedDistrict = "All Districts" }: { selectedState?: string; selectedDistrict?: string }) {
  const [kpis, setKpis] = useState<KPI | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedState && selectedState !== "All States") params.append("state", selectedState);
    if (selectedDistrict && selectedDistrict !== "All Districts") params.append("district", selectedDistrict);

    const query = params.toString() ? `?${params.toString()}` : "";
    fetch(`/api/v1/dashboard/kpis${query}`)
      .then((res) => res.json())
      .then((data) => setKpis(data))
      .catch((err) => console.error("Failed to load KPIs", err));
  }, [selectedState, selectedDistrict]);

  if (!kpis) return <div className="h-24 animate-pulse bg-graticule-teal/10" />;

  const metrics = [
    { label: "Area Notified", value: kpis.areaNotified },
    { label: "Area Acquired", value: kpis.areaAcquired },
    { label: "Comp. Assessed", value: kpis.compensationAssessed },
    { label: "Comp. Paid", value: kpis.compensationDisbursed },
    { label: "Families Affected", value: kpis.familiesAffected },
    { label: "R&R Settled", value: kpis.familiesRnR },
  ];

  return (
    <div className="flex flex-nowrap overflow-x-auto border-b border-graticule-teal/30 bg-white">
      {metrics.map((metric, i) => (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          key={metric.label}
          className={`flex-1 min-w-[160px] p-4 ${
            i !== metrics.length - 1 ? "border-r border-graticule-teal/30" : ""
          }`}
        >
          <div className="text-xs text-registry-ink/60 font-medium uppercase tracking-wider mb-1">
            {metric.label}
          </div>
          <div className="text-2xl font-serif font-semibold text-registry-ink">
            {metric.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function PredictiveRisk() {
  const [summary, setSummary] = useState<{ high: number; medium: number; low: number }>({
    high: 1,
    medium: 2,
    low: 2,
  });

  useEffect(() => {
    fetch("/api/v1/dashboard/summary")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.data?.riskDistribution) {
          setSummary(resData.data.riskDistribution);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white p-6 border border-graticule-teal/30 h-full flex flex-col mt-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-serif text-lg font-semibold text-registry-ink">Predictive Delay Risk</h3>
          <p className="text-sm text-registry-ink/60">RFCTLARR statistical forecast based on objections & SLAs</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-6">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 shrink-0 rounded-full bg-alluvium-red/10 border-4 border-alluvium-red/20 flex items-center justify-center">
            <span className="text-alluvium-red font-bold font-serif text-xl">{summary.high}</span>
          </div>
          <div>
            <h4 className="font-medium text-registry-ink">High Delay Risk Projects</h4>
            <p className="text-xs text-registry-ink/60 mt-1">Pune-Nashik Semi High-Speed Rail Corridor</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 shrink-0 rounded-full bg-tilled-earth/10 border-4 border-tilled-earth/20 flex items-center justify-center">
            <span className="text-tilled-earth font-bold font-serif text-xl">{summary.medium}</span>
          </div>
          <div>
            <h4 className="font-medium text-registry-ink">Medium Risk Projects</h4>
            <p className="text-xs text-registry-ink/60 mt-1">CBIC Node 2 & Godavari Irrigation Network</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 shrink-0 rounded-full bg-cultivated-green/10 border-4 border-cultivated-green/20 flex items-center justify-center">
            <span className="text-cultivated-green font-bold font-serif text-xl">{summary.low}</span>
          </div>
          <div>
            <h4 className="font-medium text-registry-ink">On Schedule / Low Risk</h4>
            <p className="text-xs text-registry-ink/60 mt-1">Delhi-Mumbai Exp. & Eastern DFC Dadri</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkflowTracker() {
  const [stages, setStages] = useState([
    { id: 1, name: "Section 11 Notification", status: "completed", date: "12 Oct 2025" },
    { id: 2, name: "Section 19 Declaration", status: "completed", date: "05 Nov 2025" },
    { id: 3, name: "Section 23 Award", status: "current", date: "In Scrutiny (Due: 15 Mar)" },
    { id: 4, name: "PFMS Direct Benefit Transfer", status: "pending", date: "Pending Award" },
    { id: 5, name: "Section 38 Possession", status: "pending", date: "Pending DBT" },
    { id: 6, name: "R&R Settlement", status: "pending", date: "In Survey" },
  ]);

  useEffect(() => {
    fetch("/api/v1/projects/PRJ-2026-001")
      .then((res) => res.json())
      .then((resData) => {
        const milestones = resData.data?.milestones;
        if (milestones && milestones.length > 0) {
          const mapped = milestones.map((m: any) => ({
            id: m.stageNumber,
            name: m.name,
            status: m.status,
            date: m.completedDate || m.targetDate || "-",
          }));
          setStages(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white p-6 border border-graticule-teal/30 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-serif text-lg font-semibold text-registry-ink">Statutory Lifecycle Tracker</h3>
          <p className="text-sm text-registry-ink/60">Delhi-Mumbai Exp. (PRJ-2026-001)</p>
        </div>
        <div className="px-3 py-1 bg-cultivated-green/10 text-cultivated-green border border-cultivated-green/30 text-xs font-medium rounded-sm flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Sec 23 Compliant
        </div>
      </div>

      <div className="relative flex-1 flex flex-col">
        {stages.map((stage, i) => (
          <div key={stage.id} className="relative flex gap-4 pb-6 flex-1">
            {/* Connecting line */}
            {i !== stages.length - 1 && (
              <div className="absolute left-3 top-6 bottom-0 w-px bg-graticule-teal/30 -translate-x-1/2"></div>
            )}
            
            <div className="relative z-10 bg-white">
              {stage.status === "completed" ? (
                <CheckCircle2 className="w-6 h-6 text-cultivated-green" />
              ) : stage.status === "current" ? (
                <div className="w-6 h-6 rounded-full border-2 border-tilled-earth flex items-center justify-center bg-white">
                  <div className="w-2.5 h-2.5 rounded-full bg-tilled-earth"></div>
                </div>
              ) : (
                <Circle className="w-6 h-6 text-graticule-teal/40" />
              )}
            </div>
            
            <div className="-mt-1">
              <div className={`font-medium ${stage.status === "pending" ? "text-registry-ink/50" : "text-registry-ink"}`}>
                <span className="font-mono text-xs text-graticule-teal mr-2">{stage.id.toString().padStart(2, '0')}</span>
                {stage.name}
              </div>
              <div className={`text-xs mt-0.5 ${stage.status === "current" ? "text-alluvium-red font-medium" : "text-registry-ink/60"}`}>
                {stage.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
