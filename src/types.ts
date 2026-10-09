export type MoveQuality = 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'miss';

export interface MoveAnalysis {
  moveIndex: number;
  uci: string;
  san: string;
  fen: string;
  turn: 'w' | 'b';
  evaluation: number; // centipawns or mate score
  evaluationStr: string; // e.g. "+0.35", "-1.20", "Mate in 2"
  bestMoveSan?: string;
  bestMoveUci?: string;
  bestMoveEval?: number;
  quality: MoveQuality;
  materialBalance: number; // in pawns (positive = white ahead)
  candidateMoves: {
    san: string;
    uci: string;
    eval: number;
    line: string[];
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'chesster' | 'system';
  text: string;
  timestamp: string;
  isHtml?: boolean;
}
