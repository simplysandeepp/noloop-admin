"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  Hospital,
  ShieldCheck,
  Users,
  ScrollText,
  FileText,
  ArrowRight,
  Plus,
  X,
  KeyRound,
} from "lucide-react";
import Shell from "@/components/Shell";
import { authedGet, authedPost, ApiError } from "@/lib/api";

interface Stats {
  orgs: number;
  hospitals: number;
  insurers: number;
  users: number;
  claims: number;
  logs: number;
}
interface Org {
  id: string;
  name: string;
  type: "HOSPITAL" | "INSURER";
  createdAt: string;
  employeeCount: number;
}
interface Credentials {
  email: string;
  password: string;
  role: string;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleString();
}

const CARDS: { key: keyof Stats; label: string; icon: any; tint: string }[] = [
  { key: "orgs", label: "Organizations", icon: Building2, tint: "text-slate-700" },
  { key: "hospitals", label: "Hospitals", icon: Hospital, tint: "text-sky-600" },
  { key: "insurers", label: "Insurers", icon: ShieldCheck, tint: "text-teal-600" },
  { key: "users", label: "Users", icon: Users, tint: "text-indigo-600" },
  { key: "claims", label: "Claims", icon: FileText, tint: "text-rose-600" },
  { key: "logs", label: "Log events", icon: ScrollText, tint: "text-amber-600" },
];

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<"HOSPITAL" | "INSURER">("HOSPITAL");
  const [name, setName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [creds, setCreds] = useState<Credentials | null>(null);

  async function load() {
    try {
      const [s, o] = await Promise.all([
        authedGet<Stats>("/admin/stats"),
        authedGet<Org[]>("/admin/orgs"),
      ]);
      setStats(s);
      setOrgs(o);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        router.replace("/login");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load");
      }
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await authedPost<{
        tenant: { id: string; name: string; type: string };
        credentials: Credentials;
      }>("/admin/orgs", {
        type,
        name: name.trim(),
        adminName: adminName.trim(),
        ...(password.trim() ? { password: password.trim() } : {}),
      });
      setCreds(res.credentials);
      setShowForm(false);
      setName("");
      setAdminName("");
      setPassword("");
      setType("HOSPITAL");
      await load();
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        router.replace("/login");
      } else {
        setFormError(err instanceof Error ? err.message : "Failed to create");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Shell>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
      <p className="text-sm text-slate-500 mt-1">Platform overview.</p>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-3">
        {CARDS.map((c) => (
          <div
            key={c.key}
            className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm"
          >
            <c.icon className={`w-5 h-5 mb-3 ${c.tint}`} />
            <p className="text-3xl font-black tracking-tight text-slate-900">
              {stats ? stats[c.key] : "—"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 mb-3 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-slate-900">Organizations</h2>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setFormError(null);
          }}
          className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold px-4 py-2.5 text-sm transition-all"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Create organization"}
        </button>
      </div>

      {creds && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <KeyRound className="w-4 h-4" /> Admin credentials created
            </div>
            <button
              onClick={() => setCreds(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-emerald-700 mt-1">
            Save these now — the password is shown once.
          </p>
          <dl className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">
                Email
              </dt>
              <dd className="font-mono text-slate-800 break-all">{creds.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">
                Password
              </dt>
              <dd className="font-mono text-slate-800 break-all">{creds.password}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">
                Role
              </dt>
              <dd className="font-mono text-slate-800">{creds.role}</dd>
            </div>
          </dl>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-4 bg-white border border-sky-100 rounded-2xl p-5 shadow-sm grid sm:grid-cols-2 gap-3"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "HOSPITAL" | "INSURER")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="HOSPITAL">HOSPITAL</option>
              <option value="INSURER">INSURER</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Organization name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meadowbrook General"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Admin name
            </label>
            <input
              required
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Password <span className="text-slate-400 font-normal">(optional)</span>
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
            <div className="sm:col-span-2 text-sm rounded-xl px-3.5 py-2.5 bg-red-50 text-red-600 border border-red-100">
              {formError}
            </div>
          )}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white rounded-xl font-bold px-5 py-2.5 text-sm transition-all"
            >
              {submitting ? "Creating…" : "Create organization"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-sky-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                {["Name", "Type", "Employees", "Created", ""].map((h, i) => (
                  <th
                    key={i}
                    className="text-left font-semibold text-xs uppercase tracking-wider px-4 py-3 border-b border-slate-100"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 border-b border-slate-50 font-medium text-slate-800">
                    {o.name}
                  </td>
                  <td className="px-4 py-3 border-b border-slate-50">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        o.type === "HOSPITAL"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-teal-100 text-teal-700"
                      }`}
                    >
                      {o.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-slate-50">
                    {o.employeeCount}
                  </td>
                  <td className="px-4 py-3 border-b border-slate-50 text-slate-400">
                    {fmtDate(o.createdAt)}
                  </td>
                  <td className="px-4 py-3 border-b border-slate-50">
                    <Link
                      href={`/orgs/${o.id}`}
                      className="inline-flex items-center gap-1 text-sky-600 font-semibold hover:text-sky-700"
                    >
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {orgs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No organizations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="mt-6 text-sm rounded-xl px-3.5 py-2.5 bg-red-50 text-red-600 border border-red-100">
          {error}
        </div>
      )}
    </Shell>
  );
}
