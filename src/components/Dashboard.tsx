import { useState, useEffect } from "react";
import { KPI } from "../types";
import { motion } from "motion/react";
import { CheckCircle2, Circle, AlertCircle, TrendingUp, Zap } from "lucide-react";

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

  if (!kpis) return <div className="h-28 animate-pulse bg-gradient-to-r from-forest-light/40 via-earth-accent/30 to-forest-light/40 rounded-xl" />;

  const metrics = [
    { label: "Area Notified", value: kpis.areaNotified, bgGradient: "from-emerald-600/20 via-emerald-500/10 to-teal-600/15", textColor: "text-emerald-700", accentBg: "from-emerald-500/40 to-emerald-400/20", borderColor: "border-emerald-500/60", icon: "📍" },
    { label: "Area Acquired", value: kpis.areaAcquired, bgGradient: "from-teal-600/20 via-teal-500/10 to-cyan-600/15", textColor: "text-teal-700", accentBg: "from-teal-500/40 to-teal-400/20", borderColor: "border-teal-500/60", icon: "✓" },
    { label: "Comp. Assessed", value: kpis.compensationAssessed, bgGradient: "from-amber-600/20 via-amber-500/10 to-orange-600/15", textColor: "text-amber-700", accentBg: "from-amber-500/40 to-amber-400/20", borderColor: "border-amber-500/60", icon: "💰" },
    { label: "Comp. Paid", value: kpis.compensationDisbursed, bgGradient: "from-yellow-600/20 via-yellow-500/10 to-amber-600/15", textColor: "text-yellow-700", accentBg: "from-yellow-500/40 to-yellow-400/20", borderColor: "border-yellow-500/60", icon: "✨" },
    { label: "Families Affected", value: kpis.familiesAffected, bgGradient: "from-rose-600/20 via-red-500/10 to-pink-600/15", textColor: "text-rose-700", accentBg: "from-rose-500/40 to-rose-400/20", borderColor: "border-rose-500/60", icon: "👥" },
    { label: "R&R Settled", value: kpis.familiesRnR, bgGradient: "from-green-600/20 via-green-500/10 to-emerald-600/15", textColor: "text-green-700", accentBg: "from-green-500/40 to-green-400/20", borderColor: "border-green-500/60", icon: "🏠" },
  ];

  return (
    <div className="flex flex-nowrap overflow-x-auto border-b-4 border-gradient-to-r from-emerald-400 via-amber-300 to-rose-400 bg-gradient-to-r from-cream-soft via-amber-50/30 to-cream-soft shadow-2xl rounded-b-2xl">
      {metrics.map((metric, i) => (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
          key={metric.label}
          className={`flex-1 min-w-[160px] p-7 hover:shadow-2xl transition-all duration-300 cursor-pointer group bg-gradient-to-br ${metric.bgGradient} rounded-2xl border-2 ${metric.borderColor} relative overflow-hidden ${
            i !== metrics.length - 1 ? "border-r-4 border-neutral-300/40" : ""
          }`}
          whileHover={{ y: -8, scale: 1.02 }}
        >
          {/* Animated background orb */}
          <motion.div 
            animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-30 blur-2xl bg-gradient-to-br ${metric.accentBg}`}
          />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-widest text-registry-ink/75 group-hover:text-registry-ink transition-colors">
                {metric.label}
              </div>
              <span className="text-2xl">{metric.icon}</span>
            </div>
            
            <div className={`text-5xl font-serif font-black ${metric.textColor} group-hover:scale-130 transition-transform duration-300 origin-left drop-shadow-lg`}>
              {metric.value}
            </div>
            
            <motion.div 
              initial={{ width: 0 }}
              whileHover={{ width: "3rem" }}
              className={`h-1.5 bg-gradient-to-r ${metric.accentBg} mt-4 rounded-full shadow-lg`}
            />
            
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className={`text-xs font-semibold mt-2 ${metric.textColor}`}
            >
              <TrendingUp className="w-3 h-3 inline mr-1" /> Live
            </motion.div>
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
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 p-8 border-3 border-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 shadow-2xl rounded-2xl h-full flex flex-col mt-6 hover:shadow-3xl transition-shadow duration-300 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -left-20 -bottom-20 w-60 h-60 rounded-full bg-gradient-to-br from-pink-400/20 to-orange-400/20 blur-3xl"
      />
      
      <div className="relative z-10 flex justify-between items-center mb-10">
        <div>
          <h3 className="font-serif text-4xl font-black bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">Predictive Delay Risk</h3>
          <p className="text-sm text-registry-ink/70 font-bold mt-2">🎯 RFCTLARR statistical forecast based on objections & SLAs</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-7 relative z-10">
        {/* HIGH RISK - RED */}
        <motion.div 
          whileHover={{ y: -8, scale: 1.03, boxShadow: "0 30px 60px rgba(220, 38, 38, 0.3)" }}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="flex gap-7 items-center p-7 rounded-2xl bg-gradient-to-r from-red-500/20 via-rose-500/15 to-pink-500/10 border-3 border-red-500/60 hover:border-red-500/80 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-2xl"
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-28 h-28 shrink-0 rounded-3xl bg-gradient-to-br from-red-500/40 to-rose-600/20 border-4 border-red-600/70 flex items-center justify-center shadow-2xl"
          >
            <span className="text-red-700 font-black font-serif text-5xl drop-shadow-xl">🔴</span>
          </motion.div>
          <div className="flex-1">
            <h4 className="font-black text-registry-ink text-2xl mb-2">High Delay Risk Projects</h4>
            <p className="text-base text-registry-ink/75 font-semibold">Pune-Nashik Semi High-Speed Rail Corridor</p>
            <motion.div 
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-2 text-red-600 font-bold text-sm flex items-center gap-1"
            >
              <Zap className="w-4 h-4" /> Critical Priority
            </motion.div>
          </div>
        </motion.div>
        
        {/* MEDIUM RISK - ORANGE/AMBER */}
        <motion.div 
          whileHover={{ y: -8, scale: 1.03, boxShadow: "0 30px 60px rgba(251, 146, 60, 0.3)" }}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex gap-7 items-center p-7 rounded-2xl bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-yellow-500/10 border-3 border-orange-500/60 hover:border-orange-500/80 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-2xl"
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
            className="w-28 h-28 shrink-0 rounded-3xl bg-gradient-to-br from-orange-500/40 to-amber-600/20 border-4 border-orange-600/70 flex items-center justify-center shadow-2xl"
          >
            <span className="text-orange-700 font-black font-serif text-5xl drop-shadow-xl">🟠</span>
          </motion.div>
          <div className="flex-1">
            <h4 className="font-black text-registry-ink text-2xl mb-2">Medium Risk Projects</h4>
            <p className="text-base text-registry-ink/75 font-semibold">CBIC Node 2 & Godavari Irrigation Network</p>
            <motion.div 
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              className="mt-2 text-orange-600 font-bold text-sm flex items-center gap-1"
            >
              ⚠️ Monitor Closely
            </motion.div>
          </div>
        </motion.div>

        {/* LOW RISK - GREEN */}
        <motion.div 
          whileHover={{ y: -8, scale: 1.03, boxShadow: "0 30px 60px rgba(34, 197, 94, 0.3)" }}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="flex gap-7 items-center p-7 rounded-2xl bg-gradient-to-r from-green-500/20 via-emerald-500/15 to-teal-500/10 border-3 border-green-500/60 hover:border-green-500/80 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-2xl"
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.6 }}
            className="w-28 h-28 shrink-0 rounded-3xl bg-gradient-to-br from-green-500/40 to-emerald-600/20 border-4 border-green-600/70 flex items-center justify-center shadow-2xl"
          >
            <span className="text-green-700 font-black font-serif text-5xl drop-shadow-xl">🟢</span>
          </motion.div>
          <div className="flex-1">
            <h4 className="font-black text-registry-ink text-2xl mb-2">On Schedule / Low Risk</h4>
            <p className="text-base text-registry-ink/75 font-semibold">Delhi-Mumbai Exp. & Eastern DFC Dadri</p>
            <motion.div 
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              className="mt-2 text-green-600 font-bold text-sm flex items-center gap-1"
            >
              ✅ On Track
            </motion.div>
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30 p-8 border-3 border-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 shadow-2xl rounded-2xl h-full flex flex-col hover:shadow-3xl transition-shadow duration-300 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 blur-3xl"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute -left-20 -bottom-20 w-60 h-60 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl"
      />
      
      <div className="relative z-10 flex justify-between items-center mb-10">
        <div>
          <h3 className="font-serif text-4xl font-black bg-gradient-to-r from-cyan-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">Statutory Lifecycle Tracker</h3>
          <p className="text-sm text-registry-ink/70 font-bold mt-2">📋 Delhi-Mumbai Exp. (PRJ-2026-001)</p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.15, rotate: 5 }}
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="px-6 py-3 bg-gradient-to-r from-green-500/30 via-emerald-500/20 to-teal-500/20 text-green-800 border-3 border-green-600/70 text-xs font-black rounded-xl flex items-center gap-2 shadow-xl hover:shadow-2xl hover:border-green-600/90 transition-all duration-300 uppercase tracking-widest"
        >
          <CheckCircle2 className="w-6 h-6 animate-bounce" />
          Sec 23 Compliant
        </motion.div>
      </div>

      <div className="relative flex-1 flex flex-col">
        {stages.map((stage, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            key={stage.id} 
            className="relative flex gap-7 pb-12 flex-1 group hover:translate-x-3 transition-transform duration-300"
          >
            {/* Animated connecting line */}
            {i !== stages.length - 1 && (
              <motion.div 
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.15 + 0.3, duration: 0.5 }}
                className={`absolute left-5 top-12 bottom-0 w-2 ${
                  stage.status === "completed" ? "bg-gradient-to-b from-green-500 via-emerald-500 to-teal-500 shadow-lg shadow-green-400/50" :
                  stage.status === "current" ? "bg-gradient-to-b from-amber-500 via-orange-500 to-amber-400 shadow-lg shadow-amber-400/50 animate-pulse" :
                  "bg-gradient-to-b from-neutral-300 via-neutral-200 to-neutral-100"
                } -translate-x-1/2 rounded-full origin-top`}
              />
            )}
            
            <motion.div 
              whileHover={{ scale: 1.2 }}
              animate={stage.status === "current" ? { scale: [1, 1.15, 1] } : {}}
              transition={stage.status === "current" ? { duration: 2, repeat: Infinity } : {}}
              className="relative z-10 bg-gradient-to-br from-white to-slate-50 rounded-full shadow-lg border-3"
            >
              {stage.status === "completed" ? (
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.15 + 0.4, type: "spring", stiffness: 200 }}
                  className="p-3 bg-gradient-to-br from-green-500/40 to-emerald-600/30 rounded-full border-2 border-green-600/80 shadow-lg shadow-green-400/40"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-700 drop-shadow-lg font-bold" />
                </motion.div>
              ) : stage.status === "current" ? (
                <motion.div 
                  animate={{ scale: [0.95, 1.2, 0.95], rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-11 h-11 rounded-full border-4 border-amber-600/80 flex items-center justify-center bg-gradient-to-br from-amber-400/40 to-orange-500/30 shadow-2xl shadow-amber-400/60"
                >
                  <motion.div 
                    animate={{ scale: [0.6, 1.2, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-600 to-orange-500 shadow-lg"
                  />
                </motion.div>
              ) : (
                <div className="p-3 bg-neutral-200/40 rounded-full border-2 border-neutral-400/50">
                  <Circle className="w-8 h-8 text-neutral-400 drop-shadow" />
                </div>
              )}
            </motion.div>
            
            <div className="-mt-3 flex-1 bg-gradient-to-r from-white/40 via-white/20 to-transparent p-4 rounded-xl">
              <div className={`font-black text-lg mb-2 group-hover:scale-110 origin-left transition-transform ${
                stage.status === "pending" ? "text-neutral-400" : 
                stage.status === "completed" ? "text-green-700" : 
                "text-amber-700"
              }`}>
                <span className={`font-mono text-sm font-black mr-3 px-4 py-2 rounded-lg inline-block shadow-md ${
                  stage.status === "completed" ? "bg-green-500/40 text-green-800 border-2 border-green-600/60" : 
                  stage.status === "current" ? "bg-amber-500/40 text-amber-800 border-2 border-amber-600/60 shadow-lg shadow-amber-400/40" : 
                  "bg-neutral-300/40 text-neutral-600 border-2 border-neutral-400/40"
                }`}>
                  {stage.id.toString().padStart(2, '0')}
                </span>
                {stage.name}
              </div>
              <div className={`text-sm mt-2 font-bold flex items-center gap-2 ${
                stage.status === "current" ? "text-amber-600" : 
                stage.status === "completed" ? "text-green-600" : 
                "text-neutral-500"
              }`}>
                {stage.status === "completed" ? "✅" : stage.status === "current" ? "⏱️" : "⏳"}
                {stage.date}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}