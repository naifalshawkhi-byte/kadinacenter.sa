"use client";

import { TranslatedPageHeader } from "@/components/dashboard/TranslatedPageHeader";
import { clients } from "@/lib/data";
import { Plus, Search } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function ClientsPage() {
  return (
    <div>
      <TranslatedPageHeader titleKey="pages.clients.title" descriptionKey="pages.clients.desc">
        <button className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white">
          <Plus className="h-4 w-4" />
          عميل جديد
        </button>
      </TranslatedPageHeader>

      <div className="mb-4 relative max-w-md">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        <input
          placeholder="بحث عن عميل..."
          className="w-full rounded-xl border border-[var(--border)] py-2.5 pr-10 pl-4 text-sm outline-none focus:border-[var(--primary)]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-light)] text-sm font-bold text-[var(--primary)]">
                {getInitials(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{c.name}</h3>
                <p className="text-sm text-[var(--muted)]" dir="ltr">{c.phone}</p>
                {c.email && <p className="text-xs text-[var(--muted)]">{c.email}</p>}
              </div>
            </div>
            <div className="mt-4 flex justify-between text-sm border-t border-[var(--border)] pt-3">
              <span><strong>{c.visits}</strong> زيارة</span>
              <span className="text-[var(--muted)]">آخر زيارة: {c.lastVisit}</span>
            </div>
            <span className="mt-2 inline-block rounded-full bg-[var(--primary-light)] px-2 py-0.5 text-xs text-[var(--primary)]">
              {c.source}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
