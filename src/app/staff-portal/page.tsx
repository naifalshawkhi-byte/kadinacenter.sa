"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, Loader2 } from "lucide-react";
import { usePreferences } from "@/components/providers/PreferencesProvider";
import { ThemeLocaleControls } from "@/components/dashboard/ThemeLocaleControls";
import { safeRedirectPath } from "@/lib/security";
import { useClinicBranding, ClinicLogo } from "@/components/providers/ClinicBrandingProvider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get("redirect"));
  const { t } = usePreferences();
  const { settings } = useClinicBranding();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || t("login.error"));
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="absolute top-4 left-4 right-4 flex justify-end">
        <ThemeLocaleControls />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex justify-center">
            <ClinicLogo size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{settings.name || t("login.title")}</h1>
          <p className="text-[var(--muted)] mt-2 text-sm">{settings.tagline || t("login.subtitle")}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--card)] rounded-2xl shadow-lg border border-[var(--border)] p-8 space-y-5"
        >
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              {t("login.username")}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
              {t("login.password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-3.5 text-white font-medium hover:bg-[var(--primary-dark)] disabled:opacity-60 transition-colors"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
            {t("login.submit")}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[var(--muted)]">
          <Link href="/" className="text-[var(--primary)] hover:underline">
            {t("login.homeLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function StaffPortalPage() {
  const { t } = usePreferences();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-[var(--muted)]">
          {t("common.loading")}
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
