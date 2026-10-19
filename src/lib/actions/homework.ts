"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import {
  saveAnswer,
  startAttempt,
  submitAttempt,
  submitRemediation,
  toggleDifficultWord,
} from "@/lib/repository";

export async function startHomeworkAction(dayNumber: number) {
  const user = await requireUser("student");
  await startAttempt(user, dayNumber);
  revalidatePath(`/student/practice/${dayNumber}`);
  return { ok: true as const };
}

export async function saveAnswerAction(input: {
  attemptId: string;
  questionId: string;
  studentAnswer: string;
  studentReasoning: string;
}) {
  const user = await requireUser("student");
  await saveAnswer(
    user,
    input.attemptId,
    input.questionId,
    input.studentAnswer,
    input.studentReasoning
  );
  return { ok: true as const };
}

export async function submitHomeworkAction(attemptId: string) {
  const user = await requireUser("student");
  try {
    await submitAttempt(user, attemptId);
    revalidatePath("/student");
    return { ok: true as const };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ERROR";
    if (msg.startsWith("INCOMPLETE:")) {
      return {
        ok: false as const,
        incomplete: JSON.parse(msg.replace("INCOMPLETE:", "")) as {
          questionId: string;
          order: number;
          missing: ("answer" | "reasoning")[];
        }[],
      };
    }
    throw e;
  }
}

export async function submitRemediationAction(input: {
  attemptId: string;
  conceptId: string;
  remediationQuestionId: string;
  studentAnswer: string;
  studentReasoning: string;
}) {
  const user = await requireUser("student");
  await submitRemediation(
    user,
    input.attemptId,
    input.conceptId,
    input.remediationQuestionId,
    input.studentAnswer,
    input.studentReasoning
  );
  revalidatePath("/student");
  return { ok: true as const };
}

export async function toggleDifficultWordAction(vocabId: string) {
  const user = await requireUser("student");
  await toggleDifficultWord(user, vocabId);
  revalidatePath("/student");
  return { ok: true as const };
}
