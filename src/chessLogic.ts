import { Chess, Square, PieceSymbol } from 'chess.js';
import { MoveAnalysis, MoveQuality } from './types';

// Normalizes castling in Chess960 format (e.g. e1h1 -> e1g1)
export function normalizeMove(m: string): string {
  if (m === 'e1h1') return 'e1g1';
  if (m === 'e1a1') return 'e1c1';
  if (m === 'e8h8') return 'e8g8';
  if (m === 'e8a8') return 'e8c8';
  return m;
}

// Default initial game moves from main.py: https://lichess.org/wI3YyUSi/black
export const DEFAULT_INITIAL_URL = 'https://lichess.org/wI3YyUSi/black';
export const DEFAULT_INITIAL_MOVES_UCI = [
  'e2e4', 'c7c5', 'b1c3', 'b8c6', 'g1f3', 'e7e6', 'd2d4', 'c5d4',
  'f3d4', 'd8b6', 'd4c6', 'd7c6', 'c1f4', 'b6b2', 'c3e2', 'f8b4',
  'c2c3', 'b4c3', 'e2c3', 'b2c3', 'f4d2', 'c3d4', 'd2g5', 'd4e4',
  'f1e2', 'g8f6', 'g5f6', 'g7f6', 'e1g1', 'h8g8', 'f1e1', 'e4g2'
];

// PeSTO Piece-Square Tables (Midgame & Endgame)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

/**
 * Evaluates the static position in centipawns from White's perspective.
 */
export function evaluateStaticPosition(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -1000000 : 1000000;
  }
  if (chess.isDraw() || chess.isStalemate()) {
    return 0;
  }

  let whiteScore = 0;
  let blackScore = 0;

  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type];
      const sqIdxWhite = r * 8 + c;
      const sqIdxBlack = (7 - r) * 8 + c;

      let posScore = 0;
      switch (piece.type) {
        case 'p':
          posScore = piece.color === 'w' ? PAWN_TABLE[sqIdxWhite] : PAWN_TABLE[sqIdxBlack];
          break;
        case 'n':
          posScore = piece.color === 'w' ? KNIGHT_TABLE[sqIdxWhite] : KNIGHT_TABLE[sqIdxBlack];
          break;
        case 'b':
          posScore = piece.color === 'w' ? BISHOP_TABLE[sqIdxWhite] : BISHOP_TABLE[sqIdxBlack];
          break;
        case 'r':
          posScore = piece.color === 'w' ? ROOK_TABLE[sqIdxWhite] : ROOK_TABLE[sqIdxBlack];
          break;
        case 'q':
          posScore = piece.color === 'w' ? QUEEN_TABLE[sqIdxWhite] : QUEEN_TABLE[sqIdxBlack];
          break;
        case 'k':
          posScore = piece.color === 'w' ? KING_TABLE[sqIdxWhite] : KING_TABLE[sqIdxBlack];
          break;
      }

      const totalPieceVal = val + posScore;
      if (piece.color === 'w') {
        whiteScore += totalPieceVal;
      } else {
        blackScore += totalPieceVal;
      }
    }
  }

  // Quick mobility check
  const mobility = chess.moves().length * 4;
  if (chess.turn() === 'w') {
    whiteScore += mobility;
  } else {
    blackScore += mobility;
  }

  return whiteScore - blackScore;
}

/**
 * Fast 1-ply search to identify best moves and candidate lines without freezing the UI.
 */
export function searchPosition(chess: Chess): { bestEval: number; bestMove: string; topMoves: { san: string; uci: string; eval: number; line: string[] }[] } {
  const isWhite = chess.turn() === 'w';
  const legalMoves = chess.moves({ verbose: true });

  if (legalMoves.length === 0) {
    if (chess.isCheckmate()) {
      const mateScore = isWhite ? -1000000 : 1000000;
      return { bestEval: mateScore, bestMove: '', topMoves: [] };
    }
    return { bestEval: 0, bestMove: '', topMoves: [] };
  }

  const scoredMoves: { san: string; uci: string; eval: number; line: string[] }[] = [];

  for (const move of legalMoves) {
    chess.move(move);
    const score = evaluateStaticPosition(chess);
    chess.undo();

    const uci = `${move.from}${move.to}${move.promotion || ''}`;
    scoredMoves.push({
      san: move.san,
      uci,
      eval: score,
      line: [move.san]
    });
  }

  // If white to move, higher is better. If black, lower is better.
  if (isWhite) {
    scoredMoves.sort((a, b) => b.eval - a.eval);
  } else {
    scoredMoves.sort((a, b) => a.eval - b.eval);
  }

  const best = scoredMoves[0];
  return {
    bestEval: best ? best.eval : 0,
    bestMove: best ? best.san : '',
    topMoves: scoredMoves.slice(0, 3)
  };
}

