import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  upcoming: "bg-muted text-muted-foreground",
  available: "bg-[#e8f5ee] text-[#067647]",
  in_progress: "bg-[#fff4e5] text-[#b54708]",
  submitted: "bg-[#e8eefb] text-[#175cd3]",
  needs_correction: "bg-[#fef3f2] text-[#b42318]",
  completed: "bg-[#e8f5ee] text-[#067647]",
  default: "bg-accent text-accent-foreground",
};

export function Badge({
  status,
  children,
  className,
}: {
  status?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        styles[status ?? "default"] ?? styles.default,
        className
      )}
    >
      {children}
    </span>
  );
}
