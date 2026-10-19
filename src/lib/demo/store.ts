import { promises as fs } from "fs";
import path from "path";
import { ALL_LESSONS, ALL_QUESTIONS, ALL_REMEDIATION, ALL_VOCABULARY, buildAssignments } from "@/data";
import { DEMO_WARNING } from "@/lib/mode";
import type { DemoStore, Profile } from "@/lib/types";

const STORE_DIR = path.join(process.cwd(), ".demo-data");
const STORE_PATH = path.join(STORE_DIR, "store.json");

const STUDENT: Profile = {
  id: "demo-student-1",
  email: "student@englishlab.local",
  displayName: "기은",
  role: "student",
  createdAt: "2026-10-15T00:00:00.000Z",
};

const TEACHER: Profile = {
  id: "demo-teacher-1",
  email: "teacher@englishlab.local",
  displayName: "박선생님",
  role: "teacher",
  createdAt: "2026-10-15T00:00:00.000Z",
};

function createSeedStore(): DemoStore {
  return {
    profiles: [STUDENT, TEACHER],
    lessons: ALL_LESSONS,
    vocabulary: ALL_VOCABULARY,
    assignments: buildAssignments(),
    questions: ALL_QUESTIONS,
    remediationQuestions: ALL_REMEDIATION,
    attempts: [],
    remediationAttempts: [],
    gradeEvents: [],
    teacherReviews: [],
    conceptMastery: [],
    difficultWords: {},
    meta: {
      mode: "demo",
      seededAt: new Date().toISOString(),
      warning: DEMO_WARNING,
    },
  };
}

let memoryLock: Promise<void> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = memoryLock.then(fn, fn);
  memoryLock = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function ensureStore(): Promise<DemoStore> {
  await fs.mkdir(STORE_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as DemoStore;
    // Re-hydrate curriculum from code so content updates apply without deleting attempts
    parsed.lessons = ALL_LESSONS;
    parsed.vocabulary = ALL_VOCABULARY;
    parsed.questions = ALL_QUESTIONS;
    parsed.remediationQuestions = ALL_REMEDIATION;
    parsed.assignments = buildAssignments().map((a) => {
      const existing = parsed.assignments.find((x) => x.id === a.id);
      return existing ? { ...a, unlocked: existing.unlocked, published: existing.published } : a;
    });
    if (!parsed.profiles?.length) parsed.profiles = [STUDENT, TEACHER];
    return parsed;
  } catch {
    const seeded = createSeedStore();
    await fs.writeFile(STORE_PATH, JSON.stringify(seeded, null, 2), "utf8");
    return seeded;
  }
}

export async function readStore(): Promise<DemoStore> {
  return withLock(async () => ensureStore());
}

export async function updateStore(
  updater: (store: DemoStore) => DemoStore | void
): Promise<DemoStore> {
  return withLock(async () => {
    const store = await ensureStore();
    const result = updater(store) ?? store;
    await fs.writeFile(STORE_PATH, JSON.stringify(result, null, 2), "utf8");
    return result;
  });
}

export async function resetStore(): Promise<DemoStore> {
  return withLock(async () => {
    await fs.mkdir(STORE_DIR, { recursive: true });
    const seeded = createSeedStore();
    await fs.writeFile(STORE_PATH, JSON.stringify(seeded, null, 2), "utf8");
    return seeded;
  });
}

export { STUDENT, TEACHER };
