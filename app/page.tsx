"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
      <h1 className="page-title">Dashboard</h1>

      {stats && (
        <div className="cards">
          <div className="card">
            <div className="num">{stats.orgs}</div>
            <div className="label">Organizations</div>
          </div>
          <div className="card">
            <div className="num">{stats.hospitals}</div>
            <div className="label">Hospitals</div>
          </div>
          <div className="card">
            <div className="num">{stats.insurers}</div>
            <div className="label">Insurers</div>
          </div>
          <div className="card">
            <div className="num">{stats.users}</div>
            <div className="label">Users</div>
          </div>
          <div className="card">
            <div className="num">{stats.logs}</div>
            <div className="label">Log events</div>
          </div>
        </div>
      )}

      <h2 className="section">Organizations</h2>
      <div className="table-wrap">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Employees</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o.id}>
                  <td>{o.name}</td>
                  <td>
                    <span
                      className={`tag ${
                        o.type === "HOSPITAL" ? "tag-hospital" : "tag-insurer"
                      }`}
                    >
                      {o.type}
                    </span>
                  </td>
                  <td>{o.employeeCount}</td>
                  <td className="muted">{fmtDate(o.createdAt)}</td>
                  <td>
                    <Link className="row-link" href={`/orgs/${o.id}`}>
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
              {orgs.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty">
                    No organizations yet.
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
