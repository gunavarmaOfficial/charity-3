"use client";

import React, { useState, useEffect } from "react";
import { Search, Loader2, ShieldAlert, ShieldCheck, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function AuditLogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit-logs");
      if (!res.ok) throw new Error("Failed to fetch audit trails");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      toast.error("Failed to load audit trails.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter modules options dynamically based on logs
  const modulesList = React.useMemo(() => {
    const modules = new Set(logs.map((l) => l.module).filter(Boolean));
    return Array.from(modules);
  }, [logs]);

  // Filtered log listings
  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    const matchesSearch =
      log.action?.toLowerCase().includes(term) ||
      log.ipAddress?.includes(term) ||
      log.user?.name?.toLowerCase().includes(term) ||
      log.user?.email?.toLowerCase().includes(term);

    const matchesModule = filterModule === "all" || log.module === filterModule;

    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 border border-slate-200/80 rounded-2xl shadow-sm">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg">System Audit Trails</h3>
          <p className="text-slate-500 text-xs mt-1">Trace all changes, insertions, volunteer approvals, and settings edits</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200/60 transition"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Filters control */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/20">
          <div className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 rounded-xl text-sm w-full sm:max-w-xs">
            <Search className="w-4.5 h-4.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by action, IP, admin name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-slate-800 focus:outline-none placeholder:text-slate-400 text-xs font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase whitespace-nowrap">Filter Module:</span>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">All Modules</option>
              {modulesList.map((m, idx) => (
                <option key={idx} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No audit records matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-slate-800">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-xs font-extrabold uppercase border-b border-slate-100">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Admin profile</th>
                  <th className="p-4">Action details</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="p-4 text-slate-400 font-semibold whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      {log.user ? (
                        <div>
                          <div className="font-bold text-slate-800">{log.user.name}</div>
                          <div className="text-xs text-slate-400">{log.user.email}</div>
                        </div>
                      ) : (
                        <div className="text-slate-400 font-semibold">System/Guest Action</div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-900 leading-normal">
                      {log.action}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold uppercase tracking-wider">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-500 text-xs">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
