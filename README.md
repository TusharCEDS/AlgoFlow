# AlgoFlow 🚀

A full-stack DSA learning and competitive practice platform built for students and IT professionals. Practice problems, battle friends in real-time, collaborate on code together, and get AI-powered hints when you're stuck.

---

## 🌟 Features

### 🧩 Problem Practice
- Curated DSA problems with difficulty tags
- In-browser C++ code editor powered by Monaco Editor
- Real-time code execution with test case validation
- AI-powered pattern detection and hints (Groq/Llama 3)
- Submit against hidden test cases — pass/fail breakdown

### ⚔️ Battle Mode
- Create a room and challenge a friend
- Both users get the same random problem
- Race to submit the correct solution first
- Real-time win/loss detection via WebSockets
- Battle history saved to dashboard

### 👥 Collaborative Editor
- Create a shared coding session
- Multiple users edit the same code simultaneously
- Real-time sync via WebSockets
- Session history saved

### 📊 Algorithm Visualizer
- **Sorting**: Bubble Sort, Selection Sort, Insertion Sort — animated bar charts
- **Array Search**: Linear Search, Binary Search — step-by-step element highlighting
- **Tree Traversal**: BFS and DFS on binary trees using React Flow

### 📈 Dashboard
- Problems solved, attempted, total submissions
- Acceptance rate
- Recent submission history
- Battle stats (wins/losses)
- Collab session count

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, Tailwind CSS |
| Code Editor | Monaco Editor |
| Algorithm Visualizer | React Flow |
| Backend | Node.js, Express |
| Real-time | Socket.io (WebSockets) |
| Database | PostgreSQL |
| Auth | JWT + bcryptjs |
| AI Hints | Groq API (Llama 3) |
| Code Execution | C++ + Docker (sandboxed) |
| State Management | React useState/useEffect |

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Next.js         │ ───► │  Node.js Backend  │ ───► │  PostgreSQL       │
│  Frontend        │      │  Express + WS     │      │  Database         │
│  :3000           │      │  :5000            │      │  :5433            │
└─────────────────┘      └──────────────────┘      └──────────────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │  Executor Service │
                         │  Node.js          │
                         │  :6001            │
                         └──────────────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │  Docker Container │
                         │  Isolated C++     │
                         │  Execution        │
                         └──────────────────┘
```

### Microservices Design
- **Backend** handles auth, problems, submissions, AI hints, WebSocket rooms
- **Executor** handles sandboxed C++ code execution independently
- Separation of concerns — if executor crashes, backend stays up

---

## 🔒 Code Execution Security

User-submitted code runs inside isolated Docker containers with:
- **Memory limit**: 256MB per execution
- **CPU limit**: 0.5 cores per execution
- **Timeout**: 5 seconds (TLE detection via Linux `timeout` command)
- **No network access** inside containers
- **Auto-cleanup**: temp files deleted after execution
- **Unique folders**: UUID-based isolation prevents race conditions between concurrent submissions

---

## 🗄️ Database Schema

```sql
users          → id, username, email, password, created_at
problems       → id, title, description, difficulty, tags, starter_code
test_cases     → id, problem_id, input, expected_output, is_sample
submissions    → id, user_id, problem_id, code, language, status, runtime_ms
battles        → id, room_id, winner_id, loser_id, problem_id
collab_sessions → id, room_id, created_by, final_code
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- PostgreSQL 17
- Docker Desktop

### 1. Clone the repository
```bash
git clone https://github.com/TusharCEDS/AlgoFlow.git
cd AlgoFlow
```

### 2. Set up the database
```bash
psql -U postgres -p 5433
```
```sql
CREATE DATABASE algoflow;
\c algoflow
-- Run the schema SQL (tables: users, problems, test_cases, submissions, battles, collab_sessions)
```

### 3. Set up the backend
```bash
cd backend
npm install
```

Create `.env`:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5433
DB_NAME=algoflow
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

```bash
npm run dev
```

### 4. Set up the executor
```bash
cd executor
npm install
docker build -t algoflow-cpp .
node index.js
```

### 5. Set up the frontend
```bash
cd frontend
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_EXECUTOR_URL=http://localhost:6001
```

```bash
npm run dev
```

### 6. Open the app
Go to `http://localhost:3000`

---

## 📁 Project Structure

```
AlgoFlow/
├── backend/
│   └── src/
│       ├── index.js          ← Express server + Socket.io
│       ├── routes/
│       │   ├── auth.js       ← Register, Login
│       │   ├── problems.js   ← Problem CRUD
│       │   ├── submissions.js ← Submit, Stats
│       │   └── ai.js         ← Groq hint generation
│       ├── middleware/
│       │   └── auth.js       ← JWT middleware
│       └── db/
│           └── index.js      ← PostgreSQL connection pool
├── executor/
│   ├── index.js              ← Code execution service
│   └── Dockerfile            ← GCC image for C++ compilation
└── frontend/
    └── src/app/
        ├── page.js           ← Homepage
        ├── login/            ← Login page
        ├── register/         ← Register page
        ├── dashboard/        ← User dashboard
        ├── problems/         ← Problems list
        ├── problem/[id]/     ← Problem solving page
        ├── battle/           ← Battle mode
        ├── collab/           ← Collaborative editor
        └── visualizer/       ← Algorithm visualizer
```

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/register    → Register new user
POST /api/auth/login       → Login, returns JWT
```

### Problems
```
GET  /api/problems         → List all problems
GET  /api/problems/:id     → Get problem + sample test cases
```

### Submissions
```
POST /api/submissions      → Submit code, run against all test cases
GET  /api/submissions/stats → User's solving stats
GET  /api/submissions/battle-stats → User's battle stats
```

### AI
```
POST /api/ai/hint          → Get AI hint for a problem
```

### Executor
```
POST /execute              → Run C++ code with input, returns output
```

---

## ⚡ WebSocket Events

### Battle Mode
| Event | Direction | Description |
|---|---|---|
| `create-room` | Client → Server | Create a new battle room |
| `join-room` | Client → Server | Join existing room |
| `room-created` | Server → Client | Room created, sends problem |
| `room-joined` | Server → Client | Joined successfully |
| `battle-start` | Server → Client | Both players ready |
| `battle-submit` | Client → Server | Submit solution |
| `battle-won` | Server → Client | Winner announced to all |
| `battle-submission-result` | Server → Client | Wrong answer feedback |

### Collaborative Editor
| Event | Direction | Description |
|---|---|---|
| `collab-create` | Client → Server | Create collab room |
| `collab-join` | Client → Server | Join collab room |
| `collab-created` | Server → Client | Room created with initial code |
| `collab-joined` | Server → Client | Joined with current code state |
| `collab-code-change` | Client → Server | Code updated by a user |
| `collab-code-update` | Server → Client | Broadcast code to other users |
| `collab-user-joined` | Server → Client | New user joined room |
| `collab-user-left` | Server → Client | User left room |

---

## 👤 Author

**Tushar** — Final year B.Tech Computer Engineering student at J.C. Bose University of Science and Technology, YMCA, Faridabad

---

## 📄 License

MIT License