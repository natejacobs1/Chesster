import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const SYS_PROMPT = `You are a chess grandmaster who is helping the user understand a chess position. Only respond to chess-related messages. If the user asks any non-chess questions, politely decline and remind them that you are here to help with chess only.
If the message is about chess, identify checks, captures, and immediate threats, give strategic ideas and tactical opportunities, and keep replies concise.
Always respond in a friendly and encouraging tone, suitable for players of all levels.`;

// Gemini AI client initialization
const apiKey = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenAI | null = null;
if (apiKey) {
  try {
    genAI = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI:', err);
  }
}

// Fallback grandmaster commentary generator when offline or before API response
function generateGrandmasterFallback(userMessage: string, chessContext: string): string {
  const userLower = userMessage.toLowerCase();
  
  // Extract info from chess context
  const lastMoveMatch = chessContext.match(/Last move:\s*([^\n]+)/);
  const evalMatch = chessContext.match(/Engine eval now:\s*([^\n]+)/);
  const qualityMatch = chessContext.match(/Engine classification of the last move quality:\s*([^\n]+)/);
  const materialMatch = chessContext.match(/Material balance[^:]*:\s*([^\n]+)/);

  const lastMove = lastMoveMatch ? lastMoveMatch[1].trim() : 'the last move';
  const evalStr = evalMatch ? evalMatch[1].trim() : 'even';
  const quality = qualityMatch ? qualityMatch[1].trim() : 'good';
  const material = materialMatch ? materialMatch[1].trim() : '0';

  if (userLower.includes('blunder') || userLower.includes('mistake') || userLower.includes('why') || quality === 'blunder' || quality === 'mistake') {
    return `In this position, **${lastMove}** was categorized as a **${quality}**. The engine evaluation shifted to **${evalStr}**. This move concedes important central squares and allows the opponent rapid piece activity. Look for open files, undefended pieces, or tactical forks that can be exploited here!`;
  }

  if (userLower.includes('best') || userLower.includes('what to play') || userLower.includes('next')) {
    return `The current position shows an evaluation of **${evalStr}** with a material balance of ${material} centipawns. The primary plan should focus on controlling the key central files, coordinating your rooks and minor pieces, and watching for tactical skewers or king safety weaknesses.`;
  }

  if (userLower.includes('threat') || userLower.includes('check') || userLower.includes('attack')) {
    return `Be watchful of direct tactical threats! Inspect the alignment of the queens and rooks, check whether the opponent has any checks, captures, or pins, and ensure your king's pawn shelter remains solid.`;
  }

  return `Looking at this board state after **${lastMove}** (evaluation: **${evalStr}**, classification: **${quality}**): Key strategic concepts to remember here are maintaining piece harmony, looking for active pawn breaks, and converting piece activity into a tangible advantage.`;
}

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, chessContext, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const fullPrompt = `${SYS_PROMPT}\n\nUser Question: ${message}\n\nChess Context:\n${chessContext || 'Standard initial chess position.'}`;

    // If Gemini client is available, call the Gemini API
    if (genAI && process.env.GEMINI_API_KEY) {
      try {
        const response = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: fullPrompt,
        });

        if (response && response.text) {
          return res.json({ reply: response.text });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, using grandmaster fallback:', geminiError?.message || geminiError);
      }
    }

    // Grandmaster fallback
    const fallbackReply = generateGrandmasterFallback(message, chessContext || '');
    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate chat response' });
  }
});

// Lichess Game fetcher endpoint to avoid CORS issues
app.get('/api/fetch-game', async (req, res) => {
  try {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    let gameId = url;
    if (url.includes('lichess.org/')) {
      const parts = url.split('lichess.org/')[1].split('/');
      gameId = parts[0];
    }

    // Try fetching from lichess
    const response = await fetch(`https://lichess.org/${gameId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chesster/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    const html = await response.text();
    // Match UCI moves sequence in page data
    const uciRegex = /"([a-h][1-8][a-h][1-8][qrbn]?)"/g;
    const matches = [...html.matchAll(uciRegex)].map(m => m[1]);

    if (matches.length > 5) {
      return res.json({ moves: matches });
    }

    return res.json({ moves: [] });
  } catch (error: any) {
    console.error('Fetch game error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Vite middleware in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const fs = await import('fs');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        hmr: false
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback for SPA routing in development
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let html = fs.readFileSync(indexPath, 'utf-8');
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chesster dev server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
