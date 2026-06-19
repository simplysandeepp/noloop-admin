"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
      <Link className="back-link" href="/">
        ← Back to dashboard
      </Link>

      {org && (
        <>
          <h1 className="page-title">
            {org.name}{" "}
            <span
              className={`tag ${
                org.type === "HOSPITAL" ? "tag-hospital" : "tag-insurer"
              }`}
            >
              {org.type}
            </span>
          </h1>
          <p className="muted">Created {fmtDate(org.createdAt)}</p>

          <h2 className="section">Employees ({org.users.length})</h2>
          <div className="table-wrap">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {org.users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name ?? "—"}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="tag tag-role">{u.role}</span>
                      </td>
                      <td className="muted">{fmtDate(u.createdAt)}</td>
                    </tr>
                  ))}
                  {org.users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="empty">
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

      {error && <div className="msg msg-error">{error}</div>}
    </Shell>
  );
}
