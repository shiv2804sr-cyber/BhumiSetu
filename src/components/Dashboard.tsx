import { useState, useEffect } from "react";
import { KPI } from "../types";
import { motion } from "motion/react";
import { CheckCircle2, Circle } from "lucide-react";

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

  if (!kpis) return <div className="h-20 animate-pulse bg-soft-green rounded-lg" />;

  const metrics = [
    { label: "Area Notified", value: kpis.areaNotified, borderColor: "border-l-4 border-forest-light", accentBg: "bg-soft-green" },
    { label: "Area Acquired", value: kpis.areaAcquired, borderColor: "border-l-4 border-graticule-teal", accentBg: "bg-soft-teal" },
    { label: "Comp. Assessed", value: kpis.compensationAssessed, borderColor: "border-l-4 border-earth-accent", accentBg: "bg-amber-50" },
    { label: "Comp. Paid", value: kpis.compensationDisbursed, borderColor: "border-l-4 border-graticule-teal", accentBg: "bg-soft-teal" },
    { label: "Families Affected", value: kpis.familiesAffected, borderColor: "border-l-4 border-alluvium-red", accentBg: "bg-red-50" },
    { label: "R&R Settled", value: kpis.familiesRnR, borderColor: "border-l-4 border-forest-light", accentBg: "bg-soft-green" },
  ];

  return (
    <div className="flex flex-nowrap overflow-x-auto border-b border-neutral-stone bg-cream-soft shadow-sm">
      {metrics.map((metric, i) => (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          key={metric.label}
          className={`flex-1 min-w-[140px] p-5 hover:bg-survey-paper transition-all duration-300 cursor-pointer group ${metric.borderColor} ${metric.accentBg} border-neutral-stone/30`}
          whileHover={{ y: -2 }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider text-secondary-text mb-2">
            {metric.label}
          </div>
          
          <div className="text-2xl font-serif font-bold text-registry-ink">
            {metric.value}
          </div>
          
          <motion.div 
            initial={{ width: 0 }}
            whileHover={{ width: "1.5rem" }}
            className={`h-0.5 bg-forest-light mt-2 rounded-full`}
          />
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-cream-soft p-6 border border-neutral-stone shadow-sm rounded-lg h-full flex flex-col mt-6 hover:shadow-md transition-shadow duration-300"
    >
      <div className="mb-6">
        <h3 className="font-serif text-lg font-semibold text-registry-ink">Predictive Delay Risk</h3>
        <p className="text-xs text-secondary-text font-medium mt-1">RFCTLARR statistical forecast</p>
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-4">
        {/* HIGH RISK */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="flex gap-4 items-center p-4 rounded-lg bg-red-50 border-l-4 border-alluvium-red border border-neutral-stone/40 hover:shadow-sm transition-all duration-300"
        >
          <div className="w-12 h-12 shrink-0 rounded-lg bg-red-100 border border-alluvium-red/30 flex items-center justify-center">
            <span className="text-sm font-bold text-alluvium-red">{summary.high}</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-registry-ink text-sm">High Delay Risk</h4>
            <p className="text-xs text-secondary-text mt-0.5">Requires immediate action</p>
          </div>
        </motion.div>
        
        {/* MEDIUM RISK */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="flex gap-4 items-center p-4 rounded-lg bg-amber-50 border-l-4 border-earth-accent border border-neutral-stone/40 hover:shadow-sm transition-all duration-300"
        >
          <div className="w-12 h-12 shrink-0 rounded-lg bg-amber-100 border border-earth-accent/30 flex items-center justify-center">
            <span className="text-sm font-bold text-earth-accent">{summary.medium}</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-registry-ink text-sm">Medium Risk</h4>
            <p className="text-xs text-secondary-text mt-0.5">Monitor closely</p>
          </div>
        </motion.div>

        {/* LOW RISK */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="flex gap-4 items-center p-4 rounded-lg bg-soft-green border-l-4 border-forest-light border border-neutral-stone/40 hover:shadow-sm transition-all duration-300"
        >
          <div className="w-12 h-12 shrink-0 rounded-lg bg-green-100 border border-forest-light/30 flex items-center justify-center">
            <span className="text-sm font-bold text-forest-light">{summary.low}</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-registry-ink text-sm">Low Risk / On Schedule</h4>
            <p className="text-xs text-secondary-text mt-0.5">On track</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-cream-soft p-6 border border-neutral-stone shadow-sm rounded-lg h-full flex flex-col hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-serif text-lg font-semibold text-registry-ink">Statutory Lifecycle</h3>
          <p className="text-xs text-secondary-text font-medium mt-1">Delhi-Mumbai Exp. (PRJ-2026-001)</p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="px-3 py-1.5 bg-soft-green text-forest-light border border-forest-light/40 text-[10px] font-semibold rounded-md flex items-center gap-1.5 shadow-sm"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Compliant
        </motion.div>
      </div>

      <div className="relative flex-1 flex flex-col">
        {stages.map((stage, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stage.id} 
            className="relative flex gap-4 pb-6 flex-1"
          >
            {/* Connecting line */}
            {i !== stages.length - 1 && (
              <div className={`absolute left-3.5 top-8 bottom-0 w-0.5 ${
                stage.status === "completed" ? "bg-forest-light/50" :
                stage.status === "current" ? "bg-earth-accent/50" :
                "bg-neutral-stone/40"
              } -translate-x-1/2`}
              />
            )}
            
            <div className="relative z-10">
              {stage.status === "completed" ? (
                <div className="p-1 bg-soft-green rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-forest-light" />
                </div>
              ) : stage.status === "current" ? (
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-7 h-7 rounded-full border-2 border-earth-accent flex items-center justify-center bg-amber-50">
                  <div className="w-2.5 h-2.5 rounded-full bg-earth-accent"></div>
                </motion.div>
              ) : (
                <Circle className="w-7 h-7 text-neutral-stone/50" />
              )}
            </div>
            
            <div className="flex-1 pt-0.5">
              <div className={`text-sm font-semibold ${
                stage.status === "pending" ? "text-secondary-text" : 
                stage.status === "completed" ? "text-forest-light" : 
                "text-earth-accent"
              }`}>
                {stage.name}
              </div>
              <div className={`text-xs mt-1 font-medium ${
                stage.status === "current" ? "text-earth-accent" : 
                stage.status === "completed" ? "text-forest-light/70" : 
                "text-secondary-text"
              }`}>
                {stage.date}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}