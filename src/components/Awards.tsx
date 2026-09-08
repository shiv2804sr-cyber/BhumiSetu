import React, { useState, useEffect } from "react";
import { ClipboardCheck, Download, Eye, FileSignature, CheckCircle2, X, Send } from "lucide-react";
import { AwardRecord } from "../types";
import { useAuth } from "../context/AuthContext";

export function Awards() {
  const { user } = useAuth();
  const [awards, setAwards] = useState<AwardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/awards");
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.data || [];
      setAwards(list);
    } catch (err) {
      console.error("Failed to load awards", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/awards/${id}/publish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bhumisetu_token") || ""}`,
        },
      });
      if (res.ok) {
        setMessage(`Award ${id} published under RFCTLARR Act.`);
        setTimeout(() => setMessage(null), 4000);
        await fetchAwards();
      }
    } catch (err) {
      console.error("Publishing failed", err);
    }
  };

  const handleDraftSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      projectId: formData.get("projectId"),
      projectName: formData.get("projectName"),
      totalAmount: Number(formData.get("totalAmount")),
      beneficiariesCount: Number(formData.get("beneficiariesCount")),
      issuingAuthority: formData.get("issuingAuthority") || `District Collector, Nuh`,
    };

    try {
      const res = await fetch("/api/v1/awards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bhumisetu_token") || ""}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage("New compensation award drafted successfully under Section 23/31.");
        setTimeout(() => setMessage(null), 4000);
        setIsDraftOpen(false);
        await fetchAwards();
      }
    } catch (err) {
      console.error("Drafting failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Published': return "bg-cultivated-green/10 text-cultivated-green border-cultivated-green/30";
      case 'Under Review': return "bg-tilled-earth/10 text-tilled-earth border-tilled-earth/30";
      default: return "bg-registry-ink/10 text-registry-ink border-registry-ink/30";
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 min-h-0 overflow-y-auto">
      {message && (
        <div className="mb-6 p-4 bg-cultivated-green/10 border border-cultivated-green/30 text-cultivated-green font-medium text-sm rounded-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {message}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-tilled-earth" />
            Awards Management
          </h2>
          <p className="text-registry-ink/60 mt-1">Manage compensation and R&R awards under Section 23 & 31 of RFCTLARR Act.</p>
        </div>
        <button 
          onClick={() => setIsDraftOpen(true)}
          className="px-4 py-2 bg-registry-ink text-white rounded-sm text-sm font-medium hover:bg-registry-ink/90 transition-colors flex items-center gap-2"
        >
          <FileSignature className="w-4 h-4" />
          Draft New Award
        </button>
      </div>

      <div className="bg-white border border-graticule-teal/30 rounded-sm shadow-sm flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1 p-4">
          {loading ? (
            <div className="flex justify-center items-center h-48 text-registry-ink/60">Loading awards...</div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-graticule-teal/30 bg-graticule-teal/5">
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Award ID</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Project Name</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Issue Date</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60 text-center">Beneficiaries</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60 text-right">Total Amount (₹)</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60 text-center">Status</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graticule-teal/10">
                {awards.map((award) => (
                  <tr key={award.id} className="hover:bg-graticule-teal/5 transition-colors group">
                    <td className="p-3 text-sm font-mono text-graticule-teal">{award.id}</td>
                    <td className="p-3 text-sm font-medium text-registry-ink max-w-[280px] truncate">{award.projectName}</td>
                    <td className="p-3 text-sm text-registry-ink/80">{award.date}</td>
                    <td className="p-3 text-sm text-registry-ink/80 text-center">{award.beneficiariesCount}</td>
                    <td className="p-3 text-sm font-semibold text-registry-ink text-right">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(award.totalAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border ${getStatusStyle(award.status)}`}>
                        {award.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {award.status !== "Published" && (
                          <button 
                            onClick={() => handlePublish(award.id)}
                            className="px-2.5 py-1 text-xs bg-cultivated-green text-white hover:bg-cultivated-green/90 rounded-xs transition-colors shadow-xs"
                            title="Publish Award"
                          >
                            Publish
                          </button>
                        )}
                        <a 
                          href="/api/v1/documents/DOC-8823/download"
                          download
                          className="p-1 text-graticule-teal hover:text-registry-ink transition-colors" 
                          title="Download Award Gazette PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isDraftOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-registry-ink/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-graticule-teal/30 shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b border-graticule-teal/30 mb-4">
              <h3 className="font-serif font-semibold text-registry-ink text-lg">Draft Statutory Award (Sec 23/31)</h3>
              <button onClick={() => setIsDraftOpen(false)} className="text-graticule-teal hover:text-registry-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleDraftSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-registry-ink uppercase mb-1">Target Project</label>
                <select name="projectId" required className="w-full px-3 py-2 border border-graticule-teal/30 text-sm bg-white focus:outline-none">
                  <option value="PRJ-2026-001">Delhi-Mumbai Expressway (Phase 4)</option>
                  <option value="PRJ-2026-002">Pune-Nashik Semi High-Speed Rail</option>
                  <option value="PRJ-2026-003">Chennai-Bengaluru Industrial Corridor</option>
                </select>
                <input type="hidden" name="projectName" value="Delhi-Mumbai Expressway (Phase 4)" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-registry-ink uppercase mb-1">Total Compensation Amount (₹)</label>
                <input required name="totalAmount" type="number" step="1000" placeholder="e.g. 250000000" className="w-full px-3 py-2 border border-graticule-teal/30 text-sm bg-survey-paper/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-registry-ink uppercase mb-1">Number of Beneficiaries</label>
                <input required name="beneficiariesCount" type="number" placeholder="e.g. 120" className="w-full px-3 py-2 border border-graticule-teal/30 text-sm bg-survey-paper/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-registry-ink uppercase mb-1">Issuing Authority</label>
                <input required name="issuingAuthority" type="text" defaultValue="District Collector, Nuh" className="w-full px-3 py-2 border border-graticule-teal/30 text-sm bg-survey-paper/40 focus:outline-none" />
              </div>
              <div className="pt-4 border-t border-graticule-teal/20 flex justify-end gap-3">
                <button type="button" onClick={() => setIsDraftOpen(false)} className="px-4 py-1.5 border border-graticule-teal/30 text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-1.5 bg-registry-ink text-white text-xs font-medium">
                  {submitting ? "Drafting..." : "Create Award Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
