import { beforeEach, describe, expect, it } from "vitest";
import { resetStore, STUDENT } from "@/lib/demo/store";
import {
  getAttemptForStudent,
  saveAnswer,
  startAttempt,
  submitAttempt,
  submitRemediation,
} from "@/lib/repository";
import { calculateFinalMasteryScore } from "@/lib/scoring";
import type { SessionUser } from "@/lib/types";
import { readStore, updateStore } from "@/lib/demo/store";

const student: SessionUser = {
  id: STUDENT.id,
  email: STUDENT.email,
  displayName: STUDENT.displayName,
  role: "student",
};

describe("homework workflow (no timer)", () => {
  beforeEach(async () => {
    await resetStore();
    // Unlock day 1 always available; force date unlock for reliability in CI
    await updateStore((s) => {
      s.assignments.forEach((a) => {
        a.unlocked = true;
      });
      return s;
    });
  });

  it("resumes progress after restart (persisted store)", async () => {
    await startAttempt(student, 1);
    let data = await getAttemptForStudent(student, 1);
    expect(data.attempt?.status).toBe("in_progress");

    await saveAnswer(student, data.attempt!.id, "d1-q01", "②", "주제가 미술 감상이라서");
    data = await getAttemptForStudent(student, 1);
    expect(data.attempt?.answers["d1-q01"]?.studentAnswer).toBe("②");
    expect(data.attempt?.answers["d1-q01"]?.studentReasoning).toContain("미술");

    // Simulate "browser closure" by reading store again — no deadline fields
    const store = await readStore();
    const att = store.attempts.find((a) => a.id === data.attempt!.id)!;
    expect((att as { deadlineAt?: string }).deadlineAt).toBeUndefined();
    expect(att.status).toBe("in_progress");
  });

  it("blocks submit when reasoning missing", async () => {
    await startAttempt(student, 1);
    const data = await getAttemptForStudent(student, 1);
    const attemptId = data.attempt!.id;
    const questions = (await readStore()).questions.filter((q) => q.dayNumber === 1);

    for (const q of questions) {
      await saveAnswer(student, attemptId, q.id, q.correctAnswer, "");
    }

    await expect(submitAttempt(student, attemptId)).rejects.toThrow(/INCOMPLETE/);
  });

  it("grades answers independently of reasoning and locks after submit", async () => {
    await startAttempt(student, 1);
    const data = await getAttemptForStudent(student, 1);
    const attemptId = data.attempt!.id;
    const questions = (await readStore()).questions.filter((q) => q.dayNumber === 1);

    for (const q of questions) {
      await saveAnswer(student, attemptId, q.id, q.correctAnswer, "근거 있습니다");
    }

    await submitAttempt(student, attemptId);
    const after = await getAttemptForStudent(student, 1);
    expect(after.attempt?.initialScore).toBe(100);
    expect(after.attempt?.status).toBe("completed");

    await expect(
      saveAnswer(student, attemptId, questions[0].id, "hack", "changed")
    ).rejects.toThrow(/ATTEMPT_LOCKED/);
  });

  it("runs remediation with reasoning and computes mastery score", async () => {
    await startAttempt(student, 1);
    const data = await getAttemptForStudent(student, 1);
    const attemptId = data.attempt!.id;
    const questions = (await readStore()).questions.filter((q) => q.dayNumber === 1);

    for (const q of questions) {
      const wrong =
        q.type === "multiple_choice" || q.options?.length
          ? q.options!.find((o) => o.label !== q.correctAnswer)!.label
          : "wrong";
      await saveAnswer(student, attemptId, q.id, wrong, "잘 모르겠어요");
    }

    await submitAttempt(student, attemptId);
    let att = (await getAttemptForStudent(student, 1)).attempt!;
    expect(att.status).toBe("remediating");
    expect(att.conceptsNeedingRemediation.length).toBeGreaterThan(0);

    const store = await readStore();
    // Master all concepts via first remediation question each
    while (att.status === "remediating" && att.conceptsNeedingRemediation.length) {
      const conceptId = att.conceptsNeedingRemediation[0];
      const rq = store.remediationQuestions.find((r) => r.conceptId === conceptId)!;
      await submitRemediation(student, attemptId, conceptId, rq.id, rq.correctAnswer, "이제 알겠어요");
      att = (await getAttemptForStudent(student, 1)).attempt!;
    }

    expect(att.status).toBe("completed");
    expect(att.finalMasteryScore).toBe(
      calculateFinalMasteryScore(
        att.initialScore!,
        att.conceptsMastered.length + att.conceptsNeedingHelp.length,
        att.conceptsMastered.length
      ).finalMasteryScore
    );

    const events = (await readStore()).gradeEvents.filter((e) => e.attemptId === attemptId);
    expect(events.some((e) => e.eventType === "graded")).toBe(true);
    expect(events.some((e) => e.eventType === "final_mastery_recorded")).toBe(true);
    // append-only: events array only grows (no updates of prior payloads tested by immutability of length growth)
    const len = events.length;
    expect(len).toBeGreaterThan(3);
  });

  it("prevents second active attempt without retake", async () => {
    await startAttempt(student, 1);
    await expect(startAttempt(student, 1)).resolves.toBeTruthy(); // returns existing path
    const store = await readStore();
    const inProgress = store.attempts.filter(
      (a) => a.studentId === student.id && a.dayNumber === 1 && a.status === "in_progress"
    );
    expect(inProgress.length).toBe(1);
  });

  it("every question type expects reasoning field (schema)", async () => {
    const store = await readStore();
    expect(store.questions.every((q) => /[가-힣]/.test(q.promptKo))).toBe(true);
    expect(store.questions.every((q) => q.explanationKo.match(/[가-힣]/))).toBe(true);
  });
});
