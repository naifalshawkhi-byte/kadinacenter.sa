"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Building2,
  Users,
  Briefcase,
  Stethoscope,
  Target,
  UserCog,
  Globe,
  Image,
  Search,
  FileText,
  Link2,
  Wand2,
  ChevronDown,
  Plus,
  Pencil,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ClinicSectionId } from "@/lib/clinic-types";
import { cn } from "@/lib/utils";
import { ReadyBadge, YellowButton } from "./clinic-ui";
import { SettingsPanel } from "./SettingsPanel";
import { ServicesPanel } from "./ServicesPanel";
import { DoctorsPanel } from "./DoctorsPanel";
import { SourcesPanel } from "./SourcesPanel";

interface Overview {
  counts: {
    branches: number;
    staff: number;
    services: number;
    doctors: number;
    sources: number;
    staffRules: number;
    websitePages: number;
    mediaFiles: number;
  };
  progress: { completed: number; total: number; percent: number };
}

interface CardDef {
  id: ClinicSectionId;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  borderColor: string;
  iconBg: string;
  countLabel?: (c: Overview["counts"]) => string;
  actionLabel: string;
  actionType: "edit" | "add" | "manage" | "configure";
  ready?: boolean;
}

const CARDS: CardDef[] = [
  {
    id: "settings",
    title: "الإعدادات",
    subtitle: "المعلومات الأساسية والهوية",
    icon: Settings,
    borderColor: "border-t-teal-500",
    iconBg: "bg-teal-50 text-teal-600",
    actionLabel: "تعديل",
    actionType: "edit",
    ready: true,
  },
  {
    id: "staff",
    title: "الموظفين",
    subtitle: "أعضاء الفريق",
    icon: Users,
    borderColor: "border-t-violet-500",
    iconBg: "bg-violet-50 text-violet-600",
    countLabel: (c) => `${c.staff} موظف`,
    actionLabel: "إدارة",
    actionType: "manage",
    ready: true,
  },
  {
    id: "services",
    title: "الخدمات",
    subtitle: "العلاجات المقدمة",
    icon: Briefcase,
    borderColor: "border-t-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-600",
    countLabel: (c) => `${c.services} خدمة`,
    actionLabel: "إضافة",
    actionType: "add",
    ready: true,
  },
  {
    id: "doctors",
    title: "الأطباء",
    subtitle: "الطاقم الطبي",
    icon: Stethoscope,
    borderColor: "border-t-cyan-500",
    iconBg: "bg-cyan-50 text-cyan-600",
    countLabel: (c) => `${c.doctors} طبيب`,
    actionLabel: "إضافة",
    actionType: "add",
    ready: true,
  },
  {
    id: "sources",
    title: "مصادر العملاء",
    subtitle: "قنوات التسويق",
    icon: Target,
    borderColor: "border-t-orange-500",
    iconBg: "bg-orange-50 text-orange-600",
    countLabel: (c) => `${c.sources} مصدر`,
    actionLabel: "إضافة",
    actionType: "add",
    ready: true,
  },
  {
    id: "staff-distribution",
    title: "توزيع الموظفين",
    subtitle: "قواعد التوزيع التلقائي",
    icon: UserCog,
    borderColor: "border-t-pink-500",
    iconBg: "bg-pink-50 text-pink-600",
    countLabel: (c) => `${c.staffRules} قاعدة`,
    actionLabel: "تكوين",
    actionType: "configure",
    ready: false,
  },
  {
    id: "website",
    title: "الموقع",
    subtitle: "إدارة الموقع الإلكتروني",
    icon: Globe,
    borderColor: "border-t-indigo-500",
    iconBg: "bg-indigo-50 text-indigo-600",
    countLabel: (c) => `${c.websitePages} صفحة`,
    actionLabel: "إدارة",
    actionType: "manage",
    ready: false,
  },
  {
    id: "media",
    title: "مكتبة الوسائط",
    subtitle: "الصور والملفات",
    icon: Image,
    borderColor: "border-t-amber-500",
    iconBg: "bg-amber-50 text-amber-600",
    countLabel: (c) => `${c.mediaFiles} ملف`,
    actionLabel: "إدارة",
    actionType: "manage",
    ready: false,
  },
  {
    id: "seo",
    title: "SEO والتحليلات",
    subtitle: "البحث والتتبع",
    icon: Search,
    borderColor: "border-t-lime-500",
    iconBg: "bg-lime-50 text-lime-600",
    actionLabel: "تكوين",
    actionType: "configure",
    ready: false,
  },
  {
    id: "legal",
    title: "القانونية",
    subtitle: "الخصوصية والشروط",
    icon: FileText,
    borderColor: "border-t-slate-500",
    iconBg: "bg-slate-100 text-slate-600",
    actionLabel: "تعديل",
    actionType: "edit",
    ready: false,
  },
  {
    id: "domain",
    title: "النطاق",
    subtitle: "إعداد النطاق المخصص",
    icon: Link2,
    borderColor: "border-t-rose-500",
    iconBg: "bg-rose-50 text-rose-600",
    actionLabel: "تكوين",
    actionType: "configure",
    ready: false,
  },
];

