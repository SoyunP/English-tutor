import { describe, expect, it } from "vitest";
import { ALL_QUESTIONS, ALL_REMEDIATION, ALL_VOCABULARY, ALL_LESSONS } from "@/data";

describe("seeded curriculum", () => {
  it("has seven lessons and Korean exam stems", () => {
    expect(ALL_LESSONS).toHaveLength(7);
    expect(ALL_QUESTIONS.every((q) => /[가-힣]/.test(q.promptKo))).toBe(true);
    expect(ALL_QUESTIONS.every((q) => /[가-힣]/.test(q.explanationKo))).toBe(true);
  });

  it("day 7 has 20 questions; other days have 15", () => {
    for (let d = 1; d <= 6; d++) {
      expect(ALL_QUESTIONS.filter((q) => q.dayNumber === d)).toHaveLength(15);
    }
    expect(ALL_QUESTIONS.filter((q) => q.dayNumber === 7)).toHaveLength(20);
  });

  it("has 10–15 vocab items per day", () => {
    for (let d = 1; d <= 7; d++) {
      const n = ALL_VOCABULARY.filter((v) => v.dayNumber === d).length;
      expect(n).toBeGreaterThanOrEqual(10);
      expect(n).toBeLessThanOrEqual(15);
    }
  });

  it("provides at least two remediation questions per tested concept", () => {
    for (let d = 1; d <= 7; d++) {
      const concepts = [
        ...new Set(ALL_QUESTIONS.filter((q) => q.dayNumber === d).map((q) => q.conceptId)),
      ];
      for (const c of concepts) {
        const count = ALL_REMEDIATION.filter((r) => r.conceptId === c).length;
        expect(count, `concept ${c} on day ${d}`).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
