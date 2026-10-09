# Chesster - Interactive Chess Analysis & Chatbot

Chesster is an interactive chess game review and analysis web application powered by Google Gemini and chess evaluation algorithms.

## Features

- **Visual Game Review**: Load chess games from Lichess URLs (e.g. `https://lichess.org/wI3YyUSi/black`), PGN, or move lists.
- **Move Navigation**: Step forward/backward through moves or jump directly to any move number.
- **Engine Analysis & Move Quality**: Classifies every move as Best, Excellent, Good, Inaccuracy, Mistake, Blunder, or Miss using logistic evaluation curves and player rating thresholds.
- **AI Grandmaster Chat (Chesster)**: Live interaction with an AI chess grandmaster using Google's Gemini models (`gemini-3.8-flash`), providing strategic ideas, tactical threats, and position explanations.
- **Material Balance & Position Summaries**: Accurate centipawn evaluations and material balance tracking across the game.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Chess Engine**: chess.js & minimax evaluation algorithms
- **AI Integration**: @google/genai (Gemini 3.8 Flash)
- **Backend**: Node.js & Express (dev server on port 3000)
