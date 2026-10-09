import React from 'react';
import { Chess, Square } from 'chess.js';
import { MoveAnalysis } from '../types';
import { ChessPiece } from './ChessPieces';

interface ChessBoardProps {
  chess: Chess;
  flipped: boolean;
  currentAnalysis: MoveAnalysis | null;
  onSquareClick?: (sq: Square) => void;
  selectedSquare?: Square | null;
  legalMovesFromSelected?: Square[];
}

const QUALITY_BADGES: Record<string, { label: string; bg: string; icon: string }> = {
  best: { label: 'Best', bg: 'bg-emerald-600', icon: '⭐' },
  excellent: { label: 'Excellent', bg: 'bg-teal-600', icon: '✨' },
  good: { label: 'Good', bg: 'bg-blue-600', icon: '👍' },
  inaccuracy: { label: 'Inaccuracy', bg: 'bg-amber-500', icon: '⚠️' },
  mistake: { label: 'Mistake', bg: 'bg-orange-600', icon: '❓' },
  blunder: { label: 'Blunder', bg: 'bg-rose-600', icon: '❌' },
  miss: { label: 'Miss', bg: 'bg-purple-600', icon: '‼️' }
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  chess,
  flipped,
  currentAnalysis,
  onSquareClick,
  selectedSquare,
  legalMovesFromSelected = []
}) => {
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = flipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const lastMoveFrom = currentAnalysis?.uci ? currentAnalysis.uci.slice(0, 2) : null;
  const lastMoveTo = currentAnalysis?.uci ? currentAnalysis.uci.slice(2, 4) : null;
  const qualityBadge = currentAnalysis?.quality ? QUALITY_BADGES[currentAnalysis.quality] : null;

  return (
    <div className="relative aspect-square w-full max-w-[540px] select-none rounded-lg border-4 border-amber-950 bg-amber-950 shadow-xl overflow-hidden">
      <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
        {ranks.map((rank) =>
          files.map((file) => {
            const squareName = `${file}${rank}` as Square;
            const piece = chess.get(squareName);
            const isLight = (file.charCodeAt(0) - 97 + rank) % 2 !== 0;

            const isLastMoveFrom = lastMoveFrom === squareName;
            const isLastMoveTo = lastMoveTo === squareName;
            const isSelected = selectedSquare === squareName;
            const isLegalDest = legalMovesFromSelected.includes(squareName);

            // Square coloring
            let squareBg = isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]';
            if (isLastMoveFrom || isLastMoveTo) {
              squareBg = isLight ? 'bg-[#cdd26a]' : 'bg-[#aaa23a]';
            }
            if (isSelected) {
              squareBg = 'bg-[#7fa650]';
            }

            return (
              <div
                key={squareName}
                onClick={() => onSquareClick?.(squareName)}
                className={`relative flex items-center justify-center cursor-pointer transition-colors ${squareBg}`}
              >
                {/* Square coordinate labels */}
                {file === (flipped ? 'h' : 'a') && (
                  <span
                    className={`absolute left-0.5 top-0.5 text-[10px] font-bold leading-none ${
                      isLight ? 'text-[#b58863]' : 'text-[#f0d9b5]'
                    }`}
                  >
                    {rank}
                  </span>
                )}
                {rank === (flipped ? 8 : 1) && (
                  <span
                    className={`absolute bottom-0.5 right-0.5 text-[10px] font-bold leading-none ${
                      isLight ? 'text-[#b58863]' : 'text-[#f0d9b5]'
                    }`}
                  >
                    {file}
                  </span>
                )}

                {/* Move destination hint dot */}
                {isLegalDest && (
                  <div
                    className={`absolute z-10 rounded-full ${
                      piece ? 'h-full w-full border-4 border-black/30' : 'h-3.5 w-3.5 bg-black/25'
                    }`}
                  />
                )}

                {/* Piece icon */}
                {piece && (
                  <div className="relative z-2 h-[84%] w-[84%] pointer-events-none drop-shadow-sm transition-transform active:scale-95">
                    <ChessPiece type={piece.type} color={piece.color} />
                  </div>
                )}

                {/* Quality badge indicator on target square */}
                {isLastMoveTo && qualityBadge && (
                  <div
                    title={`Move Quality: ${qualityBadge.label}`}
                    className={`absolute -top-1.5 -right-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-white shadow-md ring-1 ring-white ${qualityBadge.bg}`}
                  >
                    {qualityBadge.icon}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
