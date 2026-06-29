import { cn } from "@/lib/utils";

export function TrackingTags({ tags }: { tags: string[] }) {
  if (!tags.length) {
    return <span className="text-xs text-[var(--muted)]">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1 max-w-[220px]">
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "inline-flex rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-800"
          )}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
