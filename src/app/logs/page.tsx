"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/layout/Shell";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { admin } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import type { LogEntry } from "@/types";

const ACTION_TINT: Record<string, string> = {
  ORG_CREATED: "bg-sky-100 text-sky-700",
  EMPLOYEE_CREATED: "bg-teal-100 text-teal-700",
  LOGIN: "bg-slate-100 text-slate-500",
};

export default function LogsPage() {
  const handleAuthError = useAuthRedirect();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLogs(await admin.listLogs(200));
      } catch (err) {
        if (!handleAuthError(err)) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      }
    })();
  }, [handleAuthError]);

  return (
    <Shell>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Activity logs</h1>
      <p className="text-sm text-slate-500 mt-1">Most recent platform events.</p>

      <div className="mt-6 bg-white border border-sky-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                {["When", "Action", "Organization", "Actor", "Detail"].map((h) => (
                  <th
                    key={h}
                    className="text-left font-semibold text-xs uppercase tracking-wider px-4 py-3 border-b border-slate-100"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 border-b border-slate-50 text-slate-400 whitespace-nowrap">
                    {fmtDate(l.createdAt)}
                  </td>
                  <td className="px-4 py-3 border-b border-slate-50">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        ACTION_TINT[l.action] ?? "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-slate-50">
                    {l.tenant?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 border-b border-slate-50">
                    {l.actor?.email ?? "system"}
                  </td>
                  <td className="px-4 py-3 border-b border-slate-50 text-slate-400">
                    {l.detail ?? "—"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No activity yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && <ErrorBanner className="mt-6">{error}</ErrorBanner>}
    </Shell>
  );
}
