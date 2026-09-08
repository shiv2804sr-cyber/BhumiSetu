import { useState, useEffect } from "react";
import { ShieldAlert, Search, Filter, MessageSquare, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { GrievanceRecord } from "../types";
import { useAuth } from "../context/AuthContext";

export function Grievances() {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState<GrievanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchGrievances();
  }, [searchQuery]);

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
      const res = await fetch(`/api/v1/grievances${query}`);
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.data || [];
      setGrievances(list);
    } catch (err) {
      console.error("Failed to load grievances", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/grievances/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bhumisetu_token") || ""}`,
        },
        body: JSON.stringify({ 
          status: newStatus,
          resolutionNotes: newStatus === "Resolved" ? "Grievance inquiry conducted and redressed by Revenue Authority." : undefined,
        }),
      });
      if (res.ok) {
        setMessage(`Grievance status updated to ${newStatus}`);
        setTimeout(() => setMessage(null), 4000);
        await fetchGrievances();
      }
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High': return "text-alluvium-red bg-alluvium-red/10 border-alluvium-red/30";
      case 'Medium': return "text-tilled-earth bg-tilled-earth/10 border-tilled-earth/30";
      case 'Low': return "text-graticule-teal bg-graticule-teal/10 border-graticule-teal/30";
      default: return "";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Open': return "text-alluvium-red bg-alluvium-red/10 border-alluvium-red/30";
      case 'In Progress': return "text-tilled-earth bg-tilled-earth/10 border-tilled-earth/30";
      case 'Resolved': return "text-cultivated-green bg-cultivated-green/10 border-cultivated-green/30";
      default: return "";
    }
  };

  const filtered = grievances.filter((g) => {
    if (selectedStatus !== "All" && g.status !== selectedStatus) return false;
    return true;
  });

  const openCount = grievances.filter(g => g.status === 'Open').length;
  const inProgressCount = grievances.filter(g => g.status === 'In Progress').length;
  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;

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
            <ShieldAlert className="w-8 h-8 text-alluvium-red" />
            Grievance Redressal
          </h2>
          <p className="text-registry-ink/60 mt-1">Track and resolve complaints from affected families and stakeholders.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-registry-ink/40" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Tracking ID, name..." 
              className="pl-9 pr-4 py-2 border border-graticule-teal/30 rounded-sm bg-white text-sm focus:outline-none focus:border-graticule-teal w-64"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-graticule-teal/30 rounded-sm text-sm text-registry-ink focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 border border-graticule-teal/30 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-alluvium-red/10 rounded-full flex items-center justify-center text-alluvium-red">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-registry-ink/60 uppercase tracking-wide font-semibold">Open</div>
            <div className="text-2xl font-serif text-registry-ink">{openCount}</div>
          </div>
        </div>
        <div className="bg-white p-5 border border-graticule-teal/30 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-tilled-earth/10 rounded-full flex items-center justify-center text-tilled-earth">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-registry-ink/60 uppercase tracking-wide font-semibold">In Progress</div>
            <div className="text-2xl font-serif text-registry-ink">{inProgressCount}</div>
          </div>
        </div>
        <div className="bg-white p-5 border border-graticule-teal/30 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-cultivated-green/10 rounded-full flex items-center justify-center text-cultivated-green">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-registry-ink/60 uppercase tracking-wide font-semibold">Resolved</div>
            <div className="text-2xl font-serif text-registry-ink">{resolvedCount}</div>
          </div>
        </div>
        <div className="bg-white p-5 border border-graticule-teal/30 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-registry-ink/10 rounded-full flex items-center justify-center text-registry-ink">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-registry-ink/60 uppercase tracking-wide font-semibold">Avg. Resolution</div>
            <div className="text-2xl font-serif text-registry-ink">14 Days</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-graticule-teal/30 rounded-sm shadow-sm flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1 p-4">
          {loading ? (
            <div className="flex justify-center items-center h-48 text-registry-ink/60">Loading grievances...</div>
          ) : filtered.length === 0 ? (
            <div className="flex justify-center items-center h-48 text-registry-ink/60">No grievances found matching criteria.</div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-graticule-teal/30 bg-graticule-teal/5">
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Tracking ID</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Category</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Complainant</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Submission Date</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Priority</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Status</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graticule-teal/10">
                {filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-graticule-teal/5 transition-colors">
                    <td className="p-3 text-sm font-mono text-graticule-teal">{g.trackingId}</td>
                    <td className="p-3 text-sm font-medium text-registry-ink">{g.category}</td>
                    <td className="p-3 text-sm text-registry-ink/80">{g.submittedBy}</td>
                    <td className="p-3 text-sm text-registry-ink/80">{g.submittedDate}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border ${getPriorityStyle(g.priority)}`}>
                        {g.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border ${getStatusStyle(g.status)}`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {g.status === "Open" && (
                        <button
                          onClick={() => handleUpdateStatus(g.id, "In Progress")}
                          className="px-2.5 py-1 bg-tilled-earth/10 text-tilled-earth hover:bg-tilled-earth hover:text-white border border-tilled-earth/30 rounded-xs text-xs font-medium transition-colors"
                        >
                          Start Inquiry
                        </button>
                      )}
                      {g.status === "In Progress" && (
                        <button
                          onClick={() => handleUpdateStatus(g.id, "Resolved")}
                          className="px-2.5 py-1 bg-cultivated-green/10 text-cultivated-green hover:bg-cultivated-green hover:text-white border border-cultivated-green/30 rounded-xs text-xs font-medium transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                        </button>
                      )}
                      {g.status === "Resolved" && (
                        <span className="text-xs text-cultivated-green font-mono">Redressed</span>
                      )}
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
