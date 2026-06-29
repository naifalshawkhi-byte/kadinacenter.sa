"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { defaultClinicSettings, type ClinicSettings } from "@/lib/clinic-types";
import { CLINIC_PHONE } from "@/lib/site-config";

interface ClinicBrandingContextValue {
  settings: ClinicSettings;
  loading: boolean;
  refresh: () => void;
}

const ClinicBrandingContext = createContext<ClinicBrandingContextValue>({
  settings: defaultClinicSettings(),
  loading: true,
  refresh: () => {},
});

export function ClinicBrandingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<ClinicSettings>(defaultClinicSettings());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    fetch("/api/clinic/branding", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setSettings((prev) => ({
          ...prev,
          name: d.name ?? prev.name,
          tagline: d.tagline ?? prev.tagline,
          description: d.description ?? prev.description,
          phone: d.phone ?? CLINIC_PHONE,
          address: d.address ?? prev.address,
          logo: d.logo ?? "",
        }));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  return (
    <ClinicBrandingContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </ClinicBrandingContext.Provider>
  );
}

export function useClinicBranding() {
  return useContext(ClinicBrandingContext);
}

export function ClinicLogo({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { settings } = useClinicBranding();
  const dim =
    size === "lg" ? "h-14 w-14 text-2xl" : size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-lg";
  const initial = settings.name?.trim()?.charAt(0) || "؟";

  if (settings.logo) {
    const src = settings.logo.startsWith("data:")
      ? settings.logo
      : `${settings.logo}?v=${encodeURIComponent(settings.name || "")}`;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={settings.name}
        className={`${dim} rounded-xl object-cover shrink-0 ${className ?? ""}`}
      />
    );
  }

  return (
    <div
      className={`${dim} flex items-center justify-center rounded-xl bg-[var(--primary)] font-bold text-white shrink-0 ${className ?? ""}`}
    >
      {initial}
    </div>
  );
}
