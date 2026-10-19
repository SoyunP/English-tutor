import { loginAsStudent, loginAsTeacher } from "@/lib/auth/actions";
import { isDemoMode, DEMO_WARNING } from "@/lib/mode";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const demo = isDemoMode();

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center gap-6 px-4 py-12">
      <div className="animate-fade-up text-center">
        <h1 className="font-display text-5xl text-primary">English Lab</h1>
        <p className="mt-2 text-muted-foreground">Your English journey, one day at a time.</p>
      </div>

      <Card className="animate-fade-up space-y-4">
        <CardTitle>로그인</CardTitle>
        <CardDescription>
          한 명의 학생과 교사를 위한 비공개 영어 학습 플랫폼입니다.
          NE능률 김기택 Middle School English 1 (Lessons 5–8) 범위 연습 자료를 제공합니다.
        </CardDescription>

        {demo ? (
          <div className="space-y-3">
            <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">{DEMO_WARNING}</p>
            <form action={loginAsStudent}>
              <Button type="submit" className="w-full" size="lg">
                학생으로 시작하기 — 기은
              </Button>
            </form>
            <form action={loginAsTeacher}>
              <Button type="submit" variant="secondary" className="w-full" size="lg">
                교사로 시작하기 — 박선생님
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              데모 계정: student@englishlab.local / teacher@englishlab.local
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Supabase Auth가 설정되어 있습니다. 이메일 로그인을 구성한 뒤 이용하세요.
          </p>
        )}
      </Card>
    </main>
  );
}
