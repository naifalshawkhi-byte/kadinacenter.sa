"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusLabels } from "@/lib/data";
import type { InquiryStatus } from "@/lib/types";

const OPTIONS: InquiryStatus[] = ["new", "followup", "booked", "attended", "failed"];

const triggerStyle: Record<InquiryStatus, string> = {
  new: "bg-sky-100 text-sky-700 border-sky-200",
  followup: "bg-amber-50 text-amber-700 border-amber-200",
  booked: "bg-emerald-50 text-emerald-700 border-emerald-200",
  attended: "bg-sky-100 text-sky-700 border-sky-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

interface Props {
  value: InquiryStatus;
  onChange: (value: InquiryStatus) => void;
}

export function StatusDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold min-w-[88px] justify-between transition-colors",
          triggerStyle[value] || triggerStyle.new
        )}
      >
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 opacity-70 transition-transform", open && "rotate-180")}
        />
        <span>{statusLabels[value] || "جديد"}</span>
      </button>

      {open && (
        <ul
          className="absolute z-50 top-full mt-1 right-0 min-w-[120px] rounded-lg border border-sky-200 bg-sky-50 py-1 shadow-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {OPTIONS.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-right px-3 py-2 text-sm font-medium transition-colors",
                  value === s
                    ? "bg-blue-500 text-white"
                    : "text-blue-600 hover:bg-blue-100"
                )}
              >
                {statusLabels[s]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
