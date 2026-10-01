export type RuneType = 'fire' | 'water' | 'earth' | 'air' | 'arcane' | 'light';

export interface PuzzleTile {
  id: string;
  type: RuneType;
  row: number;
  col: number;
  isSelected?: boolean;
  isMatched?: boolean;
}

export interface PuzzleState {
  grid: PuzzleTile[][];
  score: number;
  movesLeft: number;
  level: number;
  targetScore: number;
  isGameOver: boolean;
  isCleared: boolean;
  selectedTile: { row: number; col: number } | null;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  level: number;
  avatarUrl?: string;
  countryCode?: string;
}
