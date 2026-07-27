import { addBusinessDays } from "./date-utils";
import { REVIEW_OFFSETS } from "./constants";

export type CompleteStageInput = { currentStage: number; completedDate: string };
export type CompleteStageResult =
  | { type: "next-stage"; nextStage: number; nextDueDate: string }
  | { type: "course-completed"; completedDate: string };

export function completeStage({ currentStage, completedDate }: CompleteStageInput): CompleteStageResult {
  if (!Number.isInteger(currentStage) || currentStage < 0 || currentStage >= REVIEW_OFFSETS.length) {
    throw new Error("Invalid current review stage");
  }
  const nextStage = currentStage + 1;
  if (nextStage >= REVIEW_OFFSETS.length) return { type: "course-completed", completedDate };
  const interval = REVIEW_OFFSETS[nextStage] - REVIEW_OFFSETS[currentStage];
  return { type: "next-stage", nextStage, nextDueDate: addBusinessDays(completedDate, interval) };
}
