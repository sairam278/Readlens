# ReadLens

An AI-powered reading companion that helps you understand, quiz yourself on, and track progress through complex documents — built with React, Node.js, and Google Gemini.

---

## Features

- **Document Map** — visual overview of a document's structure and key concepts
- **AI Reading Assistant** — simplify passages, define terms, and ask questions in-context
- **Challenge / Quiz** — auto-generated questions to test comprehension, with concept-level scoring
- **Summary Screen** — post-quiz breakdown highlighting weak concepts
- **Progress Tracking** — per-concept mastery scores across reading sessions
- **Dark / Light theme** — persisted across sessions
- **Keyboard shortcuts** — power-user controls (`?` to view all)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express |
| AI | Google Gemini (`@google/generative-ai`) |
| Auth | JWT + bcryptjs |
| Storage | Supabase (PostgreSQL + file storage) |
| PDF parsing | `pdf-parse`, `multer` |

---

## Project Structure

```
ReadLens/
├── src/                        # Frontend (React)
│   ├── pages/
│   │   ├── LandingScreen.jsx
│   │   ├── DashboardScreen.jsx
│   │   ├── DocMapScreen.jsx
│   │   ├── ReadingScreen.jsx
│   │   ├── QuizScreen.jsx
│   │   ├── SummaryScreen.jsx
│   │   ├── ProgressScreen.jsx
│   │   ├── LoginScreen.jsx
│   │   └── SignupScreen.jsx
│   ├── components/
│   │   ├── VisualizationPanel.jsx
│   │   ├── LogoMark.jsx
│   │   └── ErrorBoundary.jsx
│   ├── data/                   # Static/mock data
│   └── App.jsx
├── backend/                    # Backend (Node.js/Express)
│   ├── src/
│   │   ├── routes/             # auth, documents, ai, sessions, users
│   │   ├── middleware/         # JWT auth, rate limiting
│   │   ├── prompts/            # Gemini prompt templates
│   │   ├── services/           # Gemini, PDF parser, Supabase storage
│   │   └── index.js
│   ├── schema.sql
│   └── .env.example
├── index.html
├── vite.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google Gemini](https://aistudio.google.com/app/apikey) API key

### 1. Clone the repo

```bash
git clone https://github.com/sairan278/Readlens.git
cd Readlens
```

### 2. Frontend setup

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

### 3. Backend setup

```bash
cd backend
npm install
```

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

JWT_SECRET=your-very-long-random-secret

GEMINI_API_KEY=your-gemini-api-key
```

Run the database schema against your Supabase project, then start the server:

```bash
npm run dev
```

The API runs on `http://localhost:5000`.

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/documents` | Yes | List user's documents |
| POST | `/api/documents` | Yes | Upload a PDF |
| POST | `/api/ai/ask` | Yes | Ask a question about a document |
| POST | `/api/ai/simplify` | Yes | Simplify a passage |
| POST | `/api/ai/define` | Yes | Define a term |
| POST | `/api/ai/quiz` | Yes | Generate quiz questions |
| POST | `/api/ai/highlights` | Yes | Extract key highlights |
| POST | `/api/ai/docmap` | Yes | Generate document map |
| GET | `/api/sessions` | Yes | Reading session history |
| GET | `/api/users/me` | Yes | Current user profile |

---

## Keyboard Shortcuts

| Key | Action | Context |
|---|---|---|
| `F` | Toggle Focus mode | Reading |
| `S` | Toggle Simplify All | Reading |
| `N` | Open Notes tab | Reading |
| `C` | Start Challenge | Reading |
| `?` | Show shortcuts modal | Anywhere |

---

## License

MIT