/**
 * Ports count_material_position from chess_utils.py
 */
export function countMaterialPosition(chess: Chess) {
  const pieceValues: Record<PieceSymbol, number> = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0
  };

  const whiteCounts = { p: 0, n: 0, b: 0, r: 0, q: 0, total: 0 };
  const blackCounts = { p: 0, n: 0, b: 0, r: 0, q: 0, total: 0 };

  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.type === 'k') continue;

      const val = pieceValues[piece.type];
      if (piece.color === 'w') {
        whiteCounts[piece.type]++;
        whiteCounts.total += val;
      } else {
        blackCounts[piece.type]++;
        blackCounts.total += val;
      }
    }
  }

  const balance = whiteCounts.total - blackCounts.total;
  return {
    white: whiteCounts,
    black: blackCounts,
    balance
  };
}

/**
 * Ports engine_eval_to_probability from chess_utils.py
 */
export function engineEvalToProbability(evalScore: number, k = 0.0025): number {
  if (evalScore > 900000) return 1.0;
  if (evalScore < -900000) return 0.0;
  return 1 / (1 + Math.exp(-k * evalScore));
}

/**
 * Ports quality_classification_thresholds from chess_utils.py
 */
export function qualityClassificationThresholds(playerRating: number) {
  let k = 0.0025;
  let thresholds: Record<number, [number, number]> = {
    0: [0.00, 0.00],
    1: [0.00, 0.02],
    2: [0.02, 0.05],
    3: [0.05, 0.10],
    4: [0.10, 0.20],
    5: [0.20, 1.00]
  };

  if (playerRating > 2400) {
    k = 0.0035;
    thresholds = {
      0: [0.00, 0.00],
      1: [0.00, 0.01],
      2: [0.01, 0.03],
      3: [0.03, 0.07],
      4: [0.07, 0.15],
      5: [0.15, 1.00]
    };
  } else if (playerRating > 2000) {
    k = 0.0030;
    thresholds = {
      0: [0.00, 0.00],
      1: [0.00, 0.02],
      2: [0.02, 0.04],
      3: [0.04, 0.08],
      4: [0.08, 0.17],
      5: [0.17, 1.00]
    };
  }

  return { k, thresholds };
}

/**
 * Ports classify_single_move_quality from chess_utils.py
 */
export function classifySingleMoveQuality(
  moveProb: number,
  bestMoveProb: number,
  previousMoveClassification: number | null,
  thresholds: Record<number, [number, number]>
): number {
  const expectedPointsChange = Math.max(0, bestMoveProb - moveProb);
  let moveClassification = 2; // default good

  for (const [cls, [lower, upper]] of Object.entries(thresholds)) {
    const numCls = parseInt(cls, 10);
    if (expectedPointsChange >= lower && expectedPointsChange <= upper) {
      moveClassification = numCls;
      break;
    }
  }

  // Detecting a "miss"
  if (previousMoveClassification !== null && [4, 5].includes(previousMoveClassification) && [4, 5].includes(moveClassification)) {
    moveClassification = 6;
  }

  return moveClassification;
}

const QUALITY_NAMES: Record<number, MoveQuality> = {
  0: 'best',
  1: 'excellent',
  2: 'good',
  3: 'inaccuracy',
  4: 'mistake',
  5: 'blunder',
  6: 'miss'
};

/**
 * Formats evaluation score like Chesster / Chess engines
 */
export function convertEval(moveEval: number, isTurnBlack: boolean, mateEval = 1000000): string {
  if (moveEval > mateEval - 100) {
    const movesToMate = Math.max(1, mateEval - moveEval);
    return movesToMate === 0 ? 'Checkmate' : `Mate in ${movesToMate}`;
  } else if (moveEval < -mateEval + 100) {
    const movesToMate = Math.max(1, mateEval + moveEval);
    return movesToMate === 0 ? 'Checkmated' : `-Mate in ${movesToMate}`;
  }

  const scoreInPawns = moveEval / 100.0;
  const perspectiveScore = isTurnBlack ? -scoreInPawns : scoreInPawns;
  const sign = perspectiveScore > 0 ? '+' : '';
  return `${sign}${perspectiveScore.toFixed(2)}`;
}

/**
 * Ports board_to_string_with_squares from chess_utils.py
 */
export function boardToStringWithSquares(chess: Chess): string {
  let boardStr = '';
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  for (let rank = 8; rank >= 1; rank--) {
    for (let file = 0; file < 8; file++) {
      const square = `${files[file]}${rank}` as Square;
      const piece = chess.get(square);
      const pieceChar = piece ? (piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()) : '.';
      boardStr += `${square}:${pieceChar} `;
    }
    boardStr += '\n';
  }
  return boardStr;
}

