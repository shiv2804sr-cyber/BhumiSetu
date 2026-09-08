import React, { useState, useEffect, useRef } from "react";
import { DocumentRecord } from "../types";
import { FolderOpen, Download, ShieldCheck, PenTool, Upload, Plus, X, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

export function Documents() {
  const { user } = useAuth();
  const [records, setRecords] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/documents");
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.data || [];
      setRecords(list);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/v1/documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bhumisetu_token") || ""}`,
        },
        body: formData,
      });
      if (res.ok) {
        setMessage("Government document uploaded and digitally checksummed.");
        setTimeout(() => setMessage(null), 5000);
        setIsUploadOpen(false);
        await fetchDocuments();
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Verified" ? "Pending Signature" : "Verified";
    try {
      const res = await fetch(`/api/v1/documents/${id}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bhumisetu_token") || ""}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error("Failed to toggle verification", err);
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
            <FolderOpen className="w-8 h-8 text-tilled-earth" />
            Document Repository
          </h2>
          <p className="text-registry-ink/60 mt-1">Versioned, tamper-evident document storage with SHA-256 digital signature tracking.</p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-registry-ink text-white font-medium hover:bg-registry-ink/90 transition-colors shadow-sm"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      <div className="bg-white border border-graticule-teal/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-graticule-teal/10 border-b border-graticule-teal/30 text-registry-ink font-semibold">
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">Doc ID</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">Version</th>
                <th className="px-6 py-4">Uploaded By</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">Checksum (SHA-256)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graticule-teal/20">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-graticule-teal animate-pulse">
                    Loading documents...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-registry-ink/60">
                    No documents found.
                  </td>
                </tr>
              ) : (
                records.map((record, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={record.id} 
                    className="hover:bg-graticule-teal/5 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-graticule-teal">{record.id}</td>
                    <td className="px-6 py-4 font-medium text-registry-ink">{record.title}</td>
                    <td className="px-6 py-4 text-registry-ink/80">{record.type}</td>
                    <td className="px-6 py-4 font-mono text-xs text-registry-ink/80">{record.version}</td>
                    <td className="px-6 py-4 text-registry-ink/80">{record.uploadedBy}</td>
                    <td className="px-6 py-4 text-registry-ink/80">{record.uploadDate}</td>
                    <td className="px-6 py-4 font-mono text-xs text-graticule-teal" title="Immutable file checksum hash">
                      {record.checksum}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleVerify(record.id, record.status)}
                        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                        title="Click to toggle digital verification"
                      >
                        {record.status === 'Verified' ? (
                          <ShieldCheck className="w-4 h-4 text-cultivated-green" />
                        ) : (
                          <PenTool className="w-4 h-4 text-tilled-earth" />
                        )}
                        <span className={`text-xs font-medium ${
                          record.status === 'Verified' ? 'text-cultivated-green' : 'text-tilled-earth'
                        }`}>
                          {record.status}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/api/v1/documents/${record.id}/download`}
                        download
                        className="text-graticule-teal hover:text-registry-ink transition-colors p-2 rounded hover:bg-graticule-teal/10 inline-flex items-center"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-registry-ink/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-graticule-teal/30 shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b border-graticule-teal/30 mb-4">
              <h3 className="font-serif font-semibold text-registry-ink text-lg">Upload Statutory Document</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-graticule-teal hover:text-registry-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-registry-ink uppercase mb-1">Document Title</label>
                <input required name="title" type="text" placeholder="e.g. Gazette_Sec11_Notification.pdf" className="w-full px-3 py-2 border border-graticule-teal/30 text-sm bg-survey-paper/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-registry-ink uppercase mb-1">Document Type</label>
                <select name="type" required className="w-full px-3 py-2 border border-graticule-teal/30 text-sm bg-white focus:outline-none">
                  <option value="Gazette">Gazette Notification</option>
                  <option value="Report">SIA / Environmental Report</option>
                  <option value="Legal">Legal & Award Declaration</option>
                  <option value="Survey">Cadastral Demarcation Map</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-registry-ink uppercase mb-1">Upload File (PDF / DOCX)</label>
                <input ref={fileInputRef} name="file" type="file" className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-medium file:bg-graticule-teal/10 file:text-registry-ink hover:file:bg-graticule-teal/20" />
              </div>
              <div className="pt-4 border-t border-graticule-teal/20 flex justify-end gap-3">
                <button type="button" onClick={() => setIsUploadOpen(false)} className="px-4 py-1.5 border border-graticule-teal/30 text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="px-4 py-1.5 bg-registry-ink text-white text-xs font-medium">
                  {uploading ? "Uploading & Checksumming..." : "Upload & Verify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
