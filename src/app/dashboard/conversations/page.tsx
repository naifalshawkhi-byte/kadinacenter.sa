"use client";

import { useState } from "react";
import { TranslatedPageHeader } from "@/components/dashboard/TranslatedPageHeader";
import { conversations } from "@/lib/data";
import { getInitials } from "@/lib/utils";
import { Send, Search } from "lucide-react";

export default function ConversationsPage() {
  const [selected, setSelected] = useState(conversations[0]);

  return (
    <div>
      <TranslatedPageHeader titleKey="pages.conversations.title" descriptionKey="pages.conversations.desc" />

      <div className="flex h-[calc(100vh-12rem)] rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
        <div className="w-80 border-l border-[var(--border)] flex flex-col">
          <div className="p-3 border-b border-[var(--border)]">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                placeholder="بحث في المحادثات..."
                className="w-full rounded-xl border border-[var(--border)] py-2 pr-10 pl-3 text-sm"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSelected(c)}
                  className={`w-full flex items-center gap-3 p-4 text-right hover:bg-[var(--background)] ${
                    selected?.id === c.id ? "bg-[var(--primary-light)]" : ""
                  }`}
                >
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                      {getInitials(c.clientName)}
                    </div>
                    {c.unread > 0 && (
                      <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-medium truncate">{c.clientName}</span>
                      <span className="text-xs text-[var(--muted)]">{c.time}</span>
                    </div>
                    <p className="text-sm text-[var(--muted)] truncate">{c.lastMessage}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 flex flex-col">
          {selected && (
            <>
              <div className="border-b border-[var(--border)] px-4 py-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                  {getInitials(selected.clientName)}
                </div>
                <div>
                  <p className="font-semibold">{selected.clientName}</p>
                  <p className="text-sm text-[var(--muted)]" dir="ltr">{selected.phone}</p>
                </div>
              </div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-[#e5ddd5]/30">
                <div className="mr-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-white px-4 py-2 shadow-sm text-sm">
                  السلام عليكم، أريد حجز موعد لجلسة هيدرافيشل
                </div>
                <div className="ml-auto max-w-[75%] rounded-2xl rounded-tl-sm bg-[#dcf8c6] px-4 py-2 shadow-sm text-sm">
                  وعليكم السلام! أهلاً بك. متى يناسبك الموعد؟
                </div>
                <div className="mr-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-white px-4 py-2 shadow-sm text-sm">
                  {selected.lastMessage}
                </div>
              </div>
              <div className="border-t border-[var(--border)] p-3 flex gap-2">
                <input
                  placeholder="اكتب رسالة..."
                  className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm"
                />
                <button className="rounded-xl bg-emerald-600 px-4 py-2.5 text-white hover:bg-emerald-700">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
