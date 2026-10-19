import { readStore, updateStore } from "@/lib/demo/store";
import { isDemoMode } from "@/lib/mode";
import { getSeoulDateString, isAssignmentAvailable } from "@/lib/dates";
import { gradeAttempt, snapshotQuestion } from "@/lib/grading";
import { calculateFinalMasteryScore } from "@/lib/scoring";
import { answersMatch, isAnswerComplete, isReasoningComplete } from "@/lib/normalization";
import type {
  AssignmentStatus,
  Attempt,
  GradeEvent,
  RemediationAttempt,
  SessionUser,
  TeacherReview,
  UnderstandingLabel,
} from "@/lib/types";

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function appendEvent(
  store: Awaited<ReturnType<typeof readStore>>,
  event: Omit<GradeEvent, "id">
) {
  store.gradeEvents.push({ ...event, id: newId("ge") });
}

export async function getDashboardData(user: SessionUser) {
  if (!isDemoMode()) {
    // Supabase path would go here; demo is the fully implemented path without credentials
    throw new Error("Supabase mode requires configuration. Use demo mode or set env vars.");
  }
  const store = await readStore();
  const today = getSeoulDateString();
  const attempts = store.attempts.filter((a) => a.studentId === user.id);

  const days = store.assignments.map((assignment) => {
    const attempt = attempts
      .filter((a) => a.assignmentId === assignment.id)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

    const available = isAssignmentAvailable(assignment.date, today, assignment.unlocked);
    let status: AssignmentStatus = "upcoming";
    if (!available) status = "upcoming";
    else if (!attempt) status = "available";
    else if (attempt.status === "in_progress") status = "in_progress";
    else if (attempt.status === "remediating") status = "needs_correction";
    else if (attempt.status === "submitted") status = "submitted";
    else if (attempt.status === "completed") status = "completed";

    return {
      assignment,
      attempt,
      status,
      available,
      lesson: store.lessons.find((l) => l.id === assignment.lessonId)!,
    };
  });

  const completedLessons = days.filter((d) =>
    ["submitted", "needs_correction", "completed", "in_progress"].includes(d.status) ||
    d.available
  ).length;

  const homeworkCompleted = days.filter((d) => d.status === "completed").length;
  const latestFinal = [...attempts]
    .filter((a) => a.finalMasteryScore != null)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))[0];

  // Streak: consecutive days with completed or submitted from day 1 based on Seoul today
  let streak = 0;
  for (const day of days) {
    if (day.assignment.date > today) break;
    if (day.attempt && ["submitted", "remediating", "completed"].includes(day.attempt.status)) {
      streak += 1;
    } else if (day.assignment.date < today) {
      // break streak on missed past day with no submission
      if (!day.attempt) streak = 0;
    }
  }

  return {
    today,
    days,
    stats: {
      streak,
      lessonsAccessible: completedLessons,
      homeworkCompleted,
      latestFinalScore: latestFinal?.finalMasteryScore ?? null,
      latestInitialScore: latestFinal?.initialScore ?? null,
    },
    meta: store.meta,
  };
}

export async function getLessonBundle(dayNumber: number) {
  const store = await readStore();
  const lesson = store.lessons.find((l) => l.dayNumber === dayNumber);
  if (!lesson) throw new Error("LESSON_NOT_FOUND");
  const vocabulary = store.vocabulary
    .filter((v) => v.dayNumber === dayNumber)
    .sort((a, b) => a.order - b.order);
  const assignment = store.assignments.find((a) => a.dayNumber === dayNumber)!;
  return { lesson, vocabulary, assignment, meta: store.meta };
}

