export type UserRole = "student" | "teacher";

export type AssignmentStatus =
  | "upcoming"
  | "available"
  | "in_progress"
  | "submitted"
  | "needs_correction"
  | "completed";

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_blank"
  | "sentence_order"
  | "dialogue"
  | "short_answer"
  | "transformation"
  | "writing"
  | "grammar_error"
  | "reading_comprehension";

export type Difficulty = "easy" | "medium" | "hard";

export type UnderstandingLabel =
  | "정확히 이해함"
  | "부분적으로 이해함"
  | "개념을 잘못 이해함"
  | "추가 설명 필요";

export type GradeEventType =
  | "attempt_started"
  | "answer_saved"
  | "attempt_submitted"
  | "graded"
  | "remediation_started"
  | "remediation_answered"
  | "remediation_completed"
  | "final_mastery_recorded"
  | "teacher_review"
  | "teacher_adjustment"
  | "needs_teacher_help";

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface PassageSentence {
  en: string;
  ko: string;
  highlight?: string[];
}

export interface GrammarNote {
  title: string;
  explanationKo: string;
  examples: { correct: string; incorrect?: string; note?: string }[];
  commonMistakes: string[];
  guidedPractice: { prompt: string; answer: string; explanation: string }[];
  provisional?: boolean;
}

export interface LessonSection {
  id: string;
  lessonId: string;
  type: "objectives" | "reading" | "vocabulary" | "grammar" | "summary";
  order: number;
  content: Record<string, unknown>;
}

export interface VocabularyItem {
  id: string;
  lessonId: string;
  dayNumber: number;
  word: string;
  meaningKo: string;
  partOfSpeech: string;
  exampleEn: string;
  exampleKo: string;
  order: number;
}

export interface Lesson {
  id: string;
  dayNumber: number;
  date: string;
  title: string;
  lessonTitle: string;
  textbookNote: string;
  objectives: string[];
  passageTitle: string;
  passageSentences: PassageSentence[];
  readingExplanationKo: string;
  grammar: GrammarNote;
  keyTakeaways: string[];
  examPatterns: string[];
  published: boolean;
}

export interface QuestionOption {
  label: string; // ① ② ③ ④ ⑤
  text: string;
}

export interface Question {
  id: string;
  dayNumber: number;
  assignmentId: string;
  type: QuestionType;
  order: number;
  points: number;
  promptKo: string;
  passageRef?: string;
  passageHtml?: string;
  options?: QuestionOption[];
  correctAnswer: string;
  acceptedAnswers?: string[];
  explanationKo: string;
  whyWrongTemplateKo?: string;
  conceptId: string;
  conceptLabel: string;
  difficulty: Difficulty;
  conditions?: string[];
  requiresTeacherReview?: boolean;
  version: number;
}

export interface RemediationQuestion {
  id: string;
  conceptId: string;
  order: number;
  type: QuestionType;
  points: number;
  promptKo: string;
  passageHtml?: string;
  options?: QuestionOption[];
  correctAnswer: string;
  acceptedAnswers?: string[];
  explanationKo: string;
  conceptLabel: string;
  workedExampleKo: string;
  simplerExplanationKo: string;
}

export interface Assignment {
  id: string;
  dayNumber: number;
  date: string;
  title: string;
  lessonId: string;
  published: boolean;
  unlocked: boolean;
  questionCount: number;
  totalPoints: number;
}

export interface AttemptAnswer {
  questionId: string;
  studentAnswer: string;
  studentReasoning: string;
  savedAt: string;
  submittedAt?: string;
  isCorrect?: boolean;
  pendingReview?: boolean;
  pointsEarned?: number;
}

export interface QuestionSnapshot {
  questionId: string;
  version: number;
  promptKo: string;
  type: QuestionType;
  options?: QuestionOption[];
  correctAnswer: string;
  acceptedAnswers?: string[];
  points: number;
  conceptId: string;
  conceptLabel: string;
  explanationKo: string;
  conditions?: string[];
  requiresTeacherReview?: boolean;
  passageHtml?: string;
}

export interface Attempt {
  id: string;
  studentId: string;
  assignmentId: string;
  dayNumber: number;
  status: "in_progress" | "submitted" | "remediating" | "completed";
  startedAt: string;
  submittedAt?: string;
  completedAt?: string;
  answers: Record<string, AttemptAnswer>;
  questionSnapshots: QuestionSnapshot[];
  initialScore?: number;
  initialCorrect?: number;
  initialIncorrect?: number;
  initialUnanswered?: number;
  remediationMasteryRate?: number;
  finalMasteryScore?: number;
  conceptsNeedingRemediation: string[];
  conceptsMastered: string[];
  conceptsNeedingHelp: string[];
  retakeAuthorized: boolean;
}

export interface RemediationAttempt {
  id: string;
  attemptId: string;
  studentId: string;
  conceptId: string;
  remediationQuestionId: string;
  attemptNumber: number;
  studentAnswer: string;
  studentReasoning: string;
  isCorrect: boolean;
  createdAt: string;
  status: "answered" | "needs_teacher_help";
}

export interface TeacherReview {
  id: string;
  attemptId: string;
  questionId: string;
  studentId: string;
  understandingLabel?: UnderstandingLabel;
  teacherFeedback?: string;
  reviewedAt: string;
  reviewerId: string;
}

export interface GradeEvent {
  id: string;
  studentId: string;
  assignmentId: string;
  attemptId: string;
  eventType: GradeEventType;
  timestamp: string;
  payload: Record<string, unknown>;
  actorId: string;
  actorRole: UserRole | "system";
}

export interface ConceptMastery {
  studentId: string;
  conceptId: string;
  conceptLabel: string;
  status: "mastered" | "needs_practice" | "needs_teacher_help";
  lastUpdated: string;
}

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface DemoStore {
  profiles: Profile[];
  lessons: Lesson[];
  vocabulary: VocabularyItem[];
  assignments: Assignment[];
  questions: Question[];
  remediationQuestions: RemediationQuestion[];
  attempts: Attempt[];
  remediationAttempts: RemediationAttempt[];
  gradeEvents: GradeEvent[];
  teacherReviews: TeacherReview[];
  conceptMastery: ConceptMastery[];
  difficultWords: Record<string, string[]>; // studentId -> vocab ids
  meta: {
    mode: "demo";
    seededAt: string;
    warning: string;
  };
}
