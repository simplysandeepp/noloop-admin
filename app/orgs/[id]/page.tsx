"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Shell from "@/components/Shell";
import { authedGet, ApiError } from "@/lib/api";

interface Employee {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
}
interface OrgDetail {
  id: string;
  name: string;
  type: "HOSPITAL" | "INSURER";
  createdAt: string;
  users: Employee[];
}

function fmtDate(s: string) {
  return new Date(s).toLocaleString();
}

export default function OrgDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setOrg(await authedGet<OrgDetail>(`/admin/orgs/${params.id}`));
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          router.replace("/login");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      }
    })();
  }, [params.id, router]);

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
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                org.type === "HOSPITAL"
                  ? "bg-sky-100 text-sky-700"
                  : "bg-teal-100 text-teal-700"
              }`}
            >
              {org.type}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Created {fmtDate(org.createdAt)}</p>

          <h2 className="mt-8 mb-3 text-lg font-bold text-slate-900">
            Employees ({org.users.length})
          </h2>
          <div className="bg-white border border-sky-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    {["Name", "Email", "Role", "Joined"].map((h) => (
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
                      <td className="px-4 py-3 border-b border-slate-50 text-slate-400">
                        {fmtDate(u.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {org.users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
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

      {error && (
        <div className="mt-6 text-sm rounded-xl px-3.5 py-2.5 bg-red-50 text-red-600 border border-red-100">
          {error}
        </div>
      )}
    </Shell>
  );
}
