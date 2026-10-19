import { answersMatch, isAnswerComplete } from "./normalization";
import { calculateInitialScore } from "./scoring";
import type { AttemptAnswer, Question, QuestionSnapshot } from "./types";

export interface GradeResult {
  questionId: string;
  isCorrect: boolean;
  pendingReview: boolean;
  pointsEarned: number;
  studentAnswer: string;
  correctAnswer: string;
}

export function gradeObjectiveAnswer(
  snapshot: QuestionSnapshot,
  studentAnswer: string
): GradeResult {
  const hasAnswer = isAnswerComplete(studentAnswer);

  if (!hasAnswer) {
    return {
      questionId: snapshot.questionId,
      isCorrect: false,
      pendingReview: false,
      pointsEarned: 0,
      studentAnswer: "",
      correctAnswer: snapshot.correctAnswer,
    };
  }

  if (snapshot.requiresTeacherReview) {
    return {
      questionId: snapshot.questionId,
      isCorrect: false,
      pendingReview: true,
      pointsEarned: 0,
      studentAnswer,
      correctAnswer: snapshot.correctAnswer,
    };
  }

  const isCorrect = answersMatch(
    studentAnswer,
    snapshot.correctAnswer,
    snapshot.acceptedAnswers ?? []
  );

  return {
    questionId: snapshot.questionId,
    isCorrect,
    pendingReview: false,
    pointsEarned: isCorrect ? snapshot.points : 0,
    studentAnswer,
    correctAnswer: snapshot.correctAnswer,
  };
}

export function gradeAttempt(
  snapshots: QuestionSnapshot[],
  answers: Record<string, AttemptAnswer>
): {
  results: GradeResult[];
  initialScore: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  pendingReviewCount: number;
  pointsEarned: number;
  totalPoints: number;
  incorrectConceptIds: string[];
} {
  const results = snapshots.map((snap) => {
    const ans = answers[snap.questionId];
    return gradeObjectiveAnswer(snap, ans?.studentAnswer ?? "");
  });

  const totalPoints = snapshots.reduce((sum, s) => sum + s.points, 0);
  const pointsEarned = results.reduce((sum, r) => sum + r.pointsEarned, 0);
  const unansweredCount = results.filter((r) => !isAnswerComplete(r.studentAnswer)).length;
  const pendingReviewCount = results.filter((r) => r.pendingReview).length;
  const correctCount = results.filter((r) => r.isCorrect).length;
  const incorrectCount = results.filter(
    (r) => !r.isCorrect && isAnswerComplete(r.studentAnswer) && !r.pendingReview
  ).length;

  const incorrectConceptIds = [
    ...new Set(
      results
        .filter((r) => !r.isCorrect && isAnswerComplete(r.studentAnswer) && !r.pendingReview)
        .map((r) => snapshots.find((s) => s.questionId === r.questionId)!.conceptId)
    ),
  ];

  return {
    results,
    initialScore: calculateInitialScore(pointsEarned, totalPoints),
    correctCount,
    incorrectCount,
    unansweredCount,
    pendingReviewCount,
    pointsEarned,
    totalPoints,
    incorrectConceptIds,
  };
}

export function snapshotQuestion(q: Question): QuestionSnapshot {
  return {
    questionId: q.id,
    version: q.version,
    promptKo: q.promptKo,
    type: q.type,
    options: q.options,
    correctAnswer: q.correctAnswer,
    acceptedAnswers: q.acceptedAnswers,
    points: q.points,
    conceptId: q.conceptId,
    conceptLabel: q.conceptLabel,
    explanationKo: q.explanationKo,
    conditions: q.conditions,
    requiresTeacherReview: q.requiresTeacherReview,
    passageHtml: q.passageHtml,
  };
}

export function buildWhyWrong(
  explanationKo: string,
  studentAnswer: string,
  correctAnswer: string
): string {
  return [
    `학생이 선택한 답「${studentAnswer || "(미응답)"}」은 정답이 아닙니다.`,
    `정답은「${correctAnswer}」입니다.`,
    explanationKo,
  ].join(" ");
}
