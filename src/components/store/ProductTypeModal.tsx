"use client";

import { Stethoscope, Package } from "lucide-react";
import type { StoreProductType } from "@/lib/store-types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (type: StoreProductType) => void;
}

export function ProductTypeModal({ open, onClose, onSelect }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--card)] shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-[var(--foreground)]">اختر نوع المنتج</h2>
          <p className="text-sm text-[var(--muted)] mt-1">حدد نوع المنتج الذي تريد إضافته</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onSelect("service")}
            className="flex flex-col items-center gap-4 rounded-2xl border-2 border-sky-200 bg-sky-50/80 dark:bg-sky-950/20 p-8 hover:border-sky-400 hover:shadow-md transition-all"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Stethoscope className="h-8 w-8 text-sky-600" />
            </div>
            <span className="font-bold text-[var(--foreground)]">خدمة</span>
          </button>
          <button
            type="button"
            onClick={() => onSelect("package")}
            className="flex flex-col items-center gap-4 rounded-2xl border-2 border-violet-200 bg-violet-50/80 dark:bg-violet-950/20 p-8 hover:border-violet-400 hover:shadow-md transition-all"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Package className="h-8 w-8 text-violet-600" />
            </div>
            <span className="font-bold text-[var(--foreground)]">باقة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
