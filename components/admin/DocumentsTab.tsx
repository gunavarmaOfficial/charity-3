"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  X,
  Loader2,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

interface DocumentsTabProps {
  onRefresh: () => void;
}

export default function DocumentsTab({ onRefresh }: DocumentsTabProps) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "legal",
    fileUrl: "",
    version: "1.0",
  });

  const fetchDocs = async () => {
    try {
      const res = await fetch("/api/admin/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocs(data);
    } catch (err) {
      toast.error("Failed to load documents registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add document");
      }

      toast.success("Document registered successfully!");
      setModalOpen(false);
      setForm({
        name: "",
        category: "legal",
        fileUrl: "",
        version: "1.0",
      });
      fetchDocs();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document record?")) return;

    try {
      const res = await fetch(`/api/admin/documents?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete document");

      toast.success("Document registry deleted successfully!");
      fetchDocs();
      onRefresh();
    } catch (err) {
      toast.error("Failed to delete document.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      <div className="flex justify-between items-center bg-white p-6 border border-slate-200/80 rounded-2xl shadow-sm">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">Documents & Reports Registry</h3>
          <p className="text-slate-500 text-xs mt-1">Manage legal deeds, audit worksheets, 80G tax forms and annual filings</p>
        </div>
        <button
          onClick={() => {
            setForm({
              name: "",
              category: "legal",
              fileUrl: "",
              version: "1.0",
            });
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      ) : docs.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center text-slate-400">
          No files registered in documents folder. Upload deeds to list them here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-slate-200/85 rounded-2xl shadow-sm p-6 hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* File Header */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-slate-50 text-slate-500 border border-slate-200/40 rounded-xl shrink-0">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="truncate">
                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight truncate" title={doc.name}>
                      {doc.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1 uppercase tracking-wider">
                      Category: {doc.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span>Version Tag: v{doc.version}</span>
                  </div>
                </div>
              </div>

              {/* Bottom controls */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-6">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs hover:underline transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 bg-slate-50 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg border border-slate-200/40 transition inline-flex"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal: Upload Document */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">Register Document</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Document Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm font-semibold"
                  placeholder="e.g. 80G Tax Exemption Certificate"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                >
                  <option value="legal">Legal Deed / Charter</option>
                  <option value="audit">Annual Audit Report</option>
                  <option value="tax_exemption">80G Tax Exemption</option>
                  <option value="annual_report">Annual Activity Report</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">Version tag</label>
                  <input
                    type="text"
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                    placeholder="e.g. 1.0"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  {/* Dummy placeholder for space */}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">File Resource URL *</label>
                <input
                  type="text"
                  required
                  value={form.fileUrl}
                  onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition text-sm"
                  placeholder="https://fvcxbtoiboxrlyncvjsr.supabase.co/..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-600/10 transition duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register File"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
