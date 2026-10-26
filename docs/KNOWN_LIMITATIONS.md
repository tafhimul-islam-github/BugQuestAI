# BugQuest AI — Known Limitations & Operational Considerations

## 1. Supported Languages
- **Currently Supported**: JavaScript (Node.js) and Python 3.
- **Planned for Future Releases**: TypeScript (native runner), Go, C++, Rust, Java.

## 2. Local Isolated Sandbox vs. Remote Execution Clusters
- **Current Development Configuration**: Uses Symfony Process with stdin/stdout shims and per-test execution timeouts (2000ms). While memory usage is monitored, true operating system cgroups and network namespace isolation require either Linux Docker daemon execution or remote execution adapters (Judge0 / Piston).
- **Production Recommendation**: When deploying to a multi-tenant public production environment, configure `CODE_JUDGE_PROVIDER=judge0` or `CODE_JUDGE_PROVIDER=piston` with dedicated worker sandboxes.

## 3. Email Delivery Fallback
- In development environments without configured SMTP / Postmark credentials, email verification and password reset tokens are logged to application logs or database tables. A production transactional mail driver (AWS SES, Mailgun, or Postmark) must be configured in `.env` before public launch.

## 4. Assessment Limitations & Ethical Boundaries
- Algorithmic assessment scores reflect candidate proficiency on standardized algorithmic challenges and synthetic test harness assertions.
- The platform does not claim that high assessment scores guarantee employment, nor does it attempt to evaluate soft skills, architectural trade-offs in large distributed systems, or team communication.

## 5. External LLM Provider Rate Limits
- When configured with live Gemini or OpenAI API keys, token usage and rate limits are subject to the provider tier. The system includes rate limiting at the Laravel gateway (`throttle:20,1`) and bounded retries, falling back to deterministic coaching if the external provider times out.
