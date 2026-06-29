"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Package,
  ShoppingCart,
  CreditCard,
  AlertTriangle,
  Stethoscope,
  Box,
  Banknote,
  Smartphone,
  Building2,
  Pencil,
  Trash2,
} from "lucide-react";
import { TranslatedPageHeader } from "@/components/dashboard/TranslatedPageHeader";
import { SarAmount, formatSar } from "@/components/ui/SarAmount";
import { ProductTypeModal } from "./ProductTypeModal";
import { AddProductModal } from "./AddProductModal";
import type { StorePayment, StoreProduct } from "@/lib/store-types";
import type { StoreProductType } from "@/lib/store-types";
import { cn } from "@/lib/utils";

interface StoreStats {
  productsCount: number;
  ordersCount: number;
  totalSales: number;
  lowStock: number;
  pendingPayments: number;
}

const PAYMENT_METHOD: Record<string, { label: string; icon: typeof CreditCard }> = {
  card: { label: "بطاقة", icon: CreditCard },
  cash: { label: "نقدي", icon: Banknote },
  transfer: { label: "تحويل", icon: Building2 },
  apple_pay: { label: "Apple Pay", icon: Smartphone },
};

const PAYMENT_STATUS: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  refunded: "bg-red-50 text-red-700",
};

export function StoreView() {
  const [tab, setTab] = useState<"overview" | "products">("overview");
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [payments, setPayments] = useState<StorePayment[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [productType, setProductType] = useState<StoreProductType>("service");

  const load = useCallback(() => {
    fetch("/api/store")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats);
        setPayments(d.payments || []);
        setProducts(d.products || []);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleSelectType(type: StoreProductType) {
    setProductType(type);
    setTypeModalOpen(false);
    setAddModalOpen(true);
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("حذف هذا المنتج؟")) return;
    await fetch(`/api/store/products/${id}`, { method: "DELETE" });
    load();
  }

  const statCards = stats
    ? [
        { label: "المنتجات", value: stats.productsCount, icon: Package, color: "text-sky-600 bg-sky-50" },
        { label: "الطلبات", value: stats.ordersCount, icon: ShoppingCart, color: "text-violet-600 bg-violet-50" },
        { label: "المبيعات", value: formatSar(stats.totalSales), icon: CreditCard, color: "text-emerald-600 bg-emerald-50", isText: true },
        { label: "مخزون منخفض", value: stats.lowStock, icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
      ]
    : [];

  return (
    <div>
      <TranslatedPageHeader titleKey="pages.store.title" descriptionKey="pages.store.desc">
        <button
          type="button"
          onClick={() => setTypeModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-500 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          منتج جديد
        </button>
      </TranslatedPageHeader>

      <div className="mb-6 flex rounded-xl border border-[var(--border)] bg-[var(--background)] p-1 w-fit">
        {[
          { key: "overview" as const, label: "نظرة عامة والمدفوعات", icon: CreditCard },
          { key: "products" as const, label: "المنتجات", icon: Package },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === key ? "bg-[var(--card)] shadow-sm text-[var(--foreground)]" : "text-[var(--muted)]"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
                  <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl mb-2", s.color.split(" ").slice(1).join(" "))}>
                    <Icon className={cn("h-4 w-4", s.color.split(" ")[0])} />
                  </div>
                  <p className="text-2xl font-bold text-[var(--foreground)]">
                    {"isText" in s && s.isText ? s.value : s.value}
                  </p>
                  <p className="text-sm text-[var(--muted)]">{s.label}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
            <div className="border-b border-[var(--border)] px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[var(--primary)]" />
                المدفوعات الأخيرة
              </h2>
              {stats && stats.pendingPayments > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2.5 py-1">
                  {stats.pendingPayments} معلّقة
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--background)] text-[var(--muted)]">
                    <th className="px-4 py-3 text-right font-medium">رقم الطلب</th>
                    <th className="px-4 py-3 text-right font-medium">العميل</th>
                    <th className="px-4 py-3 text-right font-medium">المبلغ</th>
                    <th className="px-4 py-3 text-right font-medium">طريقة الدفع</th>
                    <th className="px-4 py-3 text-right font-medium">الحالة</th>
                    <th className="px-4 py-3 text-right font-medium">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const method = PAYMENT_METHOD[p.method] || PAYMENT_METHOD.card;
                    const MethodIcon = method.icon;
                    return (
                      <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--background)]/50">
                        <td className="px-4 py-3 font-mono text-xs" dir="ltr">{p.orderId}</td>
                        <td className="px-4 py-3 font-medium">{p.clientName}</td>
                        <td className="px-4 py-3"><SarAmount amount={p.amount} /></td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-[var(--muted)]">
                            <MethodIcon className="h-3.5 w-3.5" />
                            {method.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", PAYMENT_STATUS[p.status])}>
                            {p.status === "paid" ? "مدفوع" : p.status === "pending" ? "معلّق" : "مسترد"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[var(--muted)] text-xs">
                          {new Date(p.createdAt).toLocaleDateString("ar-SA")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className={cn("flex h-36 items-center justify-center relative", p.type === "service" ? "bg-sky-50 dark:bg-sky-950/20" : "bg-violet-50 dark:bg-violet-950/20")}>
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.nameAr} className="h-full w-full object-cover" />
                ) : p.type === "service" ? (
                  <Stethoscope className="h-12 w-12 text-sky-500 opacity-40" />
                ) : (
                  <Box className="h-12 w-12 text-violet-500 opacity-40" />
                )}
                <span className={cn("absolute top-2 right-2 text-[10px] font-bold rounded-full px-2 py-0.5", p.type === "service" ? "bg-sky-200 text-sky-800" : "bg-violet-200 text-violet-800")}>
                  {p.type === "service" ? "خدمة" : "باقة"}
                </span>
              </div>
              <div className="p-4">
                <span className="text-xs text-[var(--muted)]">{p.category}</span>
                <h3 className="font-semibold mt-0.5">{p.nameAr || p.nameEn}</h3>
                {p.nameEn && p.nameAr && (
                  <p className="text-xs text-[var(--muted)] mt-0.5" dir="ltr">{p.nameEn}</p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <SarAmount amount={p.price} size="lg" />
                    {p.compareAtPrice > p.price && (
                      <p className="text-xs text-[var(--muted)] line-through mt-0.5">{formatSar(p.compareAtPrice)}</p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--background)]">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => handleDeleteProduct(p.id)} className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {p.requiresAppointment && (
                  <p className="text-[10px] text-[var(--muted)] mt-2 flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" />
                    يتطلب حجز موعد
                  </p>
                )}
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-[var(--border)] p-12 text-center text-[var(--muted)]">
              لا توجد منتجات. اضغط «منتج جديد» للبدء
            </div>
          )}
        </div>
      )}

      <ProductTypeModal
        open={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
        onSelect={handleSelectType}
      />
      <AddProductModal
        open={addModalOpen}
        type={productType}
        onClose={() => setAddModalOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
