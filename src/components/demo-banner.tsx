import { DEMO_WARNING, isDemoMode } from "@/lib/mode";

export function DemoBanner() {
  if (!isDemoMode()) return null;
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
      {DEMO_WARNING}
    </div>
  );
}
