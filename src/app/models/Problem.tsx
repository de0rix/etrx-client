export interface Problem {
  contestId: number;
  index: string;
  rank: string;
  division: string;
  name: string;
  points: number;
  rating: number;
  difficulty: number;
  solvedCount: number;
  startTime: number;
  tags: string[];
}

export type ProblemForTable = Problem & { id: string };
