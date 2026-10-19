import { formatInTimeZone } from "date-fns-tz";

export const SEOUL_TZ = "Asia/Seoul";

export const CURRICULUM_DAYS = [
  { dayNumber: 1, date: "2026-10-16", lessonId: "lesson-5a", title: "Lesson 5: Art, reflexive pronouns, infinitives of purpose", lessonTitle: "Enjoying Art" },
  { dayNumber: 2, date: "2026-10-17", lessonId: "lesson-5b", title: "Lesson 5: Reading, vocabulary, sentence ordering and writing", lessonTitle: "Enjoying Art" },
  { dayNumber: 3, date: "2026-10-18", lessonId: "lesson-6a", title: "Lesson 6: Korean culture, Hangeul Day and reading", lessonTitle: "Amazing Korea" },
  { dayNumber: 4, date: "2026-10-19", lessonId: "lesson-6b", title: "Lesson 6: Vocabulary, grammar, dialogue and writing", lessonTitle: "Amazing Korea" },
  { dayNumber: 5, date: "2026-10-20", lessonId: "lesson-7", title: "Lesson 7: Environment, reading, vocabulary and grammar", lessonTitle: "Save Earth, Save Us" },
  { dayNumber: 6, date: "2026-10-21", lessonId: "lesson-8", title: "Lesson 8: Stories, reading, vocabulary and grammar", lessonTitle: "Dive into Stories" },
  { dayNumber: 7, date: "2026-10-22", lessonId: "lesson-final", title: "Lessons 5–8: Comprehensive final examination review", lessonTitle: "종합 복습" },
] as const;

export type CurriculumDay = (typeof CURRICULUM_DAYS)[number];

export function getSeoulDateString(date: Date = new Date()): string {
  return formatInTimeZone(date, SEOUL_TZ, "yyyy-MM-dd");
}

export function getSeoulDisplayDate(date: Date = new Date()): string {
  return formatInTimeZone(date, SEOUL_TZ, "yyyy년 M월 d일 (EEE)");
}

export function compareSeoulDates(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function isAssignmentAvailable(
  assignmentDate: string,
  today: string = getSeoulDateString(),
  unlocked = false
): boolean {
  if (unlocked) return true;
  return compareSeoulDates(assignmentDate, today) <= 0;
}

export function getDayByNumber(dayNumber: number): CurriculumDay | undefined {
  return CURRICULUM_DAYS.find((d) => d.dayNumber === dayNumber);
}

export function getDayByDate(date: string): CurriculumDay | undefined {
  return CURRICULUM_DAYS.find((d) => d.date === date);
}

export function formatKoreanDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${m}월 ${d}일`;
}
