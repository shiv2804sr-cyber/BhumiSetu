import React, { useState, useEffect } from "react";
import { FileBarChart, Download, Calendar, Filter, X, Plus, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { ReportRecord } from "../types";

export function Reports() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/reports");
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.data || [];
      setReports(list);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGenerating(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      title: formData.get("title"),
      type: formData.get("type"),
      format: formData.get("format"),
    };

    try {
      const res = await fetch("/api/v1/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bhumisetu_token") || ""}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage("Custom MIS Report generated successfully.");
        setTimeout(() => setMessage(null), 4000);
        setIsGenerateOpen(false);
        await fetchReports();
      }
    } catch (err) {
      console.error("Generation failed", err);
    } finally {
      setGenerating(false);
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
            <FileBarChart className="w-8 h-8 text-graticule-teal" />
            MIS & Statutory Reports
          </h2>
          <p className="text-registry-ink/60 mt-1">Generate and export statutory land acquisition and DBT financial reports.</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/v1/reports/export?type=projects"
            download="BhumiSetu_Projects.csv"
            className="px-3.5 py-2 bg-survey-paper border border-graticule-teal/30 rounded-sm text-registry-ink text-xs font-medium hover:bg-graticule-teal/10 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-cultivated-green" />
            Export Projects CSV
          </a>
          <a
            href="/api/v1/reports/export?type=compensation"
            download="BhumiSetu_Compensation.csv"
            className="px-3.5 py-2 bg-survey-paper border border-graticule-teal/30 rounded-sm text-registry-ink text-xs font-medium hover:bg-graticule-teal/10 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-tilled-earth" />
            Export Compensation CSV
          </a>
          <button 
            onClick={() => setIsGenerateOpen(true)}
            className="px-4 py-2 bg-registry-ink text-white rounded-sm text-sm font-medium hover:bg-registry-ink/90 transition-colors flex items-center gap-2 shadow-xs"
          >
            <Calendar className="w-4 h-4" />
            Generate New Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 border border-graticule-teal/30 rounded-sm shadow-sm flex flex-col">
          <div className="text-sm text-registry-ink/60 uppercase tracking-wide font-semibold mb-2">Total Reports Generated</div>
          <div className="text-4xl font-serif text-registry-ink mb-1">{reports.length}</div>
          <div className="text-sm text-cultivated-green">+100% real-time database sync</div>
        </div>
        <div className="bg-white p-6 border border-graticule-teal/30 rounded-sm shadow-sm flex flex-col">
          <div className="text-sm text-registry-ink/60 uppercase tracking-wide font-semibold mb-2">Automated MIS Checks</div>
          <div className="text-4xl font-serif text-registry-ink mb-1">99.2%</div>
          <div className="text-sm text-registry-ink/60">RFCTLARR Compliance rate</div>
        </div>
        <div className="bg-white p-6 border border-graticule-teal/30 rounded-sm shadow-sm flex flex-col">
          <div className="text-sm text-registry-ink/60 uppercase tracking-wide font-semibold mb-2">Next Scheduled State Review</div>
          <div className="text-4xl font-serif text-tilled-earth mb-1">7 Days</div>
          <div className="text-sm text-registry-ink/60">Q4 Inter-Ministerial Review</div>
        </div>
      </div>

      <div className="bg-white border border-graticule-teal/30 rounded-sm shadow-sm flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-graticule-teal/30 bg-graticule-teal/5 flex justify-between items-center">
          <h3 className="font-semibold text-registry-ink font-serif">Recent MIS Records</h3>
        </div>
        <div className="overflow-auto flex-1 p-4">
          {loading ? (
            <div className="flex justify-center items-center h-48 text-registry-ink/60">Loading reports...</div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
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
                      <a
                        href={`/api/v1/reports/export?type=projects`}
                        download={`${report.title}.csv`}
                        className="px-3 py-1 bg-graticule-teal/10 text-graticule-teal hover:bg-graticule-teal hover:text-white rounded-sm text-xs transition-colors inline-flex items-center gap-1 ml-auto"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-registry-ink/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-graticule-teal/30 shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b border-graticule-teal/30 mb-4">
              <h3 className="font-serif font-semibold text-registry-ink text-lg">Generate MIS Report</h3>
              <button onClick={() => setIsGenerateOpen(false)} className="text-graticule-teal hover:text-registry-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-registry-ink uppercase mb-1">Report Title</label>
                <input required name="title" type="text" placeholder="e.g. Q4 District Acquisition Adherence" className="w-full px-3 py-2 border border-graticule-teal/30 text-sm bg-survey-paper/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-registry-ink uppercase mb-1">Report Category</label>
                <select name="type" required className="w-full px-3 py-2 border border-graticule-teal/30 text-sm bg-white focus:outline-none">
                  <option value="Progress">Progress & Milestone SLA</option>
                  <option value="Financial">Financial & DBT Compensation</option>
                  <option value="Social">Social Impact & R&R</option>
                  <option value="Audit">Statutory Compliance Audit</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-registry-ink uppercase mb-1">Export Format</label>
                <select name="format" required className="w-full px-3 py-2 border border-graticule-teal/30 text-sm bg-white focus:outline-none">
                  <option value="PDF">PDF Report Document</option>
                  <option value="CSV">CSV Spreadsheet Data</option>
                  <option value="XLSX">Excel Workbook (XLSX)</option>
                </select>
              </div>
              <div className="pt-4 border-t border-graticule-teal/20 flex justify-end gap-3">
                <button type="button" onClick={() => setIsGenerateOpen(false)} className="px-4 py-1.5 border border-graticule-teal/30 text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={generating} className="px-4 py-1.5 bg-registry-ink text-white text-xs font-medium">
                  {generating ? "Generating..." : "Generate Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