export async function startAttempt(user: SessionUser, dayNumber: number) {
  return updateStore((store) => {
    const assignment = store.assignments.find((a) => a.dayNumber === dayNumber);
    if (!assignment) throw new Error("ASSIGNMENT_NOT_FOUND");
    const today = getSeoulDateString();
    if (!isAssignmentAvailable(assignment.date, today, assignment.unlocked)) {
      throw new Error("ASSIGNMENT_LOCKED");
    }

    const existingActive = store.attempts.find(
      (a) =>
        a.studentId === user.id &&
        a.assignmentId === assignment.id &&
        a.status === "in_progress"
    );
    if (existingActive) return store;

    const completedOrSubmitted = store.attempts.find(
      (a) =>
        a.studentId === user.id &&
        a.assignmentId === assignment.id &&
        ["submitted", "remediating", "completed"].includes(a.status)
    );
    if (completedOrSubmitted && !completedOrSubmitted.retakeAuthorized) {
      throw new Error("ATTEMPT_EXISTS");
    }

    const questions = store.questions
      .filter((q) => q.dayNumber === dayNumber)
      .sort((a, b) => a.order - b.order);

    const attempt: Attempt = {
      id: newId("att"),
      studentId: user.id,
      assignmentId: assignment.id,
      dayNumber,
      status: "in_progress",
      startedAt: new Date().toISOString(),
      answers: {},
      questionSnapshots: questions.map(snapshotQuestion),
      conceptsNeedingRemediation: [],
      conceptsMastered: [],
      conceptsNeedingHelp: [],
      retakeAuthorized: false,
    };

    store.attempts.push(attempt);
    appendEvent(store, {
      studentId: user.id,
      assignmentId: assignment.id,
      attemptId: attempt.id,
      eventType: "attempt_started",
      timestamp: attempt.startedAt,
      payload: {
        dayNumber,
        questionCount: questions.length,
        snapshotVersions: questions.map((q) => ({ id: q.id, version: q.version })),
      },
      actorId: user.id,
      actorRole: user.role,
    });
    return store;
  });
}

export async function getAttemptForStudent(user: SessionUser, dayNumber: number) {
  const store = await readStore();
  const assignment = store.assignments.find((a) => a.dayNumber === dayNumber);
  if (!assignment) throw new Error("ASSIGNMENT_NOT_FOUND");

  const attempt = store.attempts
    .filter((a) => a.studentId === user.id && a.assignmentId === assignment.id)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

  const questions = store.questions
    .filter((q) => q.dayNumber === dayNumber)
    .sort((a, b) => a.order - b.order);

  // Never expose answer keys while in progress
  const safeQuestions = questions.map((q) => {
    if (attempt && attempt.status !== "in_progress") return q;
    return {
      ...q,
      correctAnswer: "",
      acceptedAnswers: [],
      explanationKo: "",
    };
  });

  return {
    assignment,
    attempt: attempt ?? null,
    questions: safeQuestions,
    fullQuestions: attempt && attempt.status !== "in_progress" ? questions : null,
    remediationQuestions: store.remediationQuestions,
    remediationAttempts: store.remediationAttempts.filter((r) => r.attemptId === attempt?.id),
    teacherReviews: store.teacherReviews.filter((r) => r.attemptId === attempt?.id),
    meta: store.meta,
    available: isAssignmentAvailable(
      assignment.date,
      getSeoulDateString(),
      assignment.unlocked
    ),
  };
}

export async function saveAnswer(
  user: SessionUser,
  attemptId: string,
  questionId: string,
  studentAnswer: string,
  studentReasoning: string
) {
  return updateStore((store) => {
    const attempt = store.attempts.find((a) => a.id === attemptId);
    if (!attempt || attempt.studentId !== user.id) throw new Error("FORBIDDEN");
    if (attempt.status !== "in_progress") throw new Error("ATTEMPT_LOCKED");

    const now = new Date().toISOString();
    attempt.answers[questionId] = {
      questionId,
      studentAnswer,
      studentReasoning,
      savedAt: now,
    };

    appendEvent(store, {
      studentId: user.id,
      assignmentId: attempt.assignmentId,
      attemptId: attempt.id,
      eventType: "answer_saved",
      timestamp: now,
      payload: { questionId, hasAnswer: isAnswerComplete(studentAnswer), hasReasoning: isReasoningComplete(studentReasoning) },
      actorId: user.id,
      actorRole: user.role,
    });
    return store;
  });
}

