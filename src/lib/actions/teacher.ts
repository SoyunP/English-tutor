"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import {
  authorizeRetake,
  buildProgressCsv,
  getTeacherOverview,
  saveTeacherReview,
  setAssignmentUnlocked,
} from "@/lib/repository";
import type { UnderstandingLabel } from "@/lib/types";

export async function unlockAssignmentAction(dayNumber: number, unlocked: boolean) {
  await requireUser("teacher");
  await setAssignmentUnlocked(dayNumber, unlocked);
  revalidatePath("/teacher");
  revalidatePath("/student");
}

export async function authorizeRetakeAction(attemptId: string) {
  await requireUser("teacher");
  await authorizeRetake(attemptId);
  revalidatePath("/teacher");
}

export async function saveReviewAction(input: {
  attemptId: string;
  questionId: string;
  understandingLabel: UnderstandingLabel;
  teacherFeedback: string;
}) {
  const teacher = await requireUser("teacher");
  await saveTeacherReview(
    teacher,
    input.attemptId,
    input.questionId,
    input.understandingLabel,
    input.teacherFeedback
  );
  revalidatePath("/teacher");
}

export async function exportCsvAction() {
  const teacher = await requireUser("teacher");
  const { store, student } = await getTeacherOverview();
  if (!student) return { csv: "" };
  void teacher;
  return { csv: buildProgressCsv(store, student.id) };
}
