export type CourseStatus = "queued" | "active" | "completed" | "archived";

export type SchedulableCourse = {
  id: number;
  slug: string;
  title: string;
  orderIndex: number;
  status: CourseStatus;
  currentStage?: number;
  nextDueDate?: string | null;
  archivedFromStatus?: Exclude<CourseStatus, "archived"> | null;
};

export type StudyEventSummary = {
  id?: number;
  courseId: number;
  stage: number;
  scheduledDate: string;
  completedDate: string;
  completedAt?: string;
};

export type ReviewTask = SchedulableCourse & { kind: "review"; stage: number; scheduledDate: string; overdueDays: number };
export type NewCourseTask = SchedulableCourse & { kind: "new"; stage: 0; scheduledDate: string };
export type CompletedTask = StudyEventSummary & { kind: "completed"; course: SchedulableCourse };
export type TodayTasks = {
  overdueReviews: ReviewTask[];
  dueReviews: ReviewTask[];
  newCourse: NewCourseTask | null;
  completedToday: CompletedTask[];
};

export type ForecastTask = { date: string; courseId: number; title: string; stage: number; kind: "new" | "review" };
