"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, clearToken } from "@/lib/api";

/** Wraps authed pages: redirects to /login when no token, renders the nav. */
export default function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) router.replace("/login");
    else setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <span className="nav-brand">
            NoLoop <em>Admin</em>
          </span>
          <nav className="nav-links">
            <Link href="/">Dashboard</Link>
            <Link href="/logs">Logs</Link>
            <button
              className="nav-logout"
              onClick={() => {
                clearToken();
                router.replace("/login");
              }}
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}
