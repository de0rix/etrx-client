export interface Problem {
  index: string;
  contestId: number;
}

export interface ProblemResult {
  index: string;
  points: number;
  rejectedAttemptCount: number;
}

export interface RanklistRow {
  handle: string;
  username: string;
  city: string;
  organization: string;
  grade: string;
  points: number;
  solvedCount: number;
  participantType?: string;
  problemResults: ProblemResult[];
}

export type RanklistRowForTable = RanklistRow & { id: string };
