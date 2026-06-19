"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJSON, setToken } from "@/lib/api";

interface LoginResponse {
  token: string;
  user: { role: string; name: string | null };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await postJSON<LoginResponse>("/auth/login", {
        email,
        password,
      });
      if (data.user.role !== "PLATFORM_ADMIN") {
        setError("This account is not a platform admin.");
        return;
      }
      setToken(data.token);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="form-card" onSubmit={onSubmit}>
        <h1>
          NoLoop <span style={{ color: "var(--blue)" }}>Admin</span>
        </h1>
        <p className="lead">Platform operator sign-in.</p>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@noloop.in"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {error && <div className="msg msg-error">{error}</div>}
      </form>
    </main>
  );
}
