export type Option = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';

export const getOptions = (count: number): Option[] => {
  const allOptions: Option[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  return allOptions.slice(0, count);
};

export interface TestMetadata {
  testName: string;
  teacherName: string;
  grade: string;
  schoolName: string;
  section: string;
  questionCount: number;
  choiceCount: number;
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
