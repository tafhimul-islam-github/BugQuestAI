# BugQuest AI

> **Debug Smarter. Build Skills. Prove Your Progress.**

BugQuest AI is an AI-powered coding assessment and debugging platform engineered to help learners master algorithmic programming through practical challenges, isolated automated code assessment, progressive AI debugging hints, empirical skill tracking, personalized recommendations, and consent-controlled workforce-readiness reports.

---

## Key Highlights

- **Authentic Code Assessment**: Built-in multi-provider judge adapter supporting isolated sub-process sandbox execution, Piston, and Judge0. Student code is executed with memory limits, strict process timeouts, and private hidden boundary test suites.
- **4-Tier Progressive AI Debugging Coach**: Educational coaching using FastAPI + Pydantic + LLM structured JSON output. Progression levels:
  1. `nudge`: High-level conceptual nudge without revealing answers.
  2. `direction`: Concepts to research and relevant data structures.
  3. `debugging_guidance`: Specific edge cases and algorithmic bug diagnosis.
  4. `detailed_explanation`: Full walk-through for post-attempt review.
- **Evidence-Based Skill Intelligence**: Real-time scoring calculated solely from verified test executions across standard domains (Arrays, Hash Maps, Two Pointers, Stacks, Sliding Window). Zero score inflation from passive actions.
- **Deterministic Next-Challenge Recommendations**: Data-driven recommendations targeting diagnosed errors or advancing newly mastered topics.
- **Consent-Controlled Workforce-Readiness Reports**: Shareable candidate dossiers with 64-character unguessable cryptographic tokens, granular privacy scopes (diagnostics, code samples), and instant revocation.

---

## Monorepo Architecture

```
BugQuestAI/
├── frontend/             # React 18, TypeScript (Strict), Vite, Tailwind CSS, Monaco Editor
├── backend/              # Laravel 12 REST API, Sanctum Auth, Isolated Execution, SQLite/MySQL/Postgres
├── ai-service/           # FastAPI, Pydantic v2, LLM Provider Adapters (Gemini, OpenAI, Fallback)
├── tests/                # System-level E2E integration verification suites
├── docs/                 # In-depth technical documentation
│   ├── ARCHITECTURE.md   # Service communication and request lifecycles
│   ├── DATABASE.md       # Entity relationships, schema, and indexes
│   ├── API.md            # REST API reference and contracts
│   ├── AI.md             # Prompt engineering, structured schema, and guardrails
│   ├── SECURITY.md       # Isolation, prompt injection defense, token controls
│   ├── TESTING.md        # Test matrix, reproduction commands, and evidence
│   ├── DEPLOYMENT.md     # Docker Compose, environment configuration, health checks
│   └── KNOWN_LIMITATIONS.md # Operational constraints and roadmap
├── docker-compose.yml    # Multi-container orchestration (PostgreSQL, Redis, Backend, AI, Frontend)
└── .agents/skills/       # Custom Agent Skill for BugQuest engineering standards
```

---

## Quickstart Guide

### Prerequisites
- **Node.js**: v18+ and `npm`
- **PHP**: 8.2+ with `pdo_mysql` / `pdo_sqlite` and Composer
- **Python**: 3.10+ with `uv` or `pip`
- **Database**: MySQL 8 or PostgreSQL 15

### 1. Repository Setup & Environment
```bash
# Clone the repository
git clone https://github.com/tafhimul-islam-github/BugQuestAI.git
cd BugQuestAI

# Copy environment template
cp .env.example .env
```

### 2. Backend Setup (Laravel 12)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve --port=8000
```
*Seeded Demo Accounts:*
- **Learner**: `learner@bugquest.ai` / `password123`
- **Educator**: `educator@bugquest.ai` / `password123`
- **Admin**: `admin@bugquest.ai` / `password123`

### 3. AI Service Setup (FastAPI)
```bash
cd ../ai-service
# Using uv (recommended)
uv venv .venv
source .venv/bin/activate  # Or on Windows: .\.venv\Scripts\activate
uv pip install -r requirements.txt

# Start the AI service on port 8001
uvicorn main:app --host 127.0.0.1 --port 8001
```

### 4. Frontend Setup (React 18 + Vite)
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Automated Test Suites

```bash
# Backend Feature & Unit Tests (103 assertions)
cd backend
php artisan test

# AI Coaching Service Unit Tests (5 passed)
cd ../ai-service
pytest tests

# Frontend TypeScript Strict Check & Production Bundle
cd ../frontend
npm run build

# Comprehensive Live System Integration Verification (13 E2E test cases)
cd ..
python tests/verify_e2e_learner_flow.py
```

---

## Ethical Disclosure & Disclaimers

BugQuest AI is dedicated to transparent, evidence-based skill measurement:
- **No Employment Guarantee**: Scores reflect problem-solving ability on algorithmic benchmarks. They do not constitute a guarantee of commercial employment or measure unassessed interpersonal skills.
- **Judge Is Authority**: The automated code judge is the sole determinant of code correctness; AI coaching feedback is purely advisory.
- **Hidden Tests Confidentiality**: Private test cases and boundary conditions are never transmitted to student browsers or external AI prompts.

---

## License

Proprietary & Confidential. Built for workforce readiness assessment and educational skill acceleration.
