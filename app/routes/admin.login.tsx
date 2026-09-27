import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../services/supabase";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    navigate("/admin");
  }

return (
  <main className="flex min-h-screen items-center justify-center bg-[#0b0f14] px-6 text-white">
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/10 bg-[#111820] p-8">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-600">
            Portfolio Administration
          </p>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            Admin Login
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Sign in to manage the portfolio website.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-white/30"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0b0f14] px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-white/30"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white px-4 py-3 font-medium text-gray-900 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-gray-600">
        Portfolio Management System
      </p>
    </div>
  </main>
);

}