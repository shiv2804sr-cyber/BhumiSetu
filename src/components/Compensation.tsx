import { useState, useEffect } from "react";
import { CompensationRecord } from "../types";
import { HandCoins, CheckCircle2, Clock, AlertCircle, ArrowUpRight, Check } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

export function Compensation({ selectedState = "All States", selectedDistrict = "All Districts" }: { selectedState?: string; selectedDistrict?: string }) {
  const { user } = useAuth();
  const [records, setRecords] = useState<CompensationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [disbursingId, setDisbursingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCompensation();
  }, [selectedState, selectedDistrict]);

  const fetchCompensation = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedState && selectedState !== "All States") params.append("state", selectedState);
      if (selectedDistrict && selectedDistrict !== "All Districts") params.append("district", selectedDistrict);

      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`/api/v1/compensation${query}`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.data || [];
      setRecords(list);
    } catch (err) {
      console.error("Failed to load compensation records", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisburse = async (id: string) => {
    setDisbursingId(id);
    try {
      const res = await fetch(`/api/v1/compensation/${id}/disburse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bhumisetu_token") || ""}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Direct Benefit Transfer (DBT) executed successfully.");
        setTimeout(() => setMessage(null), 5000);
        await fetchCompensation();
      }
    } catch (err) {
      console.error("Disbursement failed", err);
    } finally {
      setDisbursingId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Disbursed": return <CheckCircle2 className="w-4 h-4 text-cultivated-green" />;
      case "Processing DBT": return <Clock className="w-4 h-4 text-tilled-earth" />;
      default: return <AlertCircle className="w-4 h-4 text-alluvium-red" />;
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
            <HandCoins className="w-8 h-8 text-tilled-earth" />
            Compensation & Disbursement
          </h2>
          <p className="text-registry-ink/60 mt-1">Track statutory assessed compensation including 100% solatium margin.</p>
        </div>
      </div>

      <div className="bg-white border border-graticule-teal/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-graticule-teal/10 border-b border-graticule-teal/30 text-registry-ink font-semibold">
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">Ref ID</th>
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">ULPIN</th>
                <th className="px-6 py-4">Beneficiary</th>
                <th className="px-6 py-4 text-right">Market Value</th>
                <th className="px-6 py-4 text-right">Solatium (100%)</th>
                <th className="px-6 py-4 text-right">Total Assessed</th>
                <th className="px-6 py-4 text-right">Disbursed (PFMS)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graticule-teal/20">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-graticule-teal animate-pulse">
                    Loading compensation records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-registry-ink/60">
                    No compensation records found.
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
                    <td className="px-6 py-4 font-medium text-registry-ink">{record.ownerName}</td>
                    <td className="px-6 py-4 text-right text-registry-ink/80">{formatCurrency(record.marketValue)}</td>
                    <td className="px-6 py-4 text-right text-tilled-earth font-medium">+{formatCurrency(record.solatium)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-registry-ink">{formatCurrency(record.totalAssessed)}</td>
                    <td className="px-6 py-4 text-right font-medium text-cultivated-green">{formatCurrency(record.amountDisbursed)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span className={`font-medium ${
                          record.status === 'Disbursed' ? 'text-cultivated-green' :
                          record.status === 'Processing DBT' ? 'text-tilled-earth' :
                          'text-alluvium-red'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {record.status !== "Disbursed" ? (
                        <button
                          onClick={() => handleDisburse(record.id)}
                          disabled={disbursingId === record.id}
                          className="px-3 py-1 bg-cultivated-green text-white hover:bg-cultivated-green/90 text-xs font-medium rounded-xs transition-colors flex items-center gap-1 ml-auto shadow-xs disabled:opacity-50"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          {disbursingId === record.id ? "Processing..." : "Disburse DBT"}
                        </button>
                      ) : (
                        <span className="text-xs text-cultivated-green font-mono flex items-center justify-end gap-1">
                          <Check className="w-3.5 h-3.5" /> Settled
                        </span>
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
