// Match backend DTOs (Lombok @Data → camelCase JSON).

export type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

export type LmsSource = 'MOODLE' | 'GOOGLE_CLASSROOM';
export type Semester = 'S1' | 'S2' | 'ANNUAL';
export type ExplanationLevel = 'beginner' | 'visual' | 'advanced';
export type Role = 'STUDENT' | 'PROFESSOR' | 'ADMIN';

export type CourseDto = {
  id: string;
  title: string;
  lmsSource: LmsSource;
  school: 'ENSA' | 'EST' | 'FAC' | 'OTHER';
  semester: Semester;
  isActive: boolean;
};

export type CourseSectionDto = {
  id: string;
  title: string;
  orderIndex: number;
};

export type CourseDetailDto = CourseDto & { sections: CourseSectionDto[] };

export type AssignmentDto = {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description?: string;
  dueAt: string;
  complexity: number;
  assignmentType: 'HOMEWORK' | 'PROJECT' | 'EXAM' | string;
};

export type ExplainResponse = {
  conceptSlug: string;
  courseId?: string;
  explanation: string;
  keyPoints: string[];
  level: ExplanationLevel;
  videosSlug?: string;
  isFallback: boolean;
};

export type OcrResponse = {
  fixtureSlug: string;
  courseId?: string;
  ocrStatus: 'OK' | 'PARTIAL' | 'FAILED';
  pageCount: number;
  extractedText: string;
  indexedConcepts: string[];
  confidence: number;
  processingMs: number;
};

export type WdStatus = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type WdBreakdownItem = {
  courseTitle: string;
  assignmentTitle: string;
  ci: number;
  ti: number;
  contribution: number;
};

export type WdHistoryPoint = { date: string; wdScore: number };

export type WdResponseDto = {
  wdScore: number;
  status: WdStatus;
  breakdown: WdBreakdownItem[];
  history: WdHistoryPoint[];
  calculatedAt: string;
};

export type NotificationDto = {
  id: string;
  type: 'WORKLOAD_ALERT' | 'DEADLINE_REMINDER' | 'MILESTONE_NUDGE' | 'SYSTEM';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};
