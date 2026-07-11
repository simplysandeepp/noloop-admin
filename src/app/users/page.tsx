"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, KeyRound, Ban, RotateCcw, Trash2 } from "lucide-react";
import Shell from "@/components/layout/Shell";
import StatusBadge from "@/components/ui/StatusBadge";
import TypeBadge from "@/components/ui/TypeBadge";
import CredentialsCard from "@/components/ui/CredentialsCard";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { admin } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import type { User } from "@/types";

export default function UsersPage() {
  const handleAuthError = useAuthRedirect();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [creds, setCreds] = useState<{ email: string; password: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    try {
      setUsers(await admin.listUsers());
    } catch (err) {
      if (handleAuthError(err)) return;
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleAuthError]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.name ?? "").toLowerCase().includes(q)
    );
  }, [users, query]);

  async function act(id: string, fn: () => Promise<void>) {
    setBusy(id);
    setError(null);
    try {
      await fn();
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof Error ? err.message : "Action failed");
      }
    } finally {
      setBusy(null);
    }
  }

  function revoke(u: User) {
    return act(u.id, async () => {
      await admin.revokeUser(u.id);
      await load();
    });
  }
  function restore(u: User) {
    return act(u.id, async () => {
      await admin.restoreUser(u.id);
      await load();
    });
  }
  function resetPassword(u: User) {
    return act(u.id, async () => {
      const res = await admin.resetPassword(u.id);
      setCreds(res.credentials);
    });
  }
  function remove(u: User) {
    if (!window.confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    return act(u.id, async () => {
      await admin.deleteUser(u.id);
      await load();
    });
  }

  return (
    <Shell>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Users</h1>
      <p className="text-sm text-slate-500 mt-1">
        Every account across all organizations.
      </p>

      {creds && (
        <CredentialsCard
          className="mt-4"
          title="Password reset"
          email={creds.email}
          password={creds.password}
          columns={2}
          onClose={() => setCreds(null)}
        />
      )}

      <div className="mt-6 relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name or email…"
          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      <div className="mt-4 bg-white border border-sky-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                {["Name", "Email", "Organization", "Role", "Status", "Created", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left font-semibold text-xs uppercase tracking-wider px-4 py-3 border-b border-slate-100"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 border-b border-slate-50 font-medium text-slate-800">
                    {u.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 border-b border-slate-50 text-slate-600">
                    {u.email}
                  </td>
                  <td className="px-4 py-3 border-b border-slate-50">
                    {u.tenant ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-slate-700">{u.tenant.name}</span>
                        <TypeBadge type={u.tenant.type} />
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-slate-50">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-slate-50">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-4 py-3 border-b border-slate-50 text-slate-400 whitespace-nowrap">
                    {fmtDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 border-b border-slate-50">
                    <div className="flex items-center gap-1.5">
                      {u.status === "ACTIVE" ? (
                        <button
                          disabled={busy === u.id}
                          onClick={() => revoke(u)}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 transition-all"
                        >
                          <Ban className="w-3.5 h-3.5" /> Revoke
                        </button>
                      ) : (
                        <button
                          disabled={busy === u.id}
                          onClick={() => restore(u)}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                      )}
                      <button
                        disabled={busy === u.id}
                        onClick={() => resetPassword(u)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-sky-700 bg-sky-50 hover:bg-sky-100 disabled:opacity-50 transition-all"
                      >
                        <KeyRound className="w-3.5 h-3.5" /> Reset
                      </button>
                      <button
                        disabled={busy === u.id}
                        onClick={() => remove(u)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    No users found.
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
