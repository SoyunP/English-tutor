export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_FORCE_DEMO === "true") return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url.trim() === "" || key.trim() === "";
}

export const DEMO_WARNING =
  "데모 모드: 서버 측 JSON 파일(.demo-data)에 저장됩니다. 프로덕션용 보안·불변 채점 저장소가 아닙니다. Supabase를 연결하면 정식 RLS 기반 저장을 사용합니다.";