export async function submitAttempt(user: SessionUser, attemptId: string) {
  return updateStore((store) => {
    const attempt = store.attempts.find((a) => a.id === attemptId);
    if (!attempt || attempt.studentId !== user.id) throw new Error("FORBIDDEN");
    if (attempt.status !== "in_progress") throw new Error("ATTEMPT_LOCKED");

    const incomplete: { questionId: string; order: number; missing: ("answer" | "reasoning")[] }[] = [];
    attempt.questionSnapshots.forEach((snap, idx) => {
      const ans = attempt.answers[snap.questionId];
      const missing: ("answer" | "reasoning")[] = [];
      if (!isAnswerComplete(ans?.studentAnswer)) missing.push("answer");
      if (!isReasoningComplete(ans?.studentReasoning)) missing.push("reasoning");
      if (missing.length) incomplete.push({ questionId: snap.questionId, order: idx + 1, missing });
    });
    if (incomplete.length) {
      throw new Error(`INCOMPLETE:${JSON.stringify(incomplete)}`);
    }

    const now = new Date().toISOString();
    for (const key of Object.keys(attempt.answers)) {
      attempt.answers[key] = { ...attempt.answers[key], submittedAt: now };
    }

    const graded = gradeAttempt(attempt.questionSnapshots, attempt.answers);
    for (const result of graded.results) {
      const ans = attempt.answers[result.questionId];
      if (ans) {
        ans.isCorrect = result.isCorrect;
        ans.pendingReview = result.pendingReview;
        ans.pointsEarned = result.pointsEarned;
      }
    }

    attempt.status = graded.incorrectConceptIds.length > 0 ? "remediating" : "completed";
    attempt.submittedAt = now;
    attempt.initialScore = graded.initialScore;
    attempt.initialCorrect = graded.correctCount;
    attempt.initialIncorrect = graded.incorrectCount;
    attempt.initialUnanswered = graded.unansweredCount;
    attempt.conceptsNeedingRemediation = graded.incorrectConceptIds;

    if (graded.incorrectConceptIds.length === 0) {
      const mastery = calculateFinalMasteryScore(graded.initialScore, 0, 0);
      attempt.remediationMasteryRate = mastery.remediationMasteryRate;
      attempt.finalMasteryScore = mastery.finalMasteryScore;
      attempt.completedAt = now;
      attempt.conceptsMastered = [];
    }

    appendEvent(store, {
      studentId: user.id,
      assignmentId: attempt.assignmentId,
      attemptId: attempt.id,
      eventType: "attempt_submitted",
      timestamp: now,
      payload: { answers: attempt.answers },
      actorId: user.id,
      actorRole: user.role,
    });

    appendEvent(store, {
      studentId: user.id,
      assignmentId: attempt.assignmentId,
      attemptId: attempt.id,
      eventType: "graded",
      timestamp: now,
      payload: {
        initialScore: graded.initialScore,
        results: graded.results,
        incorrectConceptIds: graded.incorrectConceptIds,
      },
      actorId: "system",
      actorRole: "system",
    });

    if (attempt.status === "completed") {
      appendEvent(store, {
        studentId: user.id,
        assignmentId: attempt.assignmentId,
        attemptId: attempt.id,
        eventType: "final_mastery_recorded",
        timestamp: now,
        payload: {
          initialScore: attempt.initialScore,
          remediationMasteryRate: attempt.remediationMasteryRate,
          finalMasteryScore: attempt.finalMasteryScore,
        },
        actorId: "system",
        actorRole: "system",
      });
    } else {
      appendEvent(store, {
        studentId: user.id,
        assignmentId: attempt.assignmentId,
        attemptId: attempt.id,
        eventType: "remediation_started",
        timestamp: now,
        payload: { concepts: graded.incorrectConceptIds },
        actorId: "system",
        actorRole: "system",
      });
    }

    return store;
  });
}

