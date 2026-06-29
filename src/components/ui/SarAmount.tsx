export function SarSymbol({ className }: { className?: string }) {
  return (
    <span className={className} aria-label="ريال سعودي">
      &#xE900;
    </span>
  );
}

/** Saudi Riyal — uses Unicode Rial sign (U+20C1) where supported, falls back to ر.س */
export function formatSar(amount: number, opts?: { decimals?: number }): string {
  const decimals = opts?.decimals ?? (Number.isInteger(amount) ? 0 : 2);
  const formatted = amount.toLocaleString("ar-SA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formatted} ر.س`;
}

export function SarAmount({
  amount,
  className,
  size = "md",
}: {
  amount: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg" ? "text-lg font-bold" : size === "sm" ? "text-xs" : "text-sm font-semibold";

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClass} ${className ?? ""}`} dir="ltr">
      <span className="text-[var(--primary)] font-bold">&#x20C1;</span>
      <span>{amount.toLocaleString("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
      <span className="text-[var(--muted)] text-[0.85em] font-normal">ر.س</span>
    </span>
  );
}
