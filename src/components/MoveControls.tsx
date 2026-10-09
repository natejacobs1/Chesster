import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RotateCcw, Play, Pause } from 'lucide-react';
import { MoveAnalysis } from '../types';

interface MoveControlsProps {
  currentMoveIndex: number;
  totalMoves: number;
  currentAnalysis: MoveAnalysis | null;
  onGoToMove: (index: number) => void;
  onFlipBoard: () => void;
  flipped: boolean;
}

const QUALITY_STYLES: Record<string, { label: string; text: string; bg: string }> = {
  best: { label: 'Best', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  excellent: { label: 'Excellent', text: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
  good: { label: 'Good', text: 'text-zinc-300', bg: 'bg-zinc-800/40 border-zinc-700/40' },
  inaccuracy: { label: 'Inaccuracy', text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  mistake: { label: 'Mistake', text: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  blunder: { label: 'Blunder', text: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  miss: { label: 'Miss', text: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' }
};

export const MoveControls: React.FC<MoveControlsProps> = ({
  currentMoveIndex,
  totalMoves,
  currentAnalysis,
  onGoToMove,
  onFlipBoard,
  flipped
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputVal, setInputVal] = useState(currentMoveIndex.toString());

  useEffect(() => {
    setInputVal(currentMoveIndex.toString());
  }, [currentMoveIndex]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        if (currentMoveIndex < totalMoves) {
          onGoToMove(currentMoveIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentMoveIndex, totalMoves, onGoToMove]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= totalMoves) {
      onGoToMove(parsed);
    } else {
      setInputVal(currentMoveIndex.toString());
    }
  };

  const qualityInfo = currentAnalysis?.quality ? QUALITY_STYLES[currentAnalysis.quality] : null;

  return (
    <div className="w-full max-w-[540px] bg-zinc-900/40 border border-zinc-800/80 rounded-md px-3 py-2 flex flex-col gap-2">
      {/* Top Status Row */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">
            {currentMoveIndex === 0 ? 'START' : `MOVE ${currentMoveIndex}`}
          </span>
          <span className="font-semibold text-zinc-200">
            {currentMoveIndex === 0 ? 'Initial Board' : currentAnalysis?.san || ''}
          </span>
          {qualityInfo && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider ${qualityInfo.text} ${qualityInfo.bg}`}
            >
              {qualityInfo.label}
            </span>
          )}
        </div>

        {currentAnalysis && (
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-[11px]">EVAL</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-800/60 text-zinc-200 font-medium text-[11px] border border-zinc-700/30">
              {currentAnalysis.evaluationStr}
            </span>
          </div>
        )}
      </div>

      {/* Control Buttons Row */}
      <div className="flex items-center justify-between gap-1 border-t border-zinc-800/60 pt-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onGoToMove(0)}
            disabled={currentMoveIndex === 0}
            title="Start of game"
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onGoToMove(Math.max(0, currentMoveIndex - 1))}
            disabled={currentMoveIndex === 0}
            title="Previous move (<)"
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Move number input */}
        <form onSubmit={handleInputSubmit} className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={totalMoves}
            value={inputVal}
            onChange={handleInputChange}
            className="w-12 text-center font-mono py-1 px-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 transition"
          />
          <span className="text-[11px] font-mono text-zinc-500">/ {totalMoves}</span>
        </form>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onGoToMove(Math.min(totalMoves, currentMoveIndex + 1))}
            disabled={currentMoveIndex >= totalMoves}
            title="Next move (>)"
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGoToMove(totalMoves)}
            disabled={currentMoveIndex >= totalMoves}
            title="End of game"
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-0.5" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause' : 'Play moves'}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onFlipBoard}
            title="Flip board orientation"
            className={`p-1.5 rounded transition ${
              flipped ? 'text-blue-400 bg-blue-500/10' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
