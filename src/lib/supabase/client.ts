import { createBrowserClient } from "@supabase/ssr";
import { isDemoMode } from "@/lib/mode";

export function createClient() {
  if (isDemoMode()) {
    throw new Error("Supabase client is unavailable in demo mode.");
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
