import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onSelectSuggestion?: (text: string) => void;
  currentMoveText?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onSelectSuggestion,
  currentMoveText
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
    "What's the best move in this position?",
    'Is there any tactical threat or pin?',
    'Explain the pawn structure & strategic plan'
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden min-h-[460px]">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm shadow-sm">
            ♞
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-none">Chesster: Analyze & Learn</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Grandmaster AI Commentary & Position Review</p>
          </div>
        </div>
        {currentMoveText && (
          <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold border border-blue-100">
            {currentMoveText}
          </span>
        )}
      </div>

      {/* Message Output Area (Faithfully recreating PyQt info_text widget) */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-sm bg-slate-50/50"
      >
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="rounded bg-rose-50 border border-rose-100 p-2.5 shadow-xs">
                <span className="font-bold text-red-600 mr-1.5 select-none">User:</span>
                <span className="text-slate-800">{msg.text}</span>
              </div>
            );
          }

          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="text-xs text-slate-500 italic px-1 py-0.5 border-l-2 border-slate-300">
                {msg.text}
              </div>
            );
          }

          // Chesster response
          return (
            <div key={msg.id} className="rounded bg-white border border-slate-200 p-3 shadow-xs">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-bold text-blue-600 text-sm">Chesster:</span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
              </div>
              <div
                className="text-slate-700 leading-relaxed space-y-1.5"
                dangerouslySetInnerHTML={{
                  __html: msg.text.replace(/\n/g, '<br/>')
                }}
              />
            </div>
          );
        })}

        {/* Loading Indicator (PyQt 'Chesster is thinking...' in green) */}
        {isLoading && (
          <div className="flex items-center gap-2 rounded bg-emerald-50 border border-emerald-200 p-2.5 text-emerald-700 font-semibold text-xs animate-pulse">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
            <span>Chesster is thinking...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200 flex gap-1.5 overflow-x-auto text-xs no-scrollbar">
        {suggestions.map((sug, i) => (
          <button
            key={i}
            onClick={() => onSelectSuggestion?.(sug) || onSendMessage(sug)}
            disabled={isLoading}
            className="whitespace-nowrap rounded-md border border-slate-300 bg-white px-2.5 py-1 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition disabled:opacity-50"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Chat Input Bar (PyQt chat_input: "Chat with Chesster") */}
      <form onSubmit={handleSubmit} className="border-t border-slate-200 p-2.5 bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Chat with Chesster"
          disabled={isLoading}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
