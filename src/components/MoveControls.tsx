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

  return (
    <div className="flex flex-col gap-2 w-full max-w-[540px] bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
      {/* Current move info header */}
      <div className="flex items-center justify-between text-sm px-1 font-medium">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Position:</span>
          <span className="font-semibold text-slate-800">
            {currentMoveIndex === 0
              ? 'Initial Position'
              : `Move ${Math.ceil(currentMoveIndex / 2)} (${currentAnalysis?.san || 'played'})`}
          </span>
          {currentAnalysis && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-white ${
                currentAnalysis.quality === 'best'
                  ? 'bg-emerald-600'
                  : currentAnalysis.quality === 'excellent'
                  ? 'bg-teal-600'
                  : currentAnalysis.quality === 'good'
                  ? 'bg-blue-600'
                  : currentAnalysis.quality === 'inaccuracy'
                  ? 'bg-amber-500'
                  : currentAnalysis.quality === 'mistake'
                  ? 'bg-orange-600'
                  : currentAnalysis.quality === 'blunder'
                  ? 'bg-rose-600'
                  : 'bg-purple-600'
              }`}
            >
              {currentAnalysis.quality}
            </span>
          )}
        </div>

        {currentAnalysis && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Eval:</span>
            <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {currentAnalysis.evaluationStr}
            </span>
          </div>
        )}
      </div>

      {/* Control Buttons (replicating PyQt layout: <, input, >) */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onGoToMove(0)}
            disabled={currentMoveIndex === 0}
            title="Start of game"
            className="p-2 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGoToMove(Math.max(0, currentMoveIndex - 1))}
            disabled={currentMoveIndex === 0}
            title="Previous move (<)"
            className="px-3.5 py-2 font-bold text-base rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Move number input form */}
        <form onSubmit={handleInputSubmit} className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={totalMoves}
            value={inputVal}
            onChange={handleInputChange}
            placeholder="Move number"
            className="w-16 text-center font-mono py-1.5 px-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
          />
          <span className="text-xs text-slate-400">/ {totalMoves}</span>
        </form>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onGoToMove(Math.min(totalMoves, currentMoveIndex + 1))}
            disabled={currentMoveIndex >= totalMoves}
            title="Next move (>)"
            className="px-3.5 py-2 font-bold text-base rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGoToMove(totalMoves)}
            disabled={currentMoveIndex >= totalMoves}
            title="End of game"
            className="p-2 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause' : 'Play moves'}
            className="p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={onFlipBoard}
            title="Flip board orientation"
            className={`p-2 rounded transition ${flipped ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
