---
name: bugquest-engineering
description: Core architecture guidelines, security rules, and engineering conventions for BugQuest AI full-stack development, code assessment, and AI debugging services.
---

# BugQuest AI Engineering Guidelines

This skill defines the engineering standards, architecture, and security protocols for BugQuest AI. Apply these guidelines across all sessions working on the BugQuest AI codebase.

## 1. Architectural Integrity & Conventions
- Maintain clean boundaries between services:
  - `frontend/`: React, TypeScript (strict mode), Vite, Tailwind CSS, TanStack Query, Monaco Editor.
  - `backend/`: Laravel REST API, database persistence, authorization, submission lifecycle, and external adapters.
  - `ai-service/`: FastAPI, Python, Pydantic, LLM provider integration, prompt engineering, structured hint generation.
  - `infrastructure/`: Docker Compose, deployment configs, reverse proxy.
- Keep business logic separate from UI presentation components.
- Use explicit, typed API contracts (DTOs / Pydantic models / TypeScript interfaces).

## 2. Security & Data Protection
- **Untrusted Input**: Validate all untrusted input on the server (Laravel FormRequests / FastAPI Pydantic models).
- **Backend Authorization**: Enforce server-side authorization policies for all protected endpoints. Never rely on frontend UI toggles.
- **Secrets Management**: Never commit API keys, database credentials, or provider secrets into git or client-side bundles. Use `.env` variables.
- **Untrusted Code Execution**: Never execute learner-submitted code directly inside Laravel, FastAPI, or host machines. Always delegate to an isolated code judge sandbox adapter with strict resource constraints.
- **Hidden Tests Protection**: Protect hidden test cases, expected outputs, and private test inputs. Never expose them to client responses or LLM prompts.
- **Privacy & Consent**: Private learner records, emails, source code, and AI conversations must never be exposed publicly. Workforce-readiness report sharing must require explicit learner consent and generate revocable, unpredictable share tokens.

## 3. Assessment & AI Coaching Boundaries
- **Code Judge Authority**: Treat the isolated code judge as the sole authority on code correctness and assessment metrics.
- **LLM Coaching Role**: Treat LLM output strictly as an advisory educational coach, never as the authoritative assessment engine.
- **Progressive Hinting**: Enforce pedagogical progressive hint levels (Nudge -> Direction -> Debugging Guidance -> Detailed Explanation). Prevent revealing full answers prematurely.
- **Prompt Injection Defense**: Treat learner code and challenge statements as untrusted strings. Validate structured JSON output from LLMs against strict Pydantic schemas.

## 4. Testing & Verification
- Add automated tests for all critical routes, lifecycle states, and domain logic:
  - Frontend: TypeScript verification, component tests, navigation, and workspace state.
  - Backend: Unit and Feature tests for authentication, authorization, submissions, scoring, and report generation.
  - AI Service: Request validation, schema parsing, timeout handling, injection resistance, and evaluation sets.
- Run tests after meaningful changes. Never report incomplete or broken work as production-ready.
- Document and report actual test outcomes, known limitations, and unresolved issues transparently.
