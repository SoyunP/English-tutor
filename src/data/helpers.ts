import type { QuestionOption } from "@/lib/types";

export const CIRCLED = ["①", "②", "③", "④", "⑤"] as const;

export function opts(...texts: string[]): QuestionOption[] {
  return texts.map((text, i) => ({ label: CIRCLED[i], text }));
}

export const TEXTBOOK_NOTE =
  "연습 자료(Practice Material) — NE능률 김기택 Middle School English 1 Lessons 5–8 범위에 맞춘 원작 학습 자료입니다. 교과서 원문을 복제하지 않았습니다.";

export const PROVISIONAL_NOTE =
  "잠정 자료(Provisional) — Lessons 6–8 문법 세부 항목은 교사 확인 후 교체할 수 있습니다.";
