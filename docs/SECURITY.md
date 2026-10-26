# BugQuest AI — Security & Privacy Architecture

## 1. Threat Model & Mitigation Strategy

| Threat | Impact | Technical Control |
|---|---|---|
| **Remote Code Execution (RCE)** | An attacker executes arbitrary commands via submitted student code. | Code is never evaluated in the web process. Execution takes place in isolated sub-processes with zero network access, memory caps (128MB), and execution timeouts (2000ms). |
| **Test Case Leakage** | Cheating by reading secret boundary test assertions in browser dev tools. | Private test cases are marked `is_hidden = true`. Controller queries strictly filter out hidden test cases before serialization. |
| **Prompt Injection** | Attacker tricks the AI into revealing solution code or system instructions. | Untrusted student code is delimited in triple backticks and explicitly marked untrusted. System instructions enforce strict JSON-only output and prohibit overriding instructions. |
| **Mass Assignment & Broken Access Control** | Unauthorized privilege escalation to educator or admin. | Laravel Request validation with explicit `$fillable` arrays. Authorization policies verify role and ownership for all sensitive resources. |
| **Report Enumeration & Scraping** | Unauthorized third parties harvesting learner profiles. | Share links utilize 256-bit entropy (64 hex characters) generated via `bin2hex(random_bytes(32))`. Robots are prohibited via `X-Robots-Tag: noindex`. |
| **Revoked Link Access** | Previous share recipients viewing data after candidate revokes consent. | Token verification queries explicitly check `is_revoked = false` and `expires_at > now()`, returning `404 Not Found` immediately upon revocation. |
| **Denial of Service (DoS)** | Script submission spam exhausting CPU / judge bandwidth. | Laravel rate limiters applied: `throttle:15,1` on code submissions and `throttle:20,1` on AI coaching endpoints. |

---

## 2. Secrets Management & Environment Hygiene

- **Source Control Cleanliness**: All secrets (`APP_KEY`, `DB_PASSWORD`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `JUDGE0_API_KEY`) are loaded strictly from environment variables.
- **Git Protection**: `.gitignore` strictly excludes `.env`, `*.log`, `vendor/`, `node_modules/`, and `.venv/`.
- **Client Bundle Safety**: Vite only exposes variables prefixed with `VITE_`. No server keys are accessible to the frontend.

---

## 3. Learner Privacy & Data Ethics

1. **Consent-First Sharing**: Reports default to private. No public profile is published without explicit user action.
2. **Granular Privacy Scopes**: Learners choose whether to include diagnostic breakdowns or source code snippets.
3. **Audit Trail**: Every share token maintains an immutable view counter (`views_count`) and `last_viewed_at` timestamp visible to the learner.
4. **No Protected Class Profiling**: Assessment scores reflect algorithmic problem-solving on standardized challenges; the system prohibits any inference of gender, race, personality, or non-technical traits.
