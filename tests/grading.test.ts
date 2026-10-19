import { describe, expect, it } from "vitest";
import { gradeAttempt, gradeObjectiveAnswer, snapshotQuestion } from "@/lib/grading";
import { answersMatch, isReasoningComplete, normalizeAnswer } from "@/lib/normalization";
import { calculateFinalMasteryScore, calculateInitialScore } from "@/lib/scoring";
import { isAssignmentAvailable } from "@/lib/dates";
import type { AttemptAnswer, Question } from "@/lib/types";

const baseQ = (over: Partial<Question> & Pick<Question, "id" | "correctAnswer">): Question => ({
  dayNumber: 1,
  assignmentId: "assign-day-1",
  type: "multiple_choice",
  order: 1,
  points: 4,
  promptKo: "다음 빈칸에 들어갈 말로 가장 적절한 것은?",
  conceptId: "reflexive-agreement",
  conceptLabel: "재귀대명사 호응",
  difficulty: "easy",
  version: 1,
  explanationKo: "주어에 맞는 재귀대명사를 씁니다.",
  ...over,
});

describe("normalization", () => {
  it("normalizes whitespace", () => {
    expect(normalizeAnswer("  hello   world  ")).toBe("hello world");
  });

  it("matches accepted answers without fuzzy grammar pass", () => {
    expect(answersMatch("herself", "herself", [])).toBe(true);
    expect(answersMatch("Herself", "herself", [])).toBe(true);
    expect(answersMatch("himself", "herself", [])).toBe(false);
    expect(answersMatch("She made it.", "She made it", ["She made it."])).toBe(true);
  });

  it("requires nonempty reasoning", () => {
    expect(isReasoningComplete("  ")).toBe(false);
    expect(isReasoningComplete("주어가 여성이라서")).toBe(true);
  });
});

describe("scoring", () => {
  it("calculates initial score", () => {
    expect(calculateInitialScore(70, 100)).toBe(70);
  });

  it("calculates final mastery score with remediation", () => {
    const r = calculateFinalMasteryScore(70, 1, 1);
    expect(r.remediationMasteryRate).toBe(100);
    expect(r.finalMasteryScore).toBe(76);
  });

  it("equals initial when no remediation", () => {
    expect(calculateFinalMasteryScore(85, 0, 0).finalMasteryScore).toBe(85);
  });
});

describe("grading", () => {
  it("grades MCQ by circled label", () => {
    const snap = snapshotQuestion(
      baseQ({
        id: "q1",
        correctAnswer: "②",
        options: [
          { label: "①", text: "a" },
          { label: "②", text: "b" },
        ],
      })
    );
    expect(gradeObjectiveAnswer(snap, "②").isCorrect).toBe(true);
    expect(gradeObjectiveAnswer(snap, "①").isCorrect).toBe(false);
  });

  it("does not let reasoning affect points", () => {
    const snap = snapshotQuestion(baseQ({ id: "q2", correctAnswer: "herself" }));
    const result = gradeObjectiveAnswer(snap, "herself");
    expect(result.pointsEarned).toBe(4);
    // reasoning is separate — grading function only sees answer
  });

  it("marks writing for teacher review when flagged", () => {
    const snap = snapshotQuestion(
      baseQ({ id: "q3", correctAnswer: "x", requiresTeacherReview: true, points: 6 })
    );
    const r = gradeObjectiveAnswer(snap, "anything");
    expect(r.pendingReview).toBe(true);
    expect(r.pointsEarned).toBe(0);
  });

  it("aggregates attempt grading", () => {
    const snaps = [
      snapshotQuestion(baseQ({ id: "a", correctAnswer: "①", points: 5 })),
      snapshotQuestion(baseQ({ id: "b", correctAnswer: "herself", points: 5, conceptId: "c2" })),
    ];
    const answers: Record<string, AttemptAnswer> = {
      a: { questionId: "a", studentAnswer: "①", studentReasoning: "이유", savedAt: "" },
      b: { questionId: "b", studentAnswer: "himself", studentReasoning: "이유", savedAt: "" },
    };
    const g = gradeAttempt(snaps, answers);
    expect(g.correctCount).toBe(1);
    expect(g.incorrectCount).toBe(1);
    expect(g.incorrectConceptIds).toContain("c2");
    expect(g.initialScore).toBe(50);
  });
});

describe("date unlock (no timer)", () => {
  it("locks future dates unless unlocked", () => {
    expect(isAssignmentAvailable("2026-10-20", "2026-10-16", false)).toBe(false);
    expect(isAssignmentAvailable("2026-10-20", "2026-10-16", true)).toBe(true);
    expect(isAssignmentAvailable("2026-10-16", "2026-10-16", false)).toBe(true);
  });
});

describe("korean exam wording", () => {
  it("uses korean stems in seeded-style prompts", () => {
    const q = baseQ({ id: "k", correctAnswer: "①" });
    expect(q.promptKo).toMatch(/[가-힣]/);
    expect(q.promptKo).not.toMatch(/^Which of the following/i);
  });
});
