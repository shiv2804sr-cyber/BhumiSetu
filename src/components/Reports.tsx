import { useState, useEffect } from "react";
import { FileBarChart, Download, Calendar, Filter } from "lucide-react";
import { ReportRecord } from "../types";

export function Reports() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex-1 flex flex-col p-8 min-h-0 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink flex items-center gap-3">
            <FileBarChart className="w-8 h-8 text-graticule-teal" />
            MIS & Reports
          </h2>
          <p className="text-registry-ink/60 mt-1">Generate and view statutory progress and financial reports.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-survey-paper border border-graticule-teal/30 rounded-sm text-registry-ink text-sm font-medium hover:bg-graticule-teal/10 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-4 py-2 bg-registry-ink text-white rounded-sm text-sm font-medium hover:bg-registry-ink/90 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Generate New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 border border-graticule-teal/30 rounded-sm shadow-sm flex flex-col">
          <div className="text-sm text-registry-ink/60 uppercase tracking-wide font-semibold mb-2">Total Reports Generated</div>
          <div className="text-4xl font-serif text-registry-ink mb-1">142</div>
          <div className="text-sm text-cultivated-green">+12 this month</div>
        </div>
        <div className="bg-white p-6 border border-graticule-teal/30 rounded-sm shadow-sm flex flex-col">
          <div className="text-sm text-registry-ink/60 uppercase tracking-wide font-semibold mb-2">Automated MIS Checks</div>
          <div className="text-4xl font-serif text-registry-ink mb-1">98.5%</div>
          <div className="text-sm text-registry-ink/60">Compliance rate</div>
        </div>
        <div className="bg-white p-6 border border-graticule-teal/30 rounded-sm shadow-sm flex flex-col">
          <div className="text-sm text-registry-ink/60 uppercase tracking-wide font-semibold mb-2">Next Audit Due</div>
          <div className="text-4xl font-serif text-tilled-earth mb-1">14 Days</div>
          <div className="text-sm text-registry-ink/60">Q4 State Review</div>
        </div>
      </div>

      <div className="bg-white border border-graticule-teal/30 rounded-sm shadow-sm flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-graticule-teal/30 bg-graticule-teal/5 flex justify-between items-center">
          <h3 className="font-semibold text-registry-ink font-serif">Recent Reports</h3>
        </div>
        <div className="overflow-auto flex-1 p-4">
          {loading ? (
            <div className="flex justify-center items-center h-48 text-registry-ink/60">Loading...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-graticule-teal/30">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Report ID</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Title</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Type</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Generated Date</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60">Size / Format</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-registry-ink/60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graticule-teal/10">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-graticule-teal/5 transition-colors group">
                    <td className="py-3 text-sm font-mono text-graticule-teal">{report.id}</td>
                    <td className="py-3 text-sm font-medium text-registry-ink">{report.title}</td>
                    <td className="py-3 text-sm text-registry-ink/80">{report.type}</td>
                    <td className="py-3 text-sm text-registry-ink/80">{report.generatedDate}</td>
                    <td className="py-3 text-sm text-registry-ink/80">{report.size} • {report.format}</td>
                    <td className="py-3 text-right">
                      <button className="px-3 py-1 bg-graticule-teal/10 text-graticule-teal hover:bg-graticule-teal hover:text-white rounded-sm text-xs transition-colors flex items-center gap-1 ml-auto">
                        <Download className="w-3 h-3" />
                        Download
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
