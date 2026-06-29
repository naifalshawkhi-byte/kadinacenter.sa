"use client";

import { useEffect, useState } from "react";
import { Link2, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

interface AdLinkRow {
  id: string;
  label: string;
  platform: string;
  fullUrl: string;
}

export function AdTrackingLinks() {
  const [links, setLinks] = useState<AdLinkRow[]>([]);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tracking/links")
      .then((r) => r.json())
      .then((d) => setLinks(d.links || []))
      .catch(() => {});
  }, []);

  async function copyUrl(id: string, url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right hover:bg-[var(--background)] transition-colors"
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <Link2 className="h-4 w-4 text-[var(--primary)]" />
          روابط إعلانات التتبع (سناب · إنستا · تيك توك)
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-[var(--muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--muted)]" />}
      </button>

      {open && (
        <div className="border-t border-[var(--border)] px-4 py-3 space-y-3">
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            انسخ الرابط وضعه في إعلانك. عند دخول العميل من الرابط تُسجَّل المصدر والحملة تلقائياً في عمود «بيانات التتبع». يمكنك تعديل المعاملات لاحقاً عند إرسال الروابط النهائية.
          </p>
          {links.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <div className="min-w-[100px]">
                <p className="text-sm font-medium">{row.label}</p>
                <p className="text-[11px] text-[var(--muted)]">{row.platform}</p>
              </div>
              <code
                dir="ltr"
                className="flex-1 min-w-0 text-[11px] text-[var(--muted)] truncate bg-white rounded-lg px-2 py-1 border border-gray-100"
              >
                {row.fullUrl}
              </code>
              <button
                type="button"
                onClick={() => copyUrl(row.id, row.fullUrl)}
                className="inline-flex items-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 shrink-0"
              >
                {copied === row.id ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    تم النسخ
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    نسخ
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
