export interface UsersProtocol {
  lastTime: number;
  handle: string;
  userName: string;
  contestsCount: number;
  solvedCount: number;
}

export type UsersProtocolForTable = UsersProtocol & { id: string };

export interface UserProtocol {
  lastTime: number;
  contestId: number;
  solvedCount: number;
}

export type UserProtocolForTable = UserProtocol & { id: string };

export interface UserContestProtocol {
  time: number;
  index: string;
  participantType: string;
  programmingLanguage: string;
  verdict: string | null;
}

export type UserContestProtocolForTable = UserContestProtocol & { id: string };
