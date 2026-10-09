import React from 'react';
import { MoveAnalysis, MoveQuality } from '../types';

interface GameReviewBarProps {
  analyses: MoveAnalysis[];
  currentIndex: number;
  onSelectMove: (index: number) => void;
}

const QUALITY_DOT_COLOR: Record<MoveQuality, string> = {
  best: 'bg-emerald-400',
  excellent: 'bg-teal-400',
  good: 'bg-zinc-500',
  inaccuracy: 'bg-amber-400',
  mistake: 'bg-orange-400',
  blunder: 'bg-rose-500',
  miss: 'bg-purple-400'
};

export const GameReviewBar: React.FC<GameReviewBarProps> = ({
  analyses,
  currentIndex,
  onSelectMove
}) => {
  if (analyses.length === 0) return null;

  const counts: Record<string, number> = {
    best: 0,
    excellent: 0,
    good: 0,
    inaccuracy: 0,
    mistake: 0,
    blunder: 0,
    miss: 0
  };

  analyses.forEach((a) => {
    if (counts[a.quality] !== undefined) {
      counts[a.quality]++;
    }
  });

  return (
    <div className="w-full max-w-[540px] bg-zinc-900/40 border border-zinc-800/80 rounded-md p-2.5 flex flex-col gap-2">
      {/* Accuracy Summary Counts */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 font-mono overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Best: <strong className="text-zinc-200">{counts.best}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
          <span>Exc: <strong className="text-zinc-200">{counts.excellent}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
          <span>Good: <strong className="text-zinc-200">{counts.good}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span>Inacc: <strong className="text-zinc-200">{counts.inaccuracy}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
          <span>Mistake: <strong className="text-zinc-200">{counts.mistake}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          <span>Blunder: <strong className="text-zinc-200">{counts.blunder}</strong></span>
        </div>
      </div>

      {/* Move Timeline Grid */}
      <div className="max-h-24 overflow-y-auto rounded bg-zinc-950/60 border border-zinc-800/40 p-1">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
          {analyses.map((a) => {
            const moveNum = Math.ceil(a.moveIndex / 2);
            const isWhite = a.moveIndex % 2 !== 0;
            const isSelected = currentIndex === a.moveIndex;
            const dotClass = QUALITY_DOT_COLOR[a.quality] || 'bg-zinc-600';

            return (
              <button
                key={a.moveIndex}
                onClick={() => onSelectMove(a.moveIndex)}
                className={`flex items-center justify-between px-2 py-1 rounded text-left transition font-mono text-xs ${
                  isSelected
                    ? 'bg-zinc-800 text-white font-medium border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
                }`}
              >
                <span className="text-[10px] text-zinc-500">
                  {moveNum}{isWhite ? '.' : '..'}
                </span>
                <span className="font-medium text-[11px]">{a.san}</span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${dotClass} opacity-80`}
                  title={a.quality}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
