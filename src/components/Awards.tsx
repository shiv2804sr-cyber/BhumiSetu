import { useState, useEffect } from "react";
import { ClipboardCheck, Download, Eye, FileSignature } from "lucide-react";
import { AwardRecord } from "../types";

export function Awards() {
  const [awards, setAwards] = useState<AwardRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/awards")
      .then(res => res.json())
      .then(data => {
        setAwards(data);
        setLoading(false);
      });
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Published': return "bg-cultivated-green/10 text-cultivated-green border-cultivated-green/30";
      case 'Under Review': return "bg-tilled-earth/10 text-tilled-earth border-tilled-earth/30";
      default: return "bg-registry-ink/10 text-registry-ink border-registry-ink/30";
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 min-h-0 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-tilled-earth" />
            Awards Management
          </h2>
          <p className="text-registry-ink/60 mt-1">Manage compensation and R&R awards under Section 23 & 31.</p>
        </div>
        <button className="px-4 py-2 bg-registry-ink text-white rounded-sm text-sm font-medium hover:bg-registry-ink/90 transition-colors flex items-center gap-2">
          <FileSignature className="w-4 h-4" />
          Draft New Award
        </button>
      </div>

      <div className="bg-white border border-graticule-teal/30 rounded-sm shadow-sm flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1 p-4">
          {loading ? (
            <div className="flex justify-center items-center h-48 text-registry-ink/60">Loading...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-graticule-teal/30 bg-graticule-teal/5">
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Award ID</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Project Name</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Issue Date</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Beneficiaries</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60 text-right">Total Amount (₹)</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60 text-center">Status</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graticule-teal/10">
                {awards.map((award) => (
                  <tr key={award.id} className="hover:bg-graticule-teal/5 transition-colors group">
                    <td className="p-3 text-sm font-mono text-graticule-teal">{award.id}</td>
                    <td className="p-3 text-sm font-medium text-registry-ink">{award.projectName}</td>
                    <td className="p-3 text-sm text-registry-ink/80">{award.date}</td>
                    <td className="p-3 text-sm text-registry-ink/80 text-center">{award.beneficiariesCount}</td>
                    <td className="p-3 text-sm font-medium text-registry-ink text-right">
                      {new Intl.NumberFormat('en-IN').format(award.totalAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border ${getStatusStyle(award.status)}`}>
                        {award.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-graticule-teal hover:text-registry-ink transition-colors" title="View Award">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-graticule-teal hover:text-registry-ink transition-colors" title="Download PDF">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
