import React from 'react';
import { MoveAnalysis, MoveQuality } from '../types';

interface GameReviewBarProps {
  analyses: MoveAnalysis[];
  currentIndex: number;
  onSelectMove: (index: number) => void;
}

const QUALITY_COLOR_MAP: Record<MoveQuality, string> = {
  best: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  excellent: { color: 'bg-teal-500 hover:bg-teal-600 text-white' } as any,
  good: 'bg-blue-500 hover:bg-blue-600 text-white',
  inaccuracy: 'bg-amber-400 hover:bg-amber-500 text-slate-900',
  mistake: 'bg-orange-500 hover:bg-orange-600 text-white',
  blunder: 'bg-rose-600 hover:bg-rose-700 text-white',
  miss: 'bg-purple-600 hover:bg-purple-700 text-white'
};

export const GameReviewBar: React.FC<GameReviewBarProps> = ({
  analyses,
  currentIndex,
  onSelectMove
}) => {
  if (analyses.length === 0) return null;

  // Compute counts
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
    <div className="w-full max-w-[540px] bg-white rounded-lg border border-slate-200 p-2.5 shadow-sm space-y-2">
      {/* Accuracy Badges Summary */}
      <div className="flex items-center justify-between gap-1 text-[11px] overflow-x-auto no-scrollbar font-medium">
        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">
          <span>⭐ Best:</span>
          <span className="font-bold">{counts.best}</span>
        </div>
        <div className="flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-100">
          <span>✨ Exc:</span>
          <span className="font-bold">{counts.excellent}</span>
        </div>
        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
          <span>👍 Good:</span>
          <span className="font-bold">{counts.good}</span>
        </div>
        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100">
          <span>⚠️ Inacc:</span>
          <span className="font-bold">{counts.inaccuracy}</span>
        </div>
        <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100">
          <span>❓ Mist:</span>
          <span className="font-bold">{counts.mistake}</span>
        </div>
        <div className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-100">
          <span>❌ Blund:</span>
          <span className="font-bold">{counts.blunder}</span>
        </div>
      </div>

      {/* Move Timeline List */}
      <div className="max-h-24 overflow-y-auto border border-slate-100 rounded bg-slate-50 p-1 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          {analyses.map((a, idx) => {
            const moveNum = Math.ceil(a.moveIndex / 2);
            const isWhite = a.moveIndex % 2 !== 0;
            const isSelected = currentIndex === a.moveIndex;
            const colorClass = QUALITY_COLOR_MAP[a.quality] || 'bg-slate-300';

            return (
              <button
                key={a.moveIndex}
                onClick={() => onSelectMove(a.moveIndex)}
                className={`flex items-center justify-between px-2 py-1 rounded text-left transition font-mono ${
                  isSelected
                    ? 'ring-2 ring-blue-600 bg-blue-50 font-bold text-blue-900 shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span className="text-[11px] text-slate-400">
                  {moveNum}{isWhite ? '.' : '...'}
                </span>
                <span className="font-semibold">{a.san}</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    a.quality === 'best'
                      ? 'bg-emerald-500'
                      : a.quality === 'excellent'
                      ? 'bg-teal-500'
                      : a.quality === 'good'
                      ? 'bg-blue-500'
                      : a.quality === 'inaccuracy'
                      ? 'bg-amber-400'
                      : a.quality === 'mistake'
                      ? 'bg-orange-500'
                      : a.quality === 'blunder'
                      ? 'bg-rose-600'
                      : 'bg-purple-600'
                  }`}
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
