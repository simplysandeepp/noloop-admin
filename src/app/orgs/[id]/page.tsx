"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  X,
  KeyRound,
  Ban,
  RotateCcw,
  Trash2,
} from "lucide-react";
import Shell from "@/components/layout/Shell";
import StatusBadge from "@/components/ui/StatusBadge";
import TypeBadge from "@/components/ui/TypeBadge";
import CredentialsCard from "@/components/ui/CredentialsCard";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { admin } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import type { Employee, OrgDetail, OrgType } from "@/types";

const ROLES_BY_TYPE: Record<OrgType, string[]> = {
  HOSPITAL: ["HOSPITAL_ADMIN", "HOSPITAL_STAFF"],
  INSURER: ["INSURER_ADMIN", "INSURER_ADJUDICATOR"],
};

export default function OrgDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const handleAuthError = useAuthRedirect();
  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [creds, setCreds] = useState<{
    email: string;
    password: string;
    role?: string;
  } | null>(null);

  // add-employee form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    try {
      setOrg(await admin.getOrg(params.id));
    } catch (err) {
      if (handleAuthError(err)) return;
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, handleAuthError]);

  const roleOptions = org ? ROLES_BY_TYPE[org.type] : [];

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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await admin.createUser({
        tenantId: org.id,
        name: name.trim(),
        ...(role ? { role } : {}),
        ...(password.trim() ? { password: password.trim() } : {}),
      });
      setCreds(res.credentials);
      setShowForm(false);
      setName("");
      setRole("");
      setPassword("");
      await load();
    } catch (err) {
      if (!handleAuthError(err)) {
        setFormError(err instanceof Error ? err.message : "Failed to add employee");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function revoke(u: Employee) {
    return act(u.id, async () => {
      await admin.revokeUser(u.id);
      await load();
    });
  }
  function restore(u: Employee) {
    return act(u.id, async () => {
      await admin.restoreUser(u.id);
      await load();
    });
  }
  function resetPassword(u: Employee) {
    return act(u.id, async () => {
      const res = await admin.resetPassword(u.id);
      setCreds(res.credentials);
    });
  }
  function removeEmployee(u: Employee) {
    if (!window.confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    return act(u.id, async () => {
      await admin.deleteUser(u.id);
      await load();
    });
  }

  async function deleteOrg() {
    if (!org) return;
    if (
      !window.confirm(
        `Delete organization "${org.name}" and all its data? This cannot be undone.`
      )
    )
      return;
    setBusy("org");
    setError(null);
    try {
      await admin.deleteOrg(org.id);
      router.push("/");
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof Error ? err.message : "Failed to delete organization");
      }
      setBusy(null);
    }
  }

  return (
    <Shell>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 hover:text-sky-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      {org && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {org.name}
            </h1>
            <TypeBadge type={org.type} size="md" />
            <button
              onClick={deleteOrg}
              disabled={busy === "org"}
              className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Delete organization
            </button>
          </div>
          <p className="text-sm text-slate-400 mt-1">Created {fmtDate(org.createdAt)}</p>

          {creds && (
            <CredentialsCard
              className="mt-5"
              title="Credentials"
              email={creds.email}
              password={creds.password}
              role={creds.role}
              columns={3}
              onClose={() => setCreds(null)}
            />
          )}

          <div className="mt-8 mb-3 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900">
              Employees ({org.users.length})
            </h2>
            <button
              onClick={() => {
                setShowForm((v) => !v);
                setFormError(null);
                setRole("");
              }}
              className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold px-4 py-2.5 text-sm transition-all"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? "Cancel" : "Add employee"}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleAdd}
              className="mb-4 bg-white border border-sky-100 rounded-2xl p-5 shadow-sm grid sm:grid-cols-3 gap-3"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="">Default</option>
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Password{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Auto-generated if blank"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>
              {formError && (
                <ErrorBanner className="sm:col-span-3">{formError}</ErrorBanner>
              )}
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white rounded-xl font-bold px-5 py-2.5 text-sm transition-all"
                >
                  {submitting ? "Adding…" : "Add employee"}
                </button>
              </div>
            </form>
          )}

          <div className="bg-white border border-sky-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    {["Name", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
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
                  {org.users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 border-b border-slate-50">
                        {u.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 border-b border-slate-50">{u.email}</td>
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
                          {(u.status ?? "ACTIVE") === "ACTIVE" ? (
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
                            onClick={() => removeEmployee(u)}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {org.users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                        No employees yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {error && <ErrorBanner className="mt-6">{error}</ErrorBanner>}
    </Shell>
  );
}
