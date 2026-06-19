"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, Hospital, ShieldCheck, Users, ScrollText, ArrowRight } from "lucide-react";
import Shell from "@/components/Shell";
import { authedGet, ApiError } from "@/lib/api";

interface Stats {
  orgs: number;
  hospitals: number;
  insurers: number;
  users: number;
  logs: number;
}
interface Org {
  id: string;
  name: string;
  type: "HOSPITAL" | "INSURER";
  createdAt: string;
  employeeCount: number;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleString();
}

const CARDS: { key: keyof Stats; label: string; icon: any; tint: string }[] = [
  { key: "orgs", label: "Organizations", icon: Building2, tint: "text-slate-700" },
  { key: "hospitals", label: "Hospitals", icon: Hospital, tint: "text-sky-600" },
  { key: "insurers", label: "Insurers", icon: ShieldCheck, tint: "text-teal-600" },
  { key: "users", label: "Users", icon: Users, tint: "text-indigo-600" },
  { key: "logs", label: "Log events", icon: ScrollText, tint: "text-amber-600" },
];

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
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
    })();
  }, [router]);

  return (
    <Shell>
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
      <p className="text-sm text-slate-500 mt-1">Platform overview.</p>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
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

      <h2 className="mt-8 mb-3 text-lg font-bold text-slate-900">Organizations</h2>
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
