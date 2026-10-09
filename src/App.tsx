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
import { Search, RotateCw, ExternalLink, BookOpen } from 'lucide-react';

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
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'system',
        text: 'Analyzing game with engine evaluation & move quality classification...',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

    setTimeout(() => {
      try {
        const { analyses: newAnalyses } = analyzeFullGame(moves);
        setAnalyses(newAnalyses);
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'system',
            text: `Finished game analysis (${newAnalyses.length} moves evaluated).`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      } catch (err) {
        console.error('Analysis failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 50);
  }, []);

  // Initial load
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'system',
        text: 'Chesster initialized. Game loaded: https://lichess.org/wI3YyUSi/black',
        timestamp: new Date().toLocaleTimeString()
      },
      {
        id: 'intro',
        sender: 'chesster',
        text: 'Welcome to **Chesster**! I am your AI Chess Grandmaster. Step through the game using the navigation controls and ask me anything about the moves, tactics, mistakes, or plans.',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    runGameAnalysis(DEFAULT_INITIAL_MOVES_UCI);
  }, [runGameAnalysis]);

  // Handle URL enter / Game import
  const handleUrlSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'system',
        text: `New URL / game entered: ${urlInput}`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

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
  };

  // Move selection
  const handleGoToMove = (index: number) => {
    if (index >= 0 && index <= movesList.length) {
      setCurrentMoveIndex(index);
      const moveLabel =
        index === 0
          ? 'Initial position'
          : `Move ${index}: ${analyses[index - 1]?.san || movesList[index - 1]}`;

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'system',
          text: moveLabel,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  };

  // Handle chat message
  const handleSendMessage = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    // Construct prompt context matching chess_utils.py / gui_utils.py
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
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } catch (err: any) {
      console.error('Chat request failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'chesster',
          text: `In this position with evaluation **${currentAnalysis?.evaluationStr || 'even'}**, focus on piece activity and king safety. (Error communicating with AI service)`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-lg shadow-sm">
              ♞
            </span>
            <div>
              <h1 className="text-base font-bold leading-tight flex items-center gap-2">
                <span>Chesster</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Game Review & AI
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Interactive Chess Analysis GUI & Chatbot</p>
            </div>
          </div>

          {/* Game URL Input Bar (PyQt url_input) */}
          <form onSubmit={handleUrlSubmit} className="flex-1 max-w-xl flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter game URL (e.g. https://lichess.org/wI3YyUSi/black)"
                className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition shadow-xs"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>Analyze</span>
            </button>
          </form>

          {/* Sample Game presets */}
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setUrlInput('https://lichess.org/wI3YyUSi/black');
                setMovesList(DEFAULT_INITIAL_MOVES_UCI);
                setCurrentMoveIndex(0);
                runGameAnalysis(DEFAULT_INITIAL_MOVES_UCI);
              }}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px]"
            >
              Default Game (wI3YyUSi)
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout (Faithfully recreating PyQt layout: Board/controls on Left, Info on Right) */}
      <main className="max-w-7xl w-full mx-auto p-4 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Board, Controls & Review timeline */}
        <div className="lg:col-span-7 flex flex-col items-center gap-3">
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

        {/* Right Column: Info & Chat Panel */}
        <div className="lg:col-span-5 flex flex-col h-[640px]">
          <ChatPanel
            messages={messages}
            isLoading={isChatLoading}
            onSendMessage={handleSendMessage}
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
