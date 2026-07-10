"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, UsersRound, ScrollText, LogOut } from "lucide-react";
import { getToken, clearToken } from "@/lib/api";
import Logo from "@/components/ui/Logo";

export default function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) router.replace("/login");
    else setReady(true);
  }, [router]);

  if (!ready) return null;

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/users", label: "Users", icon: UsersRound },
    { href: "/logs", label: "Logs", icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-sky-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={34} />
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-slate-900 text-white">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-1">
            {links.map((l) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all ${
                    active
                      ? "bg-sky-100 text-sky-700"
                      : "text-slate-500 hover:text-sky-700 hover:bg-sky-50"
                  }`}
                >
                  <l.icon className="w-4 h-4" />
                  {l.label}
                </Link>
              );
            })}
            <button
              onClick={() => {
                clearToken();
                router.replace("/login");
              }}
              className="ml-2 flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:text-red-600 hover:border-red-200 transition-all"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
