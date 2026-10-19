/**
 * Teacher import/export format for practice passages and vocabulary.
 * Does NOT include copyrighted textbook text unless the teacher supplies it.
 */
import { z } from "zod";

export const VocabularyImportSchema = z.object({
  dayNumber: z.number().int().min(1).max(7),
  items: z.array(
    z.object({
      word: z.string().min(1),
      meaningKo: z.string().min(1),
      partOfSpeech: z.string().min(1),
      exampleEn: z.string().min(1),
      exampleKo: z.string().min(1),
    })
  ),
});

export const PassageImportSchema = z.object({
  dayNumber: z.number().int().min(1).max(7),
  title: z.string().min(1),
  sourceNote: z
    .string()
    .default("교사 제공 자료 — 저작권이 있는 교과서 원문은 제공된 경우에만 사용하세요."),
  sentences: z.array(
    z.object({
      en: z.string().min(1),
      ko: z.string().min(1),
      highlight: z.array(z.string()).optional(),
    })
  ),
});

export type VocabularyImport = z.infer<typeof VocabularyImportSchema>;
export type PassageImport = z.infer<typeof PassageImportSchema>;

export function exportVocabularyJson(data: VocabularyImport): string {
  return JSON.stringify(VocabularyImportSchema.parse(data), null, 2);
}

export function importVocabularyJson(raw: string): VocabularyImport {
  return VocabularyImportSchema.parse(JSON.parse(raw));
}

export function exportPassageJson(data: PassageImport): string {
  return JSON.stringify(PassageImportSchema.parse(data), null, 2);
}

export function importPassageJson(raw: string): PassageImport {
  return PassageImportSchema.parse(JSON.parse(raw));
}
