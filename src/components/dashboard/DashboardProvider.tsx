"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { SessionUser } from "@/lib/auth";

interface DashboardContextValue {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => void;
}

const DashboardContext = createContext<DashboardContextValue>({
  user: null,
  loading: true,
  refresh: () => {},
});

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <DashboardContext.Provider value={{ user, loading, refresh }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