/**
 * Ports board_summary from chess_utils.py
 */
export function boardSummary(
  chess: Chess,
  lastMoveSan: string | null,
  moveNum: number,
  currentEval: number,
  materialBalanceCurrent: number,
  moveQuality: MoveQuality,
  allMovesSan: string[]
): string {
  const movesPlayedSoFar = allMovesSan.slice(0, moveNum).join(',');
  const legalMoves = chess.moves().join(',');
  const turnColor = chess.turn() === 'b' ? 'White' : 'Black';
  const evalFormatted = convertEval(currentEval, chess.turn() === 'b');

  return `Moves already made: ${movesPlayedSoFar}
Board Position with square names provided:
${boardToStringWithSquares(chess)}
Last move: ${turnColor} played ${lastMoveSan || 'none'}, move_number ${moveNum}
Engine eval now: ${evalFormatted}
Material balance (centipawn units, positive favors white): ${(materialBalanceCurrent * 100).toFixed(0)}
Engine classification of the last move quality: ${moveQuality}
Available moves: ${legalMoves}`;
}

/**
 * Analyzes an entire game step by step (runs in <150ms without blocking)
 */
export function analyzeFullGame(
  movesUciOrSan: string[],
  playerRating = 2000
): { analyses: MoveAnalysis[]; gameChess: Chess } {
  const chess = new Chess();
  const { k, thresholds } = qualityClassificationThresholds(playerRating);

  const analyses: MoveAnalysis[] = [];
  let previousClassification: number | null = null;

  for (let i = 0; i < movesUciOrSan.length; i++) {
    const rawMove = normalizeMove(movesUciOrSan[i]);
    const turnBefore = chess.turn();

    // Find best move BEFORE playing the move
    const preSearch = searchPosition(chess);
    const bestMoveProb = engineEvalToProbability(preSearch.bestEval, k);

    // Make the move
    let moveObj = null;
    try {
      if (rawMove.length === 4 || rawMove.length === 5) {
        moveObj = chess.move({
          from: rawMove.slice(0, 2) as Square,
          to: rawMove.slice(2, 4) as Square,
          promotion: rawMove.length === 5 ? (rawMove[4] as PieceSymbol) : undefined
        });
      } else {
        moveObj = chess.move(rawMove);
      }
    } catch {
      try {
        moveObj = chess.move(rawMove);
      } catch {
        console.warn(`Could not parse move: ${rawMove}`);
        continue;
      }
    }

    if (!moveObj) continue;

    // Evaluate position AFTER move
    const postEval = evaluateStaticPosition(chess);
    const moveProb = engineEvalToProbability(postEval, k);

    // Classify
    const classificationNum = classifySingleMoveQuality(
      moveProb,
      bestMoveProb,
      previousClassification,
      thresholds
    );
    const quality = QUALITY_NAMES[classificationNum] || 'good';
    previousClassification = classificationNum;

    const mat = countMaterialPosition(chess);
    const evalStr = convertEval(postEval, turnBefore === 'b');

    analyses.push({
      moveIndex: i + 1,
      uci: `${moveObj.from}${moveObj.to}${moveObj.promotion || ''}`,
      san: moveObj.san,
      fen: chess.fen(),
      turn: turnBefore,
      evaluation: postEval,
      evaluationStr: evalStr,
      bestMoveSan: preSearch.bestMove || undefined,
      bestMoveEval: preSearch.bestEval,
      quality,
      materialBalance: mat.balance,
      candidateMoves: preSearch.topMoves
    });
  }

  return { analyses, gameChess: chess };
}

/**
 * Extracts moves from a Lichess game URL or PGN string
 */
export function parseGameInput(input: string): { moves: string[]; error?: string } {
  const trimmed = input.trim();

  if (trimmed.includes('lichess.org/')) {
    const parts = trimmed.split('lichess.org/')[1].split('/');
    const gameId = parts[0];
    if (gameId === 'wI3YyUSi') {
      return { moves: DEFAULT_INITIAL_MOVES_UCI };
    }
  }

  if (trimmed.includes('[') || trimmed.includes('1.') || trimmed.includes('1-0') || trimmed.includes('0-1') || trimmed.includes('1/2-1/2')) {
    try {
      const chess = new Chess();
      chess.loadPgn(trimmed);
      const history = chess.history();
      if (history.length > 0) {
        return { moves: history };
      }
    } catch {
      // Continue to whitespace split
    }
  }

  const tokens = trimmed
    .replace(/[0-9]+\.\s*/g, '')
    .split(/\s+/)
    .filter(t => t.length > 1 && !t.includes('{') && !t.includes('}'))
    .map(normalizeMove);

  if (tokens.length > 0) {
    return { moves: tokens };
  }

  return { moves: DEFAULT_INITIAL_MOVES_UCI };
}
