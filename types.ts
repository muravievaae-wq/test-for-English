
export enum QuestionType {
  GRAMMAR = 'GRAMMAR',
  VOCABULARY = 'VOCABULARY',
  READING = 'READING',
  LISTENING = 'LISTENING',
  WRITING = 'WRITING',
  SPEAKING = 'SPEAKING',
}

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Question {
  id: number;
  type: QuestionType;
  level: CEFRLevel;
  sectionTitle: string;
  prompt: string;
  options?: string[];
  correctAnswer?: string; // For auto-gradable questions
  points: number;
  listeningText?: string; // For listening questions
}

export interface StudentData {
  fullName: string;
  age: number;
  goals: string;
  fears: string;
  skillToImprove: string;
  lessonType: 'individual' | 'group' | 'self-study';
}

export interface Answer {
  questionId: number;
  userAnswer: string;
  isCorrect?: boolean;
}

export interface TestResult {
  id: string;
  studentData: StudentData;
  answers: Answer[];
  score: number;
  maxScore: number;
  preliminaryLevel: string;
  completedAt: string;
}
