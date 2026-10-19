"use client";

import { Flag } from "lucide-react";
import type { Question, QuestionOption } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function QuestionView({
  question,
  studentAnswer,
  studentReasoning,
  onAnswerChange,
  onReasoningChange,
  readOnly,
  flagged,
  onToggleFlag,
  showCorrectness,
}: {
  question: Pick<
    Question,
    "id" | "promptKo" | "type" | "options" | "passageHtml" | "conditions" | "points" | "order"
  > & { correctAnswer?: string };
  studentAnswer: string;
  studentReasoning: string;
  onAnswerChange?: (v: string) => void;
  onReasoningChange?: (v: string) => void;
  readOnly?: boolean;
  flagged?: boolean;
  onToggleFlag?: () => void;
  showCorrectness?: boolean;
}) {
  const isChoice = Boolean(question.options?.length);

  return (
    <div className="space-y-4 rounded-2xl border bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {question.order != null ? `${question.order}. ` : ""}
            {question.points ? `[${question.points}점]` : ""}
          </p>
          <h2 className="mt-1 text-base font-semibold leading-relaxed">{question.promptKo}</h2>
        </div>
        {onToggleFlag && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="검토 표시"
            onClick={onToggleFlag}
          >
            <Flag className={`h-4 w-4 ${flagged ? "fill-amber-500 text-amber-500" : ""}`} />
          </Button>
        )}
      </div>

      {question.passageHtml && (
        <div className="passage-box text-sm" dangerouslySetInnerHTML={{ __html: escapeToHtml(question.passageHtml) }} />
      )}

      {question.conditions?.length ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-3 text-sm">
          <p className="font-medium">&lt;조건&gt;</p>
          <ol className="mt-1 list-decimal pl-5">
            {question.conditions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium">학생 답안</p>
        {isChoice ? (
          <div className="space-y-2" role="radiogroup" aria-label="선택지">
            {question.options!.map((opt: QuestionOption) => (
              <label
                key={opt.label}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${
                  studentAnswer === opt.label ? "border-primary bg-accent/50" : "hover:bg-muted/50"
                } ${readOnly ? "pointer-events-none" : ""}`}
              >
                <input
                  type="radio"
                  className="mt-1"
                  name={`q-${question.id}`}
                  value={opt.label}
                  checked={studentAnswer === opt.label}
                  disabled={readOnly}
                  onChange={() => onAnswerChange?.(opt.label)}
                />
                <span>
                  <span className="mr-2 font-medium">{opt.label}</span>
                  {opt.text}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <textarea
            className="min-h-[88px] w-full rounded-xl border border-border bg-white p-3 text-sm focus-ring"
            value={studentAnswer}
            disabled={readOnly}
            onChange={(e) => onAnswerChange?.(e.target.value)}
            placeholder="답을 입력하세요."
          />
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={`reason-${question.id}`}>
          왜 그렇게 생각하나요?
        </label>
        <textarea
          id={`reason-${question.id}`}
          className="min-h-[100px] w-full rounded-xl border border-border bg-white p-3 text-sm focus-ring"
          value={studentReasoning}
          disabled={readOnly}
          onChange={(e) => onReasoningChange?.(e.target.value)}
          placeholder="이 답을 선택한 이유를 자유롭게 설명해 보세요."
        />
        <p className="text-xs text-muted-foreground">
          정답이라고 생각한 이유나 문법적 근거를 적어보세요.
        </p>
      </div>

      {showCorrectness && question.correctAnswer != null && (
        <p className="text-sm text-muted-foreground">정답: {question.correctAnswer}</p>
      )}
    </div>
  );
}

/** Preserve newlines and simple <u> tags from seed data; escape other HTML. */
function escapeToHtml(raw: string): string {
  const withMarks = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&lt;u&gt;/g, "<u>")
    .replace(/&lt;\/u&gt;/g, "</u>")
    .replace(/&lt;조건&gt;/g, "&lt;조건&gt;")
    .replace(/\n/g, "<br/>");
  return withMarks;
}
