"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Connexion impossible.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo variant="square" className="scale-90" />
        </div>

        <h1 className="text-center font-serif text-3xl">Espace barbier</h1>
        <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
          Connectez-vous pour gérer vos rendez-vous et services.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-sm border border-white/10 bg-[var(--color-surface)] p-6"
        >
          {error && (
            <p className="rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="email" className="block text-sm text-[var(--color-muted)]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2 text-sm outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-[var(--color-muted)]">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-sm border border-white/10 bg-[var(--color-background)] px-3 py-2 text-sm outline-none focus:border-white/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-sm bg-[var(--color-foreground)] px-4 py-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-background)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
