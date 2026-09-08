import React, { useState, useEffect } from "react";
import { Proposal } from "../types";
import { Plus, ArrowLeft, Clock, CheckCircle2, AlertCircle, FileText, Check, Ban } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

export function Proposals({ selectedState = "All States", selectedDistrict = "All Districts" }: { selectedState?: string; selectedDistrict?: string }) {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [view, setView] = useState<"list" | "create">("list");
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProposals();
  }, [selectedState, selectedDistrict]);

  const fetchProposals = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedState && selectedState !== "All States") params.append("state", selectedState);
      if (selectedDistrict && selectedDistrict !== "All Districts") params.append("district", selectedDistrict);

      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`/api/v1/projects${query}`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.data || [];
      setProposals(list);
    } catch (err) {
      console.error("Failed to load proposals", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkflowAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${id}/workflow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bhumisetu_token") || ""}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Project ${id}: ${data.message || 'Status updated'}`);
        setTimeout(() => setActionMessage(null), 4000);
        fetchProposals();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      projectName: formData.get("projectName"),
      ministry: formData.get("ministry"),
      category: formData.get("category"),
      state: formData.get("state"),
      district: formData.get("district"),
      areaRequired: Number(formData.get("areaRequired")),
      description: "",
    };

    try {
      const res = await fetch("/api/v1/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bhumisetu_token") || ""}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setActionMessage("Proposal submitted successfully to digital scrutiny pipeline.");
        setTimeout(() => setActionMessage(null), 4000);
        await fetchProposals();
        setView("list");
      }
    } catch (err) {
      console.error("Failed to submit proposal", err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved": return <CheckCircle2 className="w-4 h-4 text-cultivated-green" />;
      case "Under Scrutiny": return <Clock className="w-4 h-4 text-tilled-earth" />;
      case "Rejected": return <AlertCircle className="w-4 h-4 text-alluvium-red" />;
      default: return <FileText className="w-4 h-4 text-graticule-teal" />;
    }
  };

  if (view === "create") {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full">
        <button 
          onClick={() => setView("list")}
          className="flex items-center gap-2 text-sm text-graticule-teal hover:text-registry-ink mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Proposals
        </button>
        
        <div className="bg-white border border-graticule-teal/30 p-8 shadow-sm">
          <div className="border-b border-graticule-teal/30 pb-4 mb-6">
            <h2 className="text-2xl font-serif font-semibold text-registry-ink">Submit New Project Proposal</h2>
            <p className="text-registry-ink/60 text-sm mt-1">Initiate a new land acquisition workflow under RFCTLARR Act, 2013.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-registry-ink mb-1">Project Name</label>
                <input 
                  required
                  name="projectName"
                  type="text" 
                  className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-survey-paper/50" 
                  placeholder="e.g., Delhi-Dehradun Expressway Corridor Phase 2" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-registry-ink mb-1">Requiring Ministry</label>
                <select name="ministry" required className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-white">
                  <option value="">Select Ministry...</option>
                  <option value="MoRTH">Ministry of Road Transport & Highways</option>
                  <option value="Ministry of Railways">Ministry of Railways</option>
                  <option value="MoHUA">Ministry of Housing & Urban Affairs</option>
                  <option value="MNRE">Ministry of New & Renewable Energy</option>
                  <option value="DPIIT">Department for Promotion of Industry and Internal Trade</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-registry-ink mb-1">Project Category</label>
                <select name="category" required className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-white">
                  <option value="">Select Category...</option>
                  <option value="Highway">Highway</option>
                  <option value="Rail">Rail</option>
                  <option value="Irrigation">Irrigation</option>
                  <option value="Industrial Corridor">Industrial Corridor</option>
                  <option value="Urban Development">Urban Development</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-registry-ink mb-1">Primary State</label>
                <select 
                  name="state" 
                  required 
                  defaultValue={selectedState !== "All States" ? selectedState : "Haryana"}
                  className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-white"
                >
                  <option value="">Select State...</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-registry-ink mb-1">Primary District</label>
                <input 
                  required
                  name="district"
                  type="text" 
                  defaultValue={selectedDistrict !== "All Districts" ? selectedDistrict : ""}
                  className="w-full px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-survey-paper/50" 
                  placeholder="District Name (e.g., Nuh, Pune)" 
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-registry-ink mb-1">Estimated Area Required (Hectares)</label>
                <input 
                  required
                  name="areaRequired"
                  type="number" 
                  step="0.01"
                  className="w-full md:w-1/2 px-4 py-2 border border-graticule-teal/30 focus:outline-none focus:border-tilled-earth focus:ring-1 focus:ring-tilled-earth bg-survey-paper/50" 
                  placeholder="0.00" 
                />
              </div>
            </div>

            <div className="pt-6 border-t border-graticule-teal/30 flex justify-end gap-4">
              <button 
                type="button"
                onClick={() => setView("list")}
                className="px-6 py-2 text-registry-ink border border-graticule-teal/30 hover:bg-graticule-teal/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-tilled-earth text-white font-medium hover:bg-tilled-earth/90 transition-colors"
              >
                Submit for Scrutiny
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 w-full">
      {actionMessage && (
        <div className="mb-6 p-4 bg-cultivated-green/10 border border-cultivated-green/30 text-cultivated-green font-medium text-sm rounded-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {actionMessage}
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink">Project Proposals</h2>
          <p className="text-registry-ink/60 mt-1">Track and manage land acquisition proposals across all ministries.</p>
        </div>
        <button 
          onClick={() => setView("create")}
          className="flex items-center gap-2 px-4 py-2 bg-registry-ink text-white font-medium hover:bg-registry-ink/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Proposal
        </button>
      </div>

      <div className="bg-white border border-graticule-teal/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-graticule-teal/10 border-b border-graticule-teal/30 text-registry-ink font-semibold">
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">Reference ID</th>
                <th className="px-6 py-4">Project Name</th>
                <th className="px-6 py-4">Ministry</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Area (Ha)</th>
                <th className="px-6 py-4">Delay Risk</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graticule-teal/20">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-graticule-teal animate-pulse">
                    Loading proposals...
                  </td>
                </tr>
              ) : proposals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-registry-ink/60">
                    No proposals found matching criteria. Create the first one to begin.
                  </td>
                </tr>
              ) : (
                proposals.map((proposal, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={proposal.id} 
                    className="hover:bg-graticule-teal/5 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-graticule-teal">{proposal.id}</td>
                    <td className="px-6 py-4 font-medium text-registry-ink max-w-[250px] truncate" title={proposal.projectName}>
                      {proposal.projectName}
                    </td>
                    <td className="px-6 py-4 text-registry-ink/80">{proposal.ministry}</td>
                    <td className="px-6 py-4 text-registry-ink/80">{proposal.district}, {proposal.state}</td>
                    <td className="px-6 py-4 font-mono text-registry-ink/80">{proposal.areaRequired.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {proposal.riskProfile ? (
                        <div className="flex items-center gap-1.5" title={proposal.riskProfile.factors?.join(", ")}>
                          <div className={`w-2 h-2 rounded-full ${
                            proposal.riskProfile.level === 'High' ? 'bg-alluvium-red' :
                            proposal.riskProfile.level === 'Medium' ? 'bg-tilled-earth' :
                            'bg-cultivated-green'
                          }`} />
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-sm border ${
                            proposal.riskProfile.level === 'High' ? 'bg-alluvium-red/10 text-alluvium-red border-alluvium-red/30' :
                            proposal.riskProfile.level === 'Medium' ? 'bg-tilled-earth/10 text-tilled-earth border-tilled-earth/30' :
                            'bg-cultivated-green/10 text-cultivated-green border-cultivated-green/30'
                          }`}>
                            {proposal.riskProfile.level} ({proposal.riskProfile.score})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-graticule-teal">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(proposal.status)}
                        <span className={`font-medium ${
                          proposal.status === 'Approved' ? 'text-cultivated-green' :
                          proposal.status === 'Under Scrutiny' ? 'text-tilled-earth' :
                          proposal.status === 'Rejected' ? 'text-alluvium-red' :
                          'text-registry-ink/70'
                        }`}>
                          {proposal.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {proposal.status === "Submitted" && (
                          <button
                            onClick={() => handleWorkflowAction(proposal.id, "SCRUTINIZE")}
                            className="px-2 py-1 text-xs bg-tilled-earth/10 text-tilled-earth hover:bg-tilled-earth hover:text-white border border-tilled-earth/30 rounded-xs transition-colors"
                            title="Scrutinize Proposal"
                          >
                            Scrutinize
                          </button>
                        )}
                        {proposal.status === "Under Scrutiny" && (
                          <>
                            <button
                              onClick={() => handleWorkflowAction(proposal.id, "APPROVE")}
                              className="px-2 py-1 text-xs bg-cultivated-green/10 text-cultivated-green hover:bg-cultivated-green hover:text-white border border-cultivated-green/30 rounded-xs transition-colors flex items-center gap-1"
                              title="Approve Proposal"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleWorkflowAction(proposal.id, "REJECT")}
                              className="px-2 py-1 text-xs bg-alluvium-red/10 text-alluvium-red hover:bg-alluvium-red hover:text-white border border-alluvium-red/30 rounded-xs transition-colors flex items-center gap-1"
                              title="Reject Proposal"
                            >
                              <Ban className="w-3 h-3" /> Reject
                            </button>
                          </>
                        )}
                        {proposal.status === "Approved" && (
                          <span className="text-[11px] font-mono text-cultivated-green bg-cultivated-green/10 px-2 py-0.5 border border-cultivated-green/20 rounded-xs">
                            Ready for Sec 11
                          </span>
                        )}
                      </div>
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
