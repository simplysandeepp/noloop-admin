"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { authedGet, ApiError } from "@/lib/api";

interface LogEntry {
  id: string;
  action: string;
  detail: string | null;
  createdAt: string;
  tenant: { name: string; type: string } | null;
  actor: { name: string | null; email: string } | null;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleString();
}

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLogs(await authedGet<LogEntry[]>("/admin/logs?limit=200"));
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          router.replace("/login");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      }
    })();
  }, [router]);

  return (
    <Shell>
      <h1 className="page-title">Activity logs</h1>
      <p className="muted">Most recent platform events.</p>

      <div className="table-wrap" style={{ marginTop: "1rem" }}>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Organization</th>
                <th>Actor</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="muted">{fmtDate(l.createdAt)}</td>
                  <td>
                    <span className="tag tag-role">{l.action}</span>
                  </td>
                  <td>{l.tenant?.name ?? "—"}</td>
                  <td>{l.actor?.email ?? "system"}</td>
                  <td className="muted">{l.detail ?? "—"}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty">
                    No activity yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && <div className="msg msg-error">{error}</div>}
    </Shell>
  );
}
