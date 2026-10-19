import type { Assignment, Lesson, Question, RemediationQuestion, VocabularyItem } from "@/lib/types";
import { day1Lesson, day1Questions, day1Remediation, day1Vocabulary } from "./day1";
import { day2Lesson, day2Questions, day2Remediation, day2Vocabulary } from "./day2";
import { day3Lesson, day3Questions, day3Remediation, day3Vocabulary } from "./day3";
import { day4Lesson, day4Questions, day4Remediation, day4Vocabulary } from "./day4";
import { day5Lesson, day5Questions, day5Remediation, day5Vocabulary } from "./day5";
import { day6Lesson, day6Questions, day6Remediation, day6Vocabulary } from "./day6";
import { day7Lesson, day7Questions, day7Remediation, day7Vocabulary } from "./day7";

export const ALL_LESSONS: Lesson[] = [
  day1Lesson,
  day2Lesson,
  day3Lesson,
  day4Lesson,
  day5Lesson,
  day6Lesson,
  day7Lesson,
];

export const ALL_VOCABULARY: VocabularyItem[] = [
  ...day1Vocabulary,
  ...day2Vocabulary,
  ...day3Vocabulary,
  ...day4Vocabulary,
  ...day5Vocabulary,
  ...day6Vocabulary,
  ...day7Vocabulary,
];

export const ALL_QUESTIONS: Question[] = [
  ...day1Questions,
  ...day2Questions,
  ...day3Questions,
  ...day4Questions,
  ...day5Questions,
  ...day6Questions,
  ...day7Questions,
];

export const ALL_REMEDIATION: RemediationQuestion[] = [
  ...day1Remediation,
  ...day2Remediation,
  ...day3Remediation,
  ...day4Remediation,
  ...day5Remediation,
  ...day6Remediation,
  ...day7Remediation,
];

export function buildAssignments(): Assignment[] {
  return ALL_LESSONS.map((lesson) => {
    const questions = ALL_QUESTIONS.filter((q) => q.dayNumber === lesson.dayNumber);
    return {
      id: `assign-day-${lesson.dayNumber}`,
      dayNumber: lesson.dayNumber,
      date: lesson.date,
      title: lesson.title,
      lessonId: lesson.id,
      published: true,
      unlocked: false,
      questionCount: questions.length,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
    };
  });
}
