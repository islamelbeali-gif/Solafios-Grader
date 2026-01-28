export type Option = 'A' | 'B' | 'C' | 'D' | 'E';

export const OPTIONS: Option[] = ['A', 'B', 'C', 'D', 'E'];
export const QUESTION_COUNT = 10;

export interface TestMetadata {
  testName: string;
  teacherName: string;
  grade: string;
  schoolName: string;
  section: string;
}

// The scoring key defines how many points each option is worth for each question
export interface ScoringKey {
  [questionIndex: number]: {
    [key in Option]: number;
  };
}

export interface StudentResult {
  id: string;
  name: string;
  answers: {
    [questionIndex: number]: Option;
  };
  totalScore: number;
  questionScores: {
    [questionIndex: number]: number;
  };
}
