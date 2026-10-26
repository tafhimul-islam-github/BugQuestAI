# BugQuest AI — REST API Reference

All requests accept and return `application/json`. Authenticated routes require an `Authorization: Bearer <token>` header obtained from `/api/auth/login` or `/api/auth/register`.

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Create a new user account.
```json
// Request
{
  "name": "Jane Developer",
  "email": "jane@example.com",
  "password": "securepassword123",
  "role": "learner",
  "target_role": "Full-Stack Engineer"
}

// Response (201 Created)
{
  "message": "Registration successful",
  "token": "1|qX12...",
  "user": { "id": 4, "name": "Jane Developer", "email": "jane@example.com", "role": "learner" }
}
```

### `POST /api/auth/login`
Authenticate existing user and retrieve API token.
```json
// Request
{ "email": "learner@bugquest.ai", "password": "password123" }

// Response (200 OK)
{ "token": "2|hY77...", "user": { ... } }
```

### `GET /api/auth/me`
Retrieve currently authenticated user profile.

---

## 2. Challenge Library

### `GET /api/challenges`
List active coding challenges.
- **Query Parameters**:
  - `difficulty`: `beginner`, `intermediate`, `advanced`
  - `topic`: e.g. `arrays`, `hash_maps`, `strings`
  - `search`: string to match in title/description
- **Response**:
```json
{
  "challenges": [
    {
      "id": 1,
      "slug": "two-sum-target-finder",
      "title": "Two Sum Target Finder",
      "difficulty": "beginner",
      "topics": ["arrays", "hash_maps", "lookup"],
      "supported_languages": ["javascript", "python"],
      "time_limit_ms": 2000,
      "memory_limit_mb": 128,
      "is_solved": true
    }
  ],
  "topics": ["arrays", "hash_maps", "lookup", "strings", "stacks", "sorting"],
  "total": 6
}
```

### `GET /api/challenges/{slugOrId}`
Retrieve complete challenge specifications, constraints, starter code, and public examples.
> **Note**: Hidden test cases are stripped out on the server and are never present in this response.

---

## 3. Code Assessment Engine

### `POST /api/submissions`
Submit code for evaluation against public and hidden test cases. Rate limited to 15 requests per minute.
```json
// Request
{
  "challenge_id": 1,
  "language": "javascript",
  "code": "const fs = require('fs'); ...",
  "idempotency_key": "sub_d8f28a9b"
}

// Response (201 Created)
{
  "message": "Assessment completed",
  "submission": {
    "id": 42,
    "status": "accepted",
    "pass_count": 5,
    "total_count": 5,
    "execution_time_ms": 249.3,
    "memory_kb": 15400,
    "error_output": null,
    "public_test_results": [
      {
        "test_case_id": 1,
        "input": "2,7,11,15\n9",
        "expected_output": "[0,1]",
        "actual_output": "[0,1]",
        "status": "passed",
        "execution_time_ms": 48.2
      }
    ]
  }
}
```

---

## 4. AI Debugging Coach

### `POST /api/ai/hint`
Request structured pedagogical guidance from the AI coach. Rate limited to 20 requests per minute.
```json
// Request
{
  "challenge_id": 1,
  "submission_id": 42,
  "language": "javascript",
  "code": "...",
  "hint_level": "nudge",
  "error_context": null
}

// Response (200 OK)
{
  "hint": {
    "id": 12,
    "hint_level": "nudge",
    "summary": "Reflect on input edge cases and assumptions",
    "likely_issue": "General algorithmic or boundary discrepancy.",
    "explanation": "Consider how you handle lookup time...",
    "next_steps": ["Check boundary cases", "Trace loop invariants"],
    "concept_tags": ["arrays", "hash_maps"],
    "confidence": 0.92,
    "created_at": "2026-10-26T15:04:42Z"
  }
}
```

---

## 5. Learning Intelligence & Reports

### `GET /api/learning/profile`
Retrieve the learner's empirical skill profile, domain scores, and recent diagnostics.

### `GET /api/learning/recommendations`
Retrieve personalized next challenge recommendations.

### `POST /api/reports/generate`
Generate an immutable snapshot of workforce readiness.

### `POST /api/reports/{uuid}/share`
Generate a consent-controlled public share link.
```json
// Request
{
  "allow_diagnostics": true,
  "allow_code_samples": false,
  "expires_days": 30
}

// Response (201 Created)
{
  "share_token": "a5722eb5a8f329f8c4...",
  "share_url": "http://localhost:8000/report/shared/a5722eb5a8f329f8c4...",
  "expires_at": "2026-11-25T15:04:42Z"
}
```

### `POST /api/reports/share/{token}/revoke`
Immediately revoke access to a share link. Subsequent GET requests will receive `404 Not Found`.

### `GET /api/reports/shared/{shareToken}`
Unauthenticated public access to a verified candidate report (respects privacy scopes configured by learner).
