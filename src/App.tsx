import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessBoard } from './components/ChessBoard';
import { MoveControls } from './components/MoveControls';
import { ChatPanel } from './components/ChatPanel';
import { GameReviewBar } from './components/GameReviewBar';
import {
  DEFAULT_INITIAL_URL,
  DEFAULT_INITIAL_MOVES_UCI,
  analyzeFullGame,
  boardSummary,
  parseGameInput,
  countMaterialPosition,
  normalizeMove
} from './chessLogic';
import { MoveAnalysis, ChatMessage } from './types';
import { RotateCw, ArrowRight } from 'lucide-react';

export default function App() {
  const [urlInput, setUrlInput] = useState(DEFAULT_INITIAL_URL);
  const [movesList, setMovesList] = useState<string[]>(DEFAULT_INITIAL_MOVES_UCI);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState<MoveAnalysis[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Board state corresponding to currentMoveIndex
  const currentChess = useMemo(() => {
    const c = new Chess();
    for (let i = 0; i < currentMoveIndex && i < movesList.length; i++) {
      const m = normalizeMove(movesList[i]);
      try {
        if (m.length === 4 || m.length === 5) {
          c.move({
            from: m.slice(0, 2) as Square,
            to: m.slice(2, 4) as Square,
            promotion: m.length === 5 ? (m[4] as any) : undefined
          });
        } else {
          c.move(m);
        }
      } catch (err) {
        console.warn(`Could not apply move ${m}`, err);
        continue;
      }
    }
    return c;
  }, [movesList, currentMoveIndex]);

  // Current move analysis (if moveIndex > 0)
  const currentAnalysis = useMemo(() => {
    if (currentMoveIndex === 0 || analyses.length === 0) return null;
    return analyses[currentMoveIndex - 1] || null;
  }, [currentMoveIndex, analyses]);

  // Analyze the game whenever movesList changes
  const runGameAnalysis = useCallback((moves: string[]) => {
    setIsAnalyzing(true);

    setTimeout(() => {
      try {
        const { analyses: newAnalyses } = analyzeFullGame(moves);
        setAnalyses(newAnalyses);
      } catch (err) {
        console.error('Analysis failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 40);
  }, []);

  // Initial load
  useEffect(() => {
    setMessages([
      {
        id: 'intro',
        sender: 'chesster',
        text: 'Welcome to **Chesster**. Navigate through the game moves below to review the engine evaluation and quality classifications, or ask me any question about the position.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    runGameAnalysis(DEFAULT_INITIAL_MOVES_UCI);
  }, [runGameAnalysis]);

  // Handle URL enter / Game import
  const handleUrlSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    // Check if we can fetch from lichess API or local parser
    let parsed = parseGameInput(urlInput);

    if (parsed.moves.length <= 1 && urlInput.includes('lichess.org/')) {
      try {
        const res = await fetch(`/api/fetch-game?url=${encodeURIComponent(urlInput)}`);
        const data = await res.json();
        if (data.moves && data.moves.length > 0) {
          parsed = { moves: data.moves };
        }
      } catch (err) {
        console.warn('Backend fetch failed, using fallback parser', err);
      }
    }

    setMovesList(parsed.moves);
    setCurrentMoveIndex(0);
    runGameAnalysis(parsed.moves);

    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'system',
        text: `Loaded game with ${parsed.moves.length} moves. Ready for analysis.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Move selection without spamming chat logs
  const handleGoToMove = (index: number) => {
    if (index >= 0 && index <= movesList.length) {
      setCurrentMoveIndex(index);
    }
  };

  // Handle chat message
  const handleSendMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    const mat = countMaterialPosition(currentChess);
    const lastMoveSan = currentAnalysis?.san || null;
    const currentEval = currentAnalysis?.evaluation || 0;
    const moveQuality = currentAnalysis?.quality || 'good';
    const allSanMoves = analyses.map((a) => a.san);

    const chessPrompt = boardSummary(
      currentChess,
      lastMoveSan,
      currentMoveIndex,
      currentEval,
      mat.balance,
      moveQuality,
      allSanMoves
    );

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          chessContext: chessPrompt
        })
      });

      const data = await response.json();
      const replyText = data.reply || "I couldn't process that position at this moment.";

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'chesster',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error('Chat request failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'chesster',
          text: `In this position with evaluation **${currentAnalysis?.evaluationStr || 'even'}**, prioritize king shelter and piece mobility.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0b] text-zinc-100 flex flex-col font-sans selection:bg-blue-600/30">
      {/* Sleek Minimalist Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          {/* Logo / Branding */}
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
              <span className="text-zinc-400">♞</span>
              <span>Chesster</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500 border-l border-zinc-800 pl-2.5">
              Review & AI
            </span>
          </div>

          {/* URL Input Bar */}
          <form onSubmit={handleUrlSubmit} className="flex-1 max-w-md flex items-center gap-1.5">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Lichess URL or PGN..."
              className="w-full rounded bg-zinc-900/90 border border-zinc-800/80 px-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 font-mono focus:outline-none focus:border-zinc-600 transition"
            />
            <button
              type="submit"
              disabled={isAnalyzing}
              title="Load & Analyze"
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/60 text-xs font-mono transition disabled:opacity-40 flex items-center gap-1"
            >
              {isAnalyzing ? (
                <RotateCw className="w-3 h-3 animate-spin text-zinc-400" />
              ) : (
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              )}
            </button>
          </form>

          {/* Quick preset */}
          <button
            type="button"
            onClick={() => {
              setUrlInput(DEFAULT_INITIAL_URL);
              setMovesList(DEFAULT_INITIAL_MOVES_UCI);
              setCurrentMoveIndex(0);
              runGameAnalysis(DEFAULT_INITIAL_MOVES_UCI);
            }}
            className="hidden md:inline-flex text-[11px] font-mono text-zinc-400 hover:text-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
          >
            Sample: wI3YyUSi
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Board, Controls & Notation timeline */}
        <div className="lg:col-span-7 flex flex-col items-center gap-3 w-full">
          {/* Note: ChessBoard component remains exactly as designed */}
          <ChessBoard
            chess={currentChess}
            flipped={flipped}
            currentAnalysis={currentAnalysis}
          />

          <MoveControls
            currentMoveIndex={currentMoveIndex}
            totalMoves={movesList.length}
            currentAnalysis={currentAnalysis}
            onGoToMove={handleGoToMove}
            onFlipBoard={() => setFlipped(!flipped)}
            flipped={flipped}
          />

          <GameReviewBar
            analyses={analyses}
            currentIndex={currentMoveIndex}
            onSelectMove={handleGoToMove}
          />
        </div>

        {/* Right Column: Clean Analysis & Chat Panel */}
        <div className="lg:col-span-5 flex flex-col h-[580px] w-full">
          <ChatPanel
            messages={messages}
            isLoading={isChatLoading}
            onSendMessage={handleSendMessage}
            currentAnalysis={currentAnalysis}
            currentMoveText={
              currentMoveIndex === 0
                ? 'Initial Board'
                : `Move ${currentMoveIndex}: ${currentAnalysis?.san || ''}`
            }
          />
        </div>
      </main>
    </div>
  );
}
