"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  ArrowLeft,
  Check,
  Stethoscope,
  Phone,
  Loader2,
  Shield,
  Heart,
  Clock,
  Star,
  Sparkles,
} from "lucide-react";
import { useClinicBranding, ClinicLogo } from "@/components/providers/ClinicBrandingProvider";
import { CLINIC_PHONE, phoneTelHref } from "@/lib/site-config";

const highlights = [
  {
    icon: Sparkles,
    title: "تجربة سلسة",
    desc: "احجز موعدك أونلاين في دقائق — بدون انتظار أو إجراءات معقدة",
  },
  {
    icon: Heart,
    title: "رعاية متميزة",
    desc: "فريق طبي متخصص يهتم بك ويقدّم لك أفضل مستوى من الخدمة",
  },
  {
    icon: Shield,
    title: "خصوصية وأمان",
    desc: "بياناتك محفوظة بسرية تامة وفق أعلى معايير الأمان",
  },
  {
    icon: Clock,
    title: "مواعيد مرنة",
    desc: "اختر الوقت المناسب لك وسنتواصل معك للتأكيد",
  },
  {
    icon: Star,
    title: "خدمات متنوعة",
    desc: "مجموعة واسعة من الخدمات الطبية والتجميلية تحت سقف واحد",
  },
  {
    icon: Calendar,
    title: "متابعة شخصية",
    desc: "نتابع حجزك ونتواصل معك حتى تصل إلى العيادة بكل راحة",
  },
];

const steps = [
  { num: "١", title: "احجز موعدك", desc: "املأ نموذج الحجز باسمك ورقم جوالك والخدمة المطلوبة" },
  { num: "٢", title: "نتواصل معك", desc: "فريق العيادة يتواصل معك لتأكيد الموعد والتفاصيل" },
  { num: "٣", title: "زيارة العيادة", desc: "احضر في الموعد المحدد واستمتع بخدماتنا الطبية" },
];

interface BookInfo {
  services: string[];
  phone?: string;
}

export function LandingPage() {
  const { settings } = useClinicBranding();
  const [services, setServices] = useState<string[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const clinicName = settings.name || "العيادة";
  const tagline = settings.tagline || "";
  const description =
    settings.description?.trim() ||
    `${clinicName} — رعاية طبية وتجميلية متكاملة. احجز موعدك الآن بسهولة.`;

  useEffect(() => {
    fetch("/api/book/info", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: BookInfo) => setServices(d.services || []))
      .finally(() => setLoadingServices(false));
  }, []);

  const clinicPhone = settings.phone?.trim() || CLINIC_PHONE;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <ClinicLogo size="md" />
            <div>
              <span className="text-lg font-bold text-[var(--foreground)]">{clinicName}</span>
              {tagline && (
                <p className="text-xs text-[var(--muted)] hidden sm:block">{tagline}</p>
              )}
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--muted)]">
            <a href="#highlights" className="hover:text-[var(--primary)]">
              لماذا نحن
            </a>
            <a href="#services" className="hover:text-[var(--primary)]">
              الخدمات
            </a>
            <a href="#steps" className="hover:text-[var(--primary)]">
              كيف تحجز
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-dark)]"
            >
              احجز موعدك
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-bl from-[var(--primary-light)] to-transparent opacity-60" />
        <div className="relative mx-auto max-w-6xl text-center">
          {tagline && (
            <p className="mb-4 inline-block rounded-full bg-[var(--primary-light)] px-4 py-1 text-sm font-medium text-[var(--foreground)]">
              {tagline}
            </p>
          )}
          <h1 className="text-4xl font-bold leading-tight text-[var(--foreground)] lg:text-5xl">
            {clinicName}
            <br />
            <span className="text-[var(--primary)]">رعاية بأيدٍ خبيرة</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted)]">{description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white hover:bg-[var(--primary-dark)]"
            >
              احجز موعدك الآن
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <a
              href={phoneTelHref(clinicPhone)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--primary)] px-6 py-3 font-medium text-[var(--foreground)] hover:bg-[var(--primary-light)]"
            >
              <Phone className="h-5 w-5 text-[var(--primary)]" />
              {clinicPhone}
            </a>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-[var(--muted)]">
            {["حجز سريع", "فريق متخصص", "الرياض"].map((t) => (
              <span key={t} className="flex items-center gap-1">
                <Check className="h-4 w-4 text-[var(--primary)]" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="highlights" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-[var(--foreground)]">
            لماذا تختار {clinicName}؟
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[var(--muted)]">
            نقدّم لك تجربة حجز وعلاج مريحة من أول لحظة
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <f.icon className="h-7 w-7 text-[var(--primary)] mb-3" />
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="bg-[var(--card)] px-6 py-20 border-y border-[var(--border)]">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-[var(--foreground)] flex items-center justify-center gap-2">
            <Stethoscope className="h-8 w-8 text-[var(--primary)]" />
            خدماتنا
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[var(--muted)]">
            الخدمات المتوفرة في {clinicName}
          </p>
          {loadingServices ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : services.length === 0 ? (
            <p className="text-center text-[var(--muted)] py-12">
              لا توجد خدمات مضافة بعد — يمكن للأدمن إضافتها من إدارة العيادة
            </p>
          ) : (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] px-5 py-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)]">
                    <Stethoscope className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <span className="font-medium text-[var(--foreground)]">{service}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-10 text-center">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white hover:bg-[var(--primary-dark)]"
            >
              احجز إحدى خدماتنا
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="steps" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-[var(--foreground)]">
            كيف تحجز موعدك؟
          </h2>
          <p className="text-center mt-3 text-[var(--muted)]">٣ خطوات بسيطة</p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-2xl font-bold text-white">
                  {s.num}
                </div>
                <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--primary)] px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold lg:text-3xl">جاهز لحجز موعدك؟</h2>
          <p className="mt-3 opacity-90">فريق {clinicName} في انتظارك</p>
          <Link
            href="/book"
            className="mt-6 inline-block rounded-xl bg-white px-8 py-3 font-medium text-[var(--primary)] hover:bg-gray-100"
          >
            احجز موعدك اليوم
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] px-6 py-8 text-center text-sm text-[var(--muted)]">
        <p>© {new Date().getFullYear()} {clinicName}</p>
        <p className="mt-2" dir="ltr">
          <a href={phoneTelHref(clinicPhone)} className="hover:text-[var(--primary)]">
            {clinicPhone}
          </a>
        </p>
      </footer>
    </div>
  );
}