const PROGRESS_SECTIONS = [
  "الإعدادات",
  "الفروع",
  "الموظفين",
  "الخدمات",
  "الأطباء",
  "مصادر العملاء",
  "توزيع الموظفين",
  "الموقع",
  "القوائم",
  "SEO",
  "النطاق",
];

function ActionIcon({ type }: { type: CardDef["actionType"] }) {
  if (type === "add") return <Plus className="h-3.5 w-3.5" />;
  if (type === "edit") return <Pencil className="h-3.5 w-3.5" />;
  return null;
}

export function ClinicCenterView() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [activeSection, setActiveSection] = useState<ClinicSectionId | null>(null);

  const load = useCallback(() => {
    fetch("/api/clinic")
      .then((r) => r.json())
      .then(setOverview);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openSection(id: ClinicSectionId, add = false) {
    if (id === "staff") {
      router.push("/dashboard/employees");
      return;
    }
    void add;
    setActiveSection(id);
  }

  function closeSection() {
    setActiveSection(null);
    load();
  }

  if (activeSection === "settings") {
    return <SettingsPanel onClose={closeSection} onBack={closeSection} />;
  }
  if (activeSection === "services") {
    return (
      <ServicesPanel onClose={closeSection} onBack={closeSection} onChanged={load} />
    );
  }
  if (activeSection === "doctors") {
    return (
      <DoctorsPanel onClose={closeSection} onBack={closeSection} onChanged={load} />
    );
  }
  if (activeSection === "sources") {
    return (
      <SourcesPanel onClose={closeSection} onBack={closeSection} onChanged={load} />
    );
  }

  const progress = overview?.progress ?? { completed: 0, total: 11, percent: 0 };
  const counts = overview?.counts ?? {
    branches: 0,
    staff: 0,
    services: 0,
    doctors: 0,
    sources: 0,
    staffRules: 0,
    websitePages: 0,
    mediaFiles: 0,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">مركز العيادة</h1>

      {/* شريط التقدم */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-sm text-[var(--muted)]">
              {progress.completed} من {progress.total} أقسام مكتملة{" "}
              <span className="font-bold text-[var(--foreground)]">{progress.percent}%</span>
            </p>
            <div className="mt-3 h-3 w-full max-w-xl rounded-full bg-[var(--background)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
          <YellowButton>
            <Wand2 className="h-4 w-4" />
            بدء معالج الإعداد
          </YellowButton>
        </div>
        <div className="flex flex-wrap gap-2">
          {PROGRESS_SECTIONS.map((label, i) => {
            const done = i < progress.completed;
            return (
              <span
                key={label}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border",
                  done
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30"
                    : "bg-[var(--background)] text-[var(--muted)] border-[var(--border)]"
                )}
              >
                {done && <CheckCircle2 className="h-3 w-3" />}
                {label}
              </span>
            );
          })}
        </div>
      </div>

      {/* بطاقات الأقسام */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.filter((c) => c.id !== "branches").map((card) => {
          const Icon = card.icon;
          const countText = card.countLabel?.(counts);
          return (
            <div
              key={card.id}
              className={cn(
                "rounded-2xl border border-[var(--border)] border-t-4 bg-[var(--card)] shadow-sm overflow-hidden flex flex-col",
                card.borderColor
              )}
            >
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", card.iconBg)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-[var(--muted)] rotate-180" />
                </div>
                <button
                  type="button"
                  onClick={() => openSection(card.id)}
                  className="text-right w-full group"
                >
                  <h3 className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{card.subtitle}</p>
                </button>
                {countText && (
                  <p className="text-sm text-[var(--muted)] mt-3">{countText}</p>
                )}
                {card.ready !== false && (
                  <div className="mt-2">
                    <ReadyBadge />
                  </div>
                )}
              </div>
              <div className="border-t border-[var(--border)] px-5 py-3">
                <button
                  type="button"
                  onClick={() =>
                    openSection(
                      card.id,
                      card.actionType === "add"
                    )
                  }
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                >
                  <ActionIcon type={card.actionType} />
                  {card.actionLabel === "إضافة" ? "+ " : ""}
                  {card.actionLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
