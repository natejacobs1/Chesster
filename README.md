# Chesster ♞

An interactive chess game review, engine evaluation, and AI Grandmaster chatbot platform built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Google Gemini** (`gemini-3.8-flash`).

Step through any chess game move-by-move, inspect engine evaluations and move quality classifications, and converse with Chesster—an AI Grandmaster who breaks down tactics, threats, and strategic ideas in real time.

---

## Features

### 1. Interactive Chessboard & Navigation
- **Game Import**: Load games directly via Lichess URLs (e.g. `https://lichess.org/wI3YyUSi/black`), standard PGN notation, or UCI move strings.
- **Move Step-Through**: Step forward (`>`), backward (`<`), jump directly to any move number, jump to start (`|<`) or end (`>|`), and auto-play move sequences.
- **Board Orientation**: Flip the board orientation at any time to analyze from either White's or Black's perspective.
- **Vector Chess Pieces**: 100% self-contained inline SVG chess pieces for crisp, responsive rendering without external asset dependencies.

### 2. Engine Evaluation & Move Quality
- **Position Scoring**: Real-time centipawn engine evaluations and mate-in-N detection.
- **Move Classification**: Categorizes each played move using logistic win probability models and player rating thresholds:
  - ⭐ **Best**: Optimal engine move
  - ✨ **Excellent**: Preserves strong advantage
  - 👍 **Good**: Solid continuation
  - ⚠️ **Inaccuracy**: Slight concession of advantage
  - ❓ **Mistake**: Significant drop in winning chances
  - ❌ **Blunder**: Critical tactical oversight
  - ‼️ **Miss**: Overlooked opponent blunder
- **Material Balance Tracking**: Live material count and centipawn piece delta.
- **Move Review Timeline**: Clickable move grid with colored accuracy indicators for quick navigation to pivotal game moments.

### 3. AI Grandmaster Commentary (Chesster)
- **Live Board Awareness**: Chesster receives full game context with every query (moves played, current square-by-square board layout, material balance, engine evaluation, and legal moves).
- **Tactical Breakdown**: Identifies pins, skewers, discovered attacks, checks, and king safety vulnerabilities.
- **Strategic Guidance**: Explains pawn structures, piece harmony, and opening plans in encouraging language suited for players of all levels.
- **Zero-Key Visitor Experience**: Users interacting with your deployed app don't need their own API keys; calls are proxied securely through your server.
- **Offline / Quota Fallback**: Built-in algorithmic grandmaster heuristic ensures positional analysis remains available even when offline or awaiting network responses.

### 4. Linear-Inspired Minimalist Design
- Restrained dark neutral palette (`#090a0b` background with subtle zinc borders).
- Purposeful typography, custom thin scrollbars, and zero visual clutter.
- Fully responsive across desktop and mobile screens.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS 4, Lucide React |
| **Chess Engine** | `chess.js`, PeSTO piece-square heuristics, 1-ply tactical search |
| **Backend & API** | Node.js, Express, `@google/genai` (`gemini-3.8-flash`) |
| **Styling** | Tailwind CSS with custom dark neutral tokens |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (version 9 or higher)
- A free [Google AI Studio Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/chesster.git
cd chesster
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a local `.env` file in the project root:
```bash
cp .env.example .env
```

Open `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
```

> **Security Note**: Never commit your `.env` file to GitHub. The `.gitignore` file already excludes `.env` to prevent accidental credential leaks.

### 4. Start the Development Server
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## Deployment Guide

### Deploying on Render / Railway (Recommended for Full-Stack)
Platforms like [Render](https://render.com) or [Railway](https://railway.app) support full Node.js servers natively:

1. Push your repository to GitHub.
2. Create a new **Web Service** connected to your repository.
3. Configure settings:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. In the **Environment Variables** section, add:
   - `GEMINI_API_KEY`: `your_actual_gemini_api_key`
5. Deploy. Anyone visiting your URL can use the app without needing their own API key.

### Deploying on Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Under **Project Settings > Environment Variables**, add:
   - `GEMINI_API_KEY`: `your_actual_gemini_api_key`
3. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deploy the project.

---

## Project Structure

```
chesster/
├── src/
│   ├── components/
│   │   ├── ChessBoard.tsx       # 8x8 responsive board & square highlights
│   │   ├── ChessPieces.tsx      # Vector SVG chess pieces
│   │   ├── MoveControls.tsx     # Step navigation, jump, play, & flip toolbar
│   │   ├── GameReviewBar.tsx    # Move timeline & quality summary counts
│   │   └── ChatPanel.tsx        # Chesster dialogue & position snapshot
│   ├── types.ts                 # Move analysis & chat message TypeScript types
│   ├── chessLogic.ts            # Mathematical classification, evaluations, & PGN parser
│   ├── App.tsx                  # Main application container & state management
│   ├── main.tsx                 # React entry point
│   └── index.css                # Global Tailwind CSS and scrollbar styles
├── server.ts                    # Express server, Vite middleware, & /api/chat proxy
├── vite.config.ts               # Vite configuration (HMR, React, Tailwind)
├── package.json                 # Project dependencies & scripts
├── metadata.json                # AI Studio application metadata
└── README.md                    # Project documentation
```

---

## Available Scripts

- `npm run dev`: Starts the Express + Vite development server on port 3000.
- `npm run build`: Compiles TypeScript and builds the production bundle with Vite.
- `npm run lint`: Checks TypeScript types with `tsc --noEmit`.
- `npm start`: Runs the production server with `tsx server.ts`.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
