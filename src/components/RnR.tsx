import { useState, useEffect } from "react";
import { RnRRecord } from "../types";
import { Home, CheckCircle2, Clock, Check, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

export function RnR({ selectedState = "All States", selectedDistrict = "All Districts" }: { selectedState?: string; selectedDistrict?: string }) {
  const { user } = useAuth();
  const [records, setRecords] = useState<RnRRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRnR();
  }, [selectedState, selectedDistrict]);

  const fetchRnR = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedState && selectedState !== "All States") params.append("state", selectedState);
      if (selectedDistrict && selectedDistrict !== "All Districts") params.append("district", selectedDistrict);

      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`/api/v1/rnr${query}`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.data || [];
      setRecords(list);
    } catch (err) {
      console.error("Failed to load R&R records", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/rnr/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bhumisetu_token") || ""}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setMessage(`R&R case ${id} marked as ${newStatus}`);
        setTimeout(() => setMessage(null), 4000);
        await fetchRnR();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Settled": return <CheckCircle2 className="w-4 h-4 text-cultivated-green" />;
      default: return <Clock className="w-4 h-4 text-tilled-earth" />;
    }
  };

  return (
    <div className="p-8 w-full">
      {message && (
        <div className="mb-6 p-4 bg-cultivated-green/10 border border-cultivated-green/30 text-cultivated-green font-medium text-sm rounded-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {message}
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink flex items-center gap-3">
            <Home className="w-8 h-8 text-tilled-earth" />
            Rehabilitation & Resettlement (R&R)
          </h2>
          <p className="text-registry-ink/60 mt-1">Manage affected families register and track statutory entitlements under RFCTLARR Act.</p>
        </div>
      </div>

      <div className="bg-white border border-graticule-teal/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-graticule-teal/10 border-b border-graticule-teal/30 text-registry-ink font-semibold">
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">Ref ID</th>
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">ULPIN</th>
                <th className="px-6 py-4">Family Head</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Displacement</th>
                <th className="px-6 py-4">Entitlements</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graticule-teal/20">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-graticule-teal animate-pulse">
                    Loading R&R records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-registry-ink/60">
                    No records found matching criteria.
                  </td>
                </tr>
              ) : (
                records.map((record, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={record.id} 
                    className="hover:bg-graticule-teal/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-graticule-teal">{record.id}</td>
                    <td className="px-6 py-4 font-mono text-xs text-registry-ink/80">{record.ulpin}</td>
                    <td className="px-6 py-4 font-medium text-registry-ink">{record.familyHead}</td>
                    <td className="px-6 py-4 text-registry-ink/80">{record.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-sm border ${
                        record.displacementStatus === 'Displaced' 
                          ? 'bg-alluvium-red/10 text-alluvium-red border-alluvium-red/30' 
                          : 'bg-survey-paper text-registry-ink border-graticule-teal/30'
                      }`}>
                        {record.displacementStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {record.entitlements.housing && <span className="px-2 py-1 text-xs bg-graticule-teal/10 text-graticule-teal border border-graticule-teal/20 rounded-sm">Housing</span>}
                        {record.entitlements.employment && <span className="px-2 py-1 text-xs bg-graticule-teal/10 text-graticule-teal border border-graticule-teal/20 rounded-sm">Employment</span>}
                        {record.entitlements.annuity && <span className="px-2 py-1 text-xs bg-graticule-teal/10 text-graticule-teal border border-graticule-teal/20 rounded-sm">Annuity</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.overallStatus)}
                        <span className={`font-medium ${
                          record.overallStatus === 'Settled' ? 'text-cultivated-green' :
                          'text-tilled-earth'
                        }`}>
                          {record.overallStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {record.overallStatus !== "Settled" ? (
                        <button
                          onClick={() => handleUpdateStatus(record.id, "Settled")}
                          className="px-2.5 py-1 text-xs bg-cultivated-green/10 text-cultivated-green hover:bg-cultivated-green hover:text-white border border-cultivated-green/30 rounded-xs transition-colors inline-flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Settle Claim
                        </button>
                      ) : (
                        <span className="text-xs text-cultivated-green font-mono">Completed</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
