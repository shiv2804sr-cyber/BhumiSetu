import { useState, useEffect } from "react";
import { ShieldAlert, Search, Filter, MessageSquare, AlertCircle } from "lucide-react";
import { GrievanceRecord } from "../types";

export function Grievances() {
  const [grievances, setGrievances] = useState<GrievanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/grievances")
      .then(res => res.json())
      .then(data => {
        setGrievances(data);
        setLoading(false);
      });
  }, []);

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

  return (
    <div className="flex-1 flex flex-col p-8 min-h-0 overflow-y-auto">
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
              placeholder="Search by Tracking ID..." 
              className="pl-9 pr-4 py-2 border border-graticule-teal/30 rounded-sm bg-white text-sm focus:outline-none focus:border-graticule-teal w-64"
            />
          </div>
          <button className="px-4 py-2 bg-survey-paper border border-graticule-teal/30 rounded-sm text-registry-ink text-sm font-medium hover:bg-graticule-teal/10 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 border border-graticule-teal/30 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-alluvium-red/10 rounded-full flex items-center justify-center text-alluvium-red">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-registry-ink/60 uppercase tracking-wide font-semibold">Open</div>
            <div className="text-2xl font-serif text-registry-ink">1</div>
          </div>
        </div>
        <div className="bg-white p-5 border border-graticule-teal/30 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-tilled-earth/10 rounded-full flex items-center justify-center text-tilled-earth">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-registry-ink/60 uppercase tracking-wide font-semibold">In Progress</div>
            <div className="text-2xl font-serif text-registry-ink">1</div>
          </div>
        </div>
        <div className="bg-white p-5 border border-graticule-teal/30 rounded-sm shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-cultivated-green/10 rounded-full flex items-center justify-center text-cultivated-green">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-registry-ink/60 uppercase tracking-wide font-semibold">Resolved</div>
            <div className="text-2xl font-serif text-registry-ink">1</div>
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
            <div className="flex justify-center items-center h-48 text-registry-ink/60">Loading...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-graticule-teal/30 bg-graticule-teal/5">
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Tracking ID</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Submitted By</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Category & Details</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Priority</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Status</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Assigned To</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graticule-teal/10">
                {grievances.map((g) => (
                  <tr key={g.id} className="hover:bg-graticule-teal/5 transition-colors group">
                    <td className="p-3 text-sm font-mono text-registry-ink">{g.trackingId}</td>
                    <td className="p-3 text-sm text-registry-ink font-medium">
                      {g.submittedBy}
                      <div className="text-xs text-registry-ink/60 font-normal">{g.submittedDate}</div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="font-semibold text-registry-ink">{g.category}</div>
                      <div className="text-registry-ink/70 mt-0.5 line-clamp-1 max-w-xs" title={g.description}>{g.description}</div>
                    </td>
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
                    <td className="p-3 text-sm text-registry-ink/80">{g.assignedTo}</td>
                    <td className="p-3 text-right">
                      <button className="px-3 py-1.5 bg-survey-paper border border-graticule-teal/30 hover:bg-graticule-teal/10 text-registry-ink rounded-sm text-xs font-medium transition-colors">
                        Review
                      </button>
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
