export interface GoalResponse {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string | null; // ISO date string, e.g. "2027-01-01"
}

export interface GoalRequest {
  name: string;
  targetAmount: number;
  deadline?: string;
}