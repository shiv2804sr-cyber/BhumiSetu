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

  if (!kpis) return <div className="h-24 animate-pulse bg-gradient-to-r from-forest-light/30 via-earth-accent/20 to-forest-light/30 rounded-lg" />;

  const metrics = [
    { label: "Area Notified", value: kpis.areaNotified, bgColor: "from-forest-dark/8 to-forest-light/8", textColor: "text-forest-dark", accentBg: "from-forest-light/25 to-forest-light/10" },
    { label: "Area Acquired", value: kpis.areaAcquired, bgColor: "from-cultivated-green/8 to-forest-light/8", textColor: "text-forest-light", accentBg: "from-forest-light/25 to-cultivated-green/10" },
    { label: "Comp. Assessed", value: kpis.compensationAssessed, bgColor: "from-earth-accent/10 to-amber-gold/8", textColor: "text-earth-accent", accentBg: "from-earth-accent/30 to-amber-gold/15" },
    { label: "Comp. Paid", value: kpis.compensationDisbursed, bgColor: "from-amber-gold/10 to-tilled-earth/8", textColor: "text-earth-accent", accentBg: "from-amber-gold/30 to-tilled-earth/15" },
    { label: "Families Affected", value: kpis.familiesAffected, bgColor: "from-alluvium-red/8 to-tilled-earth/8", textColor: "text-alluvium-red", accentBg: "from-alluvium-red/20 to-alluvium-red/10" },
    { label: "R&R Settled", value: kpis.familiesRnR, bgColor: "from-forest-light/10 to-cultivated-green/8", textColor: "text-forest-light", accentBg: "from-forest-light/30 to-cultivated-green/15" },
  ];

  return (
    <div className="flex flex-nowrap overflow-x-auto border-b-2 border-neutral-stone/60 bg-gradient-to-r from-cream-soft via-survey-paper to-cream-soft shadow-lg rounded-b-lg">
      {metrics.map((metric, i) => (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
          key={metric.label}
          className={`flex-1 min-w-[160px] p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br ${metric.bgColor} rounded-lg ${
            i !== metrics.length - 1 ? "border-r-2 border-neutral-stone/30" : ""
          }`}
          whileHover={{ y: -4 }}
        >
          <div className="text-xs font-bold uppercase tracking-widest text-registry-ink/70 mb-3 group-hover:text-forest-dark transition-colors">
            {metric.label}
          </div>
          <div className={`text-4xl font-serif font-black ${metric.textColor} group-hover:scale-125 transition-transform duration-300 origin-left`}>
            {metric.value}
          </div>
          <motion.div 
            initial={{ width: 0 }}
            whileHover={{ width: "2rem" }}
            className={`h-1 bg-gradient-to-r ${metric.accentBg} mt-3 rounded-full`}
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
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-cream-soft via-white to-neutral-stone/20 p-8 border-2 border-neutral-stone/60 shadow-xl rounded-xl h-full flex flex-col mt-6 hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="font-serif text-3xl font-black text-forest-dark">Predictive Delay Risk</h3>
          <p className="text-sm text-registry-ink/70 font-semibold mt-2">RFCTLARR statistical forecast based on objections & SLAs</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-6">
        <motion.div 
          whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(166, 56, 40, 0.2)" }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-6 items-center p-6 rounded-2xl bg-gradient-to-r from-alluvium-red/15 via-alluvium-red/8 to-alluvium-red/5 border-2 border-alluvium-red/40 hover:border-alluvium-red/60 transition-all duration-300 group cursor-pointer"
        >
          <motion.div 
            className="w-24 h-24 shrink-0 rounded-2xl bg-gradient-to-br from-alluvium-red/30 to-alluvium-red/10 border-3 border-alluvium-red/60 flex items-center justify-center shadow-xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <span className="text-alluvium-red font-black font-serif text-4xl drop-shadow-lg">{summary.high}</span>
          </motion.div>
          <div className="flex-1">
            <h4 className="font-bold text-registry-ink text-xl mb-1">High Delay Risk Projects</h4>
            <p className="text-sm text-registry-ink/70 font-semibold">Pune-Nashik Semi High-Speed Rail Corridor</p>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(201, 145, 92, 0.2)" }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-6 items-center p-6 rounded-2xl bg-gradient-to-r from-earth-accent/15 via-amber-gold/8 to-earth-accent/5 border-2 border-earth-accent/40 hover:border-earth-accent/60 transition-all duration-300 group cursor-pointer"
        >
          <motion.div 
            className="w-24 h-24 shrink-0 rounded-2xl bg-gradient-to-br from-earth-accent/35 to-amber-gold/15 border-3 border-earth-accent/60 flex items-center justify-center shadow-xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <span className="text-earth-accent font-black font-serif text-4xl drop-shadow-lg">{summary.medium}</span>
          </motion.div>
          <div className="flex-1">
            <h4 className="font-bold text-registry-ink text-xl mb-1">Medium Risk Projects</h4>
            <p className="text-sm text-registry-ink/70 font-semibold">CBIC Node 2 & Godavari Irrigation Network</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(45, 106, 79, 0.2)" }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-6 items-center p-6 rounded-2xl bg-gradient-to-r from-forest-light/15 via-cultivated-green/8 to-forest-light/5 border-2 border-forest-light/40 hover:border-forest-light/60 transition-all duration-300 group cursor-pointer"
        >
          <motion.div 
            className="w-24 h-24 shrink-0 rounded-2xl bg-gradient-to-br from-forest-light/35 to-cultivated-green/15 border-3 border-forest-light/60 flex items-center justify-center shadow-xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <span className="text-forest-light font-black font-serif text-4xl drop-shadow-lg">{summary.low}</span>
          </motion.div>
          <div className="flex-1">
            <h4 className="font-bold text-registry-ink text-xl mb-1">On Schedule / Low Risk</h4>
            <p className="text-sm text-registry-ink/70 font-semibold">Delhi-Mumbai Exp. & Eastern DFC Dadri</p>
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
      transition={{ duration: 0.6, delay: 0.1 }}
      className="bg-gradient-to-br from-cream-soft via-white to-neutral-stone/20 p-8 border-2 border-neutral-stone/60 shadow-xl rounded-xl h-full flex flex-col hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="font-serif text-3xl font-black text-forest-dark">Statutory Lifecycle Tracker</h3>
          <p className="text-sm text-registry-ink/70 font-semibold mt-2">Delhi-Mumbai Exp. (PRJ-2026-001)</p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.08, rotate: 2 }}
          className="px-5 py-3 bg-gradient-to-r from-forest-light/30 to-cultivated-green/20 text-forest-dark border-2 border-forest-light/60 text-xs font-black rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl hover:border-forest-light/80 transition-all duration-300 uppercase tracking-widest"
        >
          <CheckCircle2 className="w-5 h-5" />
          Sec 23 Compliant
        </motion.div>
      </div>

      <div className="relative flex-1 flex flex-col">
        {stages.map((stage, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            key={stage.id} 
            className="relative flex gap-6 pb-10 flex-1 group hover:translate-x-2 transition-transform duration-300"
          >
            {/* Connecting line with gradient animation */}
            {i !== stages.length - 1 && (
              <motion.div 
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.12 + 0.2, duration: 0.4 }}
                className="absolute left-4 top-11 bottom-0 w-1.5 bg-gradient-to-b from-forest-light/70 via-neutral-stone/50 to-neutral-stone/30 -translate-x-1/2 rounded-full origin-top"
              />
            )}
            
            <motion.div 
              whileHover={{ scale: 1.15 }}
              className="relative z-10 bg-gradient-to-br from-cream-soft to-white rounded-full shadow-lg border border-neutral-stone/30"
            >
              {stage.status === "completed" ? (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.12 + 0.3, type: "spring" }}
                  className="p-2 bg-gradient-to-br from-forest-light/25 to-cultivated-green/15 rounded-full"
                >
                  <CheckCircle2 className="w-8 h-8 text-forest-light drop-shadow-lg font-bold" />
                </motion.div>
              ) : stage.status === "current" ? (
                <motion.div 
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-9 h-9 rounded-full border-3 border-earth-accent flex items-center justify-center bg-gradient-to-br from-amber-gold/35 to-earth-accent/20 shadow-lg"
                >
                  <motion.div 
                    animate={{ scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-4 h-4 rounded-full bg-gradient-to-br from-earth-accent to-amber-gold"
                  />
                </motion.div>
              ) : (
                <div className="p-2 bg-neutral-stone/15 rounded-full">
                  <Circle className="w-8 h-8 text-neutral-stone/40 drop-shadow" />
                </div>
              )}
            </motion.div>
            
            <div className="-mt-2 flex-1">
              <div className={`font-bold text-lg mb-1 group-hover:text-forest-dark transition-colors ${
                stage.status === "pending" ? "text-registry-ink/40" : 
                stage.status === "completed" ? "text-forest-dark" : 
                "text-registry-ink"
              }`}>
                <span className={`font-mono text-sm font-black mr-3 px-3 py-1.5 rounded-md inline-block ${
                  stage.status === "completed" ? "bg-forest-light/25 text-forest-light shadow-sm" : 
                  stage.status === "current" ? "bg-earth-accent/25 text-earth-accent shadow-sm" : 
                  "bg-neutral-stone/15 text-neutral-stone/60"
                }`}>
                  {stage.id.toString().padStart(2, '0')}
                </span>
                {stage.name}
              </div>
              <div className={`text-sm mt-2 font-semibold ${
                stage.status === "current" ? "text-alluvium-red" : 
                stage.status === "completed" ? "text-forest-light/80" : 
                "text-registry-ink/45"
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