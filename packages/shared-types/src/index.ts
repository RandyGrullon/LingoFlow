export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type TaskType =
  | "multiple_choice"
  | "writing"
  | "voice"
  | "drag_drop"
  | "pdf_worksheet"
  | "match_pairs"
  | "select_image";

export type TaskStatus = "pending" | "submitted" | "graded";

export type LessonStatus = "pending" | "in_progress" | "completed";

export type MessageRole = "user" | "assistant" | "system";

export interface CorrectionItem {
  type: "grammar" | "vocab" | "spelling" | "pronunciation";
  original: string;
  suggestion: string;
  explanation_in_native?: string;
}

export interface MultipleChoicePayload {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface DragDropPayload {
  items: string[];
  targets: string[];
  mapping: Record<string, string>;
}

export interface VoiceTaskPayload {
  promptToSay: string;
  targetPhonetics?: string;
}

export interface WritingTaskPayload {
  topic: string;
  minWords: number;
  maxWords: number;
}

export interface PdfWorksheetPayload {
  title: string;
  instructions: string;
  questions: { id: string; text: string }[];
}

/** Columnas izquierda / derecha; expected_answer.matches mapea leftId -> rightId */
export interface MatchPairsPayload {
  instruction: string;
  left: { id: string; text: string }[];
  right: { id: string; text: string }[];
}

/** Opciones visuales; la opción correcta solo va en expected_answer (servidor) */
export interface SelectImageOption {
  id: string;
  caption: string;
  emoji?: string;
  imageUrl?: string;
}

export interface SelectImagePayload {
  instruction: string;
  wordOrPhrase: string;
  speakLang: string;
  options: SelectImageOption[];
}

export type TaskPayload =
  | MultipleChoicePayload
  | DragDropPayload
  | VoiceTaskPayload
  | WritingTaskPayload
  | PdfWorksheetPayload
  | MatchPairsPayload
  | SelectImagePayload;

export interface TaskAssignment {
  type: TaskType;
  prompt: string;
  payload: TaskPayload;
  expected_answer: unknown;
}

export interface TutorMetaJson {
  corrections: CorrectionItem[];
  topics_practiced: string[];
  topics_struggled: string[];
  tasksAssigned: TaskAssignment[];
}

export interface ChatStreamEvent {
  type: "token" | "done" | "error" | "tasks_created";
  data?: string;
  meta?: TutorMetaJson;
  taskIds?: string[];
  message?: string;
}
