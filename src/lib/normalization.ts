/**
 * Normalize short answers for grading.
 * Strict rules — no unrestricted fuzzy matching that would accept wrong grammar.
 */
export function normalizeAnswer(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u00a0/g, " ");
}

/** Case-insensitive compare for short English answers; preserves punctuation requirements when present in accepted set. */
export function answersMatch(
  studentAnswer: string,
  correctAnswer: string,
  acceptedAnswers: string[] = []
): boolean {
  const student = normalizeAnswer(studentAnswer);
  const candidates = [correctAnswer, ...acceptedAnswers].map(normalizeAnswer);

  // Exact match (case-sensitive for punctuation/apostrophes where needed)
  if (candidates.some((c) => c === student)) return true;

  // Case-insensitive match without trailing period differences
  const stripTrailing = (s: string) => s.replace(/[.!?]+$/, "").trim();
  const studentLower = stripTrailing(student).toLowerCase();
  return candidates.some((c) => stripTrailing(c).toLowerCase() === studentLower);
}

export function isReasoningComplete(reasoning: string | undefined | null): boolean {
  return Boolean(reasoning && reasoning.trim().length > 0);
}

export function isAnswerComplete(answer: string | undefined | null): boolean {
  return Boolean(answer && answer.trim().length > 0);
}
