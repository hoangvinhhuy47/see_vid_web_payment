import { apiClient } from './client';
import { LeaderboardEntry, PuzzleState } from '@/model/puzzle';
import { ApiResponse } from '@/model/api';

export const puzzleService = {
  getLeaderboard: async (): Promise<ApiResponse<LeaderboardEntry[]>> => {
    return apiClient.get<LeaderboardEntry[]>('/leaderboard');
  },

  submitScore: async (score: number, level: number): Promise<ApiResponse<{ rank: number }>> => {
    return apiClient.post<{ rank: number }>('/score', { score, level });
  },

  saveGameState: async (state: PuzzleState): Promise<ApiResponse<boolean>> => {
    return apiClient.post<boolean>('/save', state);
  },
};