export async function submitRemediation(
  user: SessionUser,
  attemptId: string,
  conceptId: string,
  remediationQuestionId: string,
  studentAnswer: string,
  studentReasoning: string
) {
  return updateStore((store) => {
    const attempt = store.attempts.find((a) => a.id === attemptId);
    if (!attempt || attempt.studentId !== user.id) throw new Error("FORBIDDEN");
    if (attempt.status !== "remediating") throw new Error("NOT_REMEDIATING");
    if (!isAnswerComplete(studentAnswer) || !isReasoningComplete(studentReasoning)) {
      throw new Error("INCOMPLETE_REMEDIATION");
    }

    const rq = store.remediationQuestions.find((r) => r.id === remediationQuestionId);
    if (!rq || rq.conceptId !== conceptId) throw new Error("REMEDIATION_NOT_FOUND");

    const prior = store.remediationAttempts.filter(
      (r) => r.attemptId === attemptId && r.conceptId === conceptId
    );
    const attemptNumber = prior.length + 1;
    const isCorrect = answersMatch(studentAnswer, rq.correctAnswer, rq.acceptedAnswers ?? []);
    const now = new Date().toISOString();

    let status: RemediationAttempt["status"] = "answered";
    if (!isCorrect && attemptNumber >= 2) {
      status = "needs_teacher_help";
    }

    const remAttempt: RemediationAttempt = {
      id: newId("ra"),
      attemptId,
      studentId: user.id,
      conceptId,
      remediationQuestionId,
      attemptNumber,
      studentAnswer,
      studentReasoning,
      isCorrect,
      createdAt: now,
      status,
    };
    store.remediationAttempts.push(remAttempt);

    appendEvent(store, {
      studentId: user.id,
      assignmentId: attempt.assignmentId,
      attemptId,
      eventType: "remediation_answered",
      timestamp: now,
      payload: { conceptId, remediationQuestionId, isCorrect, attemptNumber, studentAnswer, studentReasoning },
      actorId: user.id,
      actorRole: user.role,
    });

    if (isCorrect) {
      if (!attempt.conceptsMastered.includes(conceptId)) {
        attempt.conceptsMastered.push(conceptId);
      }
      attempt.conceptsNeedingRemediation = attempt.conceptsNeedingRemediation.filter((c) => c !== conceptId);
      attempt.conceptsNeedingHelp = attempt.conceptsNeedingHelp.filter((c) => c !== conceptId);
      store.conceptMastery = store.conceptMastery.filter(
        (c) => !(c.studentId === user.id && c.conceptId === conceptId)
      );
      store.conceptMastery.push({
        studentId: user.id,
        conceptId,
        conceptLabel: rq.conceptLabel,
        status: "mastered",
        lastUpdated: now,
      });
    } else if (status === "needs_teacher_help") {
      attempt.conceptsNeedingRemediation = attempt.conceptsNeedingRemediation.filter((c) => c !== conceptId);
      if (!attempt.conceptsNeedingHelp.includes(conceptId)) {
        attempt.conceptsNeedingHelp.push(conceptId);
      }
      store.conceptMastery = store.conceptMastery.filter(
        (c) => !(c.studentId === user.id && c.conceptId === conceptId)
      );
      store.conceptMastery.push({
        studentId: user.id,
        conceptId,
        conceptLabel: rq.conceptLabel,
        status: "needs_teacher_help",
        lastUpdated: now,
      });
      appendEvent(store, {
        studentId: user.id,
        assignmentId: attempt.assignmentId,
        attemptId,
        eventType: "needs_teacher_help",
        timestamp: now,
        payload: { conceptId },
        actorId: "system",
        actorRole: "system",
      });
    }

    const remaining = attempt.conceptsNeedingRemediation.length;
    if (remaining === 0) {
      const required =
        (attempt.conceptsMastered.length + attempt.conceptsNeedingHelp.length) ||
        attempt.conceptsMastered.length;
      // Original concepts that needed remediation = mastered + needs help
      const originalRequired = Math.max(
        required,
        attempt.conceptsMastered.length + attempt.conceptsNeedingHelp.length
      );
      const mastery = calculateFinalMasteryScore(
        attempt.initialScore ?? 0,
        originalRequired,
        attempt.conceptsMastered.length
      );
      attempt.remediationMasteryRate = mastery.remediationMasteryRate;
      attempt.finalMasteryScore = mastery.finalMasteryScore;
      attempt.status = "completed";
      attempt.completedAt = now;

      appendEvent(store, {
        studentId: user.id,
        assignmentId: attempt.assignmentId,
        attemptId,
        eventType: "remediation_completed",
        timestamp: now,
        payload: {
          conceptsMastered: attempt.conceptsMastered,
          conceptsNeedingHelp: attempt.conceptsNeedingHelp,
        },
        actorId: "system",
        actorRole: "system",
      });

      appendEvent(store, {
        studentId: user.id,
        assignmentId: attempt.assignmentId,
        attemptId,
        eventType: "final_mastery_recorded",
        timestamp: now,
        payload: {
          initialScore: attempt.initialScore,
          remediationMasteryRate: attempt.remediationMasteryRate,
          finalMasteryScore: attempt.finalMasteryScore,
        },
        actorId: "system",
        actorRole: "system",
      });
    }

    return store;
  });
}

export async function toggleDifficultWord(user: SessionUser, vocabId: string) {
  return updateStore((store) => {
    const list = new Set(store.difficultWords[user.id] ?? []);
    if (list.has(vocabId)) list.delete(vocabId);
    else list.add(vocabId);
    store.difficultWords[user.id] = [...list];
    return store;
  });
}

export async function getTeacherOverview() {
  const store = await readStore();
  const students = store.profiles.filter((p) => p.role === "student");
  const student = students[0];
  const attempts = store.attempts.filter((a) => a.studentId === student?.id);

  const missedConcepts: Record<string, number> = {};
  for (const a of attempts) {
    for (const c of [...a.conceptsNeedingRemediation, ...a.conceptsNeedingHelp]) {
      missedConcepts[c] = (missedConcepts[c] ?? 0) + 1;
    }
    for (const snap of a.questionSnapshots) {
      const ans = a.answers[snap.questionId];
      if (ans && ans.isCorrect === false) {
        missedConcepts[snap.conceptId] = (missedConcepts[snap.conceptId] ?? 0) + 1;
      }
    }
  }

  return {
    store,
    student,
    attempts,
    missedConcepts,
    meta: store.meta,
  };
}

export async function saveTeacherReview(
  teacher: SessionUser,
  attemptId: string,
  questionId: string,
  understandingLabel: UnderstandingLabel,
  teacherFeedback: string
) {
  return updateStore((store) => {
    const attempt = store.attempts.find((a) => a.id === attemptId);
    if (!attempt) throw new Error("ATTEMPT_NOT_FOUND");
    const now = new Date().toISOString();
    const review: TeacherReview = {
      id: newId("tr"),
      attemptId,
      questionId,
      studentId: attempt.studentId,
      understandingLabel,
      teacherFeedback,
      reviewedAt: now,
      reviewerId: teacher.id,
    };
    store.teacherReviews = store.teacherReviews.filter(
      (r) => !(r.attemptId === attemptId && r.questionId === questionId)
    );
    store.teacherReviews.push(review);

    appendEvent(store, {
      studentId: attempt.studentId,
      assignmentId: attempt.assignmentId,
      attemptId,
      eventType: "teacher_review",
      timestamp: now,
      payload: { questionId, understandingLabel, teacherFeedback },
      actorId: teacher.id,
      actorRole: "teacher",
    });
    return store;
  });
}

export async function setAssignmentUnlocked(dayNumber: number, unlocked: boolean) {
  return updateStore((store) => {
    const a = store.assignments.find((x) => x.dayNumber === dayNumber);
    if (a) a.unlocked = unlocked;
    return store;
  });
}

export async function authorizeRetake(attemptId: string) {
  return updateStore((store) => {
    const a = store.attempts.find((x) => x.id === attemptId);
    if (a) a.retakeAuthorized = true;
    return store;
  });
}

export function buildProgressCsv(store: Awaited<ReturnType<typeof readStore>>, studentId: string): string {
  const attempts = store.attempts.filter((a) => a.studentId === studentId);
  const header = [
    "day",
    "assignment_id",
    "attempt_id",
    "status",
    "started_at",
    "submitted_at",
    "completed_at",
    "initial_score",
    "remediation_mastery_rate",
    "final_mastery_score",
    "concepts_mastered",
    "concepts_needing_help",
  ].join(",");

  const rows = attempts.map((a) =>
    [
      a.dayNumber,
      a.assignmentId,
      a.id,
      a.status,
      a.startedAt,
      a.submittedAt ?? "",
      a.completedAt ?? "",
      a.initialScore ?? "",
      a.remediationMasteryRate ?? "",
      a.finalMasteryScore ?? "",
      `"${a.conceptsMastered.join("|")}"`,
      `"${a.conceptsNeedingHelp.join("|")}"`,
    ].join(",")
  );

  return [header, ...rows].join("\n");
}
