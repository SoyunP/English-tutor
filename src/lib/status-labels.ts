import type { AssignmentStatus } from "./types";

export const STATUS_LABELS: Record<AssignmentStatus, string> = {
  upcoming: "예정",
  available: "가능",
  in_progress: "진행 중",
  submitted: "제출됨",
  needs_correction: "교정 필요",
  completed: "완료",
};
