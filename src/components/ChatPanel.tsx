import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';
import { ChatMessage, MoveAnalysis } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onSelectSuggestion?: (text: string) => void;
  currentMoveText?: string;
  currentAnalysis?: MoveAnalysis | null;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onSelectSuggestion,
  currentMoveText,
  currentAnalysis
}) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const suggestions = [
    'Why was this move played?',
    "What's the best move here?",
    'Any tactical threat or pin?',
    'Strategic plan for this position'
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900/40 border border-zinc-800/80 rounded-md overflow-hidden min-h-[460px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-2.5 bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold tracking-wide text-zinc-200">
            Grandmaster AI Analysis
          </span>
        </div>
        {currentMoveText && (
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/30">
            {currentMoveText}
          </span>
        )}
      </div>

      {/* Position Quick Snapshot */}
      {currentAnalysis && (
        <div className="border-b border-zinc-800/60 px-4 py-2 bg-zinc-950/40 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-zinc-500 mr-1.5">Eval:</span>
              <span className="text-zinc-200 font-semibold">{currentAnalysis.evaluationStr}</span>
            </div>
            {currentAnalysis.bestMoveSan && (
              <div>
                <span className="text-zinc-500 mr-1.5">Best:</span>
                <span className="text-emerald-400 font-semibold">{currentAnalysis.bestMoveSan}</span>
              </div>
            )}
          </div>
          <div>
            <span className="text-zinc-500 mr-1.5">Material:</span>
            <span className="text-zinc-300">
              {currentAnalysis.materialBalance > 0
                ? `+${currentAnalysis.materialBalance}`
                : currentAnalysis.materialBalance === 0
                ? 'Even'
                : currentAnalysis.materialBalance}
            </span>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm"
      >
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] rounded bg-zinc-800/80 border border-zinc-700/40 px-3 py-2 text-zinc-100 text-xs leading-relaxed">
                  {msg.text}
                </div>
              </div>
            );
          }

          if (msg.sender === 'system') {
            return (
              <div
                key={msg.id}
                className="text-[11px] font-mono text-zinc-500 text-center py-1 border-y border-zinc-800/30 my-1"
              >
                {msg.text}
              </div>
            );
          }

          // Chesster reply
          return (
            <div key={msg.id} className="flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-300">Chesster</span>
                <span className="text-[10px] text-zinc-500 font-mono">{msg.timestamp}</span>
              </div>
              <div
                className="text-zinc-300 leading-relaxed space-y-1.5 pl-0.5"
                dangerouslySetInnerHTML={{
                  __html: msg.text
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-100 font-semibold">$1</strong>')
                    .replace(/\n/g, '<br/>')
                }}
              />
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 pt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-mono text-[11px]">Analyzing position...</span>
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      <div className="px-3 py-2 border-t border-zinc-800/60 bg-zinc-950/20 flex gap-1.5 overflow-x-auto no-scrollbar">
        {suggestions.map((sug, i) => (
          <button
            key={i}
            onClick={() => onSelectSuggestion?.(sug) || onSendMessage(sug)}
            disabled={isLoading}
            className="whitespace-nowrap rounded border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-[11px] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800 transition disabled:opacity-40"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t border-zinc-800/80 p-2.5 bg-zinc-900/40 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Chesster about this position..."
          disabled={isLoading}
          className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none transition"
        >
          <span>Send</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
