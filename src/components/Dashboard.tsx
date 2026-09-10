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

  if (!kpis) return <div className="h-20 animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-lg" />;

  const metrics = [
    { label: "Area Notified", value: kpis.areaNotified, bgColor: "bg-slate-800/60", borderColor: "border-emerald-500/40", textColor: "text-emerald-400", accentColor: "from-emerald-500/60 to-emerald-400/30" },
    { label: "Area Acquired", value: kpis.areaAcquired, bgColor: "bg-slate-800/60", borderColor: "border-blue-500/40", textColor: "text-blue-400", accentColor: "from-blue-500/60 to-blue-400/30" },
    { label: "Comp. Assessed", value: kpis.compensationAssessed, bgColor: "bg-slate-800/60", borderColor: "border-amber-500/40", textColor: "text-amber-400", accentColor: "from-amber-500/60 to-amber-400/30" },
    { label: "Comp. Paid", value: kpis.compensationDisbursed, bgColor: "bg-slate-800/60", borderColor: "border-orange-500/40", textColor: "text-orange-400", accentColor: "from-orange-500/60 to-orange-400/30" },
    { label: "Families Affected", value: kpis.familiesAffected, bgColor: "bg-slate-800/60", borderColor: "border-red-500/40", textColor: "text-red-400", accentColor: "from-red-500/60 to-red-400/30" },
    { label: "R&R Settled", value: kpis.familiesRnR, bgColor: "bg-slate-800/60", borderColor: "border-green-500/40", textColor: "text-green-400", accentColor: "from-green-500/60 to-green-400/30" },
  ];

  return (
    <div className="flex flex-nowrap overflow-x-auto border-b border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg">
      {metrics.map((metric, i) => (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          key={metric.label}
          className={`flex-1 min-w-[140px] p-5 hover:bg-slate-700/40 transition-all duration-300 cursor-pointer group border-r border-slate-700/30 ${metric.bgColor} backdrop-blur-sm`}
          whileHover={{ y: -2 }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            {metric.label}
          </div>
          
          <div className={`text-2xl font-serif font-bold ${metric.textColor}`}>
            {metric.value}
          </div>
          
          <motion.div 
            initial={{ width: 0 }}
            whileHover={{ width: "1.5rem" }}
            className={`h-0.5 bg-gradient-to-r ${metric.accentColor} mt-2 rounded-full`}
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
      className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 border border-slate-700/50 shadow-lg rounded-lg h-full flex flex-col mt-6 hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm"
    >
      <div className="mb-6">
        <h3 className="font-serif text-xl font-semibold text-slate-100">Predictive Delay Risk</h3>
        <p className="text-xs text-slate-400 font-medium mt-1">RFCTLARR statistical forecast</p>
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-4">
        {/* HIGH RISK */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="flex gap-4 items-center p-4 rounded-lg bg-red-900/20 border border-red-600/40 hover:border-red-600/60 hover:bg-red-900/30 transition-all duration-300 backdrop-blur-sm"
        >
          <div className="w-12 h-12 shrink-0 rounded-lg bg-red-900/40 border border-red-600/50 flex items-center justify-center">
            <span className="text-sm font-bold text-red-400">{summary.high}</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-red-300 text-sm">High Delay Risk</h4>
            <p className="text-xs text-red-400/80 mt-0.5">Requires immediate action</p>
          </div>
        </motion.div>
        
        {/* MEDIUM RISK */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="flex gap-4 items-center p-4 rounded-lg bg-amber-900/20 border border-amber-600/40 hover:border-amber-600/60 hover:bg-amber-900/30 transition-all duration-300 backdrop-blur-sm"
        >
          <div className="w-12 h-12 shrink-0 rounded-lg bg-amber-900/40 border border-amber-600/50 flex items-center justify-center">
            <span className="text-sm font-bold text-amber-400">{summary.medium}</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-300 text-sm">Medium Risk</h4>
            <p className="text-xs text-amber-400/80 mt-0.5">Monitor closely</p>
          </div>
        </motion.div>

        {/* LOW RISK */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="flex gap-4 items-center p-4 rounded-lg bg-green-900/20 border border-green-600/40 hover:border-green-600/60 hover:bg-green-900/30 transition-all duration-300 backdrop-blur-sm"
        >
          <div className="w-12 h-12 shrink-0 rounded-lg bg-green-900/40 border border-green-600/50 flex items-center justify-center">
            <span className="text-sm font-bold text-green-400">{summary.low}</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-300 text-sm">Low Risk / On Schedule</h4>
            <p className="text-xs text-green-400/80 mt-0.5">On track</p>
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
      className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 border border-slate-700/50 shadow-lg rounded-lg h-full flex flex-col hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-serif text-xl font-semibold text-slate-100">Statutory Lifecycle</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Delhi-Mumbai Exp. (PRJ-2026-001)</p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="px-3 py-1.5 bg-green-900/30 text-green-400 border border-green-600/50 text-[10px] font-semibold rounded-md flex items-center gap-1.5 shadow-sm backdrop-blur-sm"
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
                stage.status === "completed" ? "bg-green-600/50" :
                stage.status === "current" ? "bg-amber-600/50" :
                "bg-slate-600/30"
              } -translate-x-1/2`}
              />
            )}
            
            <div className="relative z-10">
              {stage.status === "completed" ? (
                <div className="p-1 bg-green-900/30 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
              ) : stage.status === "current" ? (
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-7 h-7 rounded-full border-2 border-amber-500 flex items-center justify-center bg-amber-900/30">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                </motion.div>
              ) : (
                <Circle className="w-7 h-7 text-slate-600" />
              )}
            </div>
            
            <div className="flex-1 pt-0.5">
              <div className={`text-sm font-semibold ${
                stage.status === "pending" ? "text-slate-500" : 
                stage.status === "completed" ? "text-green-400" : 
                "text-amber-400"
              }`}>
                {stage.name}
              </div>
              <div className={`text-xs mt-1 ${
                stage.status === "current" ? "text-amber-400/80 font-medium" : 
                stage.status === "completed" ? "text-green-400/70" : 
                "text-slate-500"
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