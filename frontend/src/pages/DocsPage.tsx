import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Cpu,
  ShieldCheck,
  Database,
  Layers,
  Sparkles,
  Terminal,
  CheckCircle2,
  Lock,
  GitBranch,
  Zap,
  Server,
  Activity,
  Award,
  Code2,
  ArrowRight,
  FileCode,
  Search,
} from 'lucide-react';

type DocTab = 'pitch' | 'ai-depth' | 'rag-mcp' | 'security-eval' | 'api-schema';

export const DocsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DocTab>('pitch');

  const tabs: { id: DocTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'pitch', label: 'Pitch & Architecture', icon: Layers },
    { id: 'ai-depth', label: 'AI Depth & Multi-Agent', icon: Sparkles, badge: 'v2.0' },
    { id: 'rag-mcp', label: 'Hybrid RAG & MCP Protocol', icon: Cpu, badge: 'MCP' },
    { id: 'security-eval', label: 'Security & Evaluation', icon: ShieldCheck },
    { id: 'api-schema', label: 'API & Database Contracts', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Hero Banner */}
      <section className="bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-mono font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>LIVE TECHNICAL WHITEPAPER & SYSTEM DOSSIER (/docs)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                BugQuest AI — Engineering & AI Architecture
              </h1>
              <p className="text-slate-300 text-base leading-relaxed">
                Debug Smarter. Build Skills. Prove Your Progress. Explore our isolated code execution judge,
                5-agent Socratic debugging pipeline, Contextual Hybrid RAG, Model Context Protocol (MCP) server,
                and consent-controlled Workforce-Readiness Reports.
              </p>
            </div>

            {/* Live Status Telemetry Card */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 min-w-[290px] space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">System Telemetry</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  All Services Verified
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-700/80">
                  <div className="text-slate-400">AI Depth Score</div>
                  <div className="text-lg font-bold text-white mt-0.5">100% Full Stack</div>
                </div>
                <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-700/80">
                  <div className="text-slate-400">MCP Protocol</div>
                  <div className="text-lg font-bold text-blue-400 mt-0.5">4 Tools / 3 URIs</div>
                </div>
                <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-700/80">
                  <div className="text-slate-400">Automated Tests</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">124+ Assertions</div>
                </div>
                <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-700/80">
                  <div className="text-slate-400">RAG Non-Leakage</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">100% Verified</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                        active ? 'bg-blue-500 text-white' : 'bg-slate-700 text-blue-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {activeTab === 'pitch' && (
          <div className="space-y-8">
            {/* Problem vs Solution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider border border-rose-200">
                  The Problem Statement
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Why Traditional Coding Platforms & Generic Chatbots Fail Learners
                </h2>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-rose-600 mt-0.5">01.</span>
                    <span>
                      <strong>Answer-Spoiling LLMs:</strong> Standard conversational AI immediately dumps full solution
                      code when a student is stuck, destroying Socratic reasoning and debugging resilience.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-rose-600 mt-0.5">02.</span>
                    <span>
                      <strong>Passive & Inflated Skill Metrics:</strong> Platforms award points for watching videos or
                      AI-estimated quizzes rather than empirical, boundary-tested sandbox execution.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-bold text-rose-600 mt-0.5">03.</span>
                    <span>
                      <strong>Unverifiable Employer Signals:</strong> Self-taught engineers lack cryptographically
                      verifiable, consent-controlled proof of their debugging and algorithmic mastery.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm space-y-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
                  The BugQuest AI Solution
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Separation of Powers: Judge as Authority, Socratic AI as Coach
                </h2>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    <span>
                      <strong>Isolated Code Judge Authority:</strong> Subprocess/Piston/Judge0 sandboxes execute student
                      code with 128MB memory caps and 2000ms timeouts against public and hidden boundary test suites.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    <span>
                      <strong>4-Tier Progressive Socratic Coach:</strong> Guides learners from conceptual{' '}
                      <code>nudge</code> &rarr; <code>direction</code> &rarr; <code>debugging_guidance</code> &rarr;{' '}
                      <code>detailed_explanation</code> without leaking hidden tests.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                    <span>
                      <strong>Consent-First Workforce Dossiers:</strong> Shareable candidate reports secured by 256-bit
                      (64-hex) tokens, granular privacy scopes, and instant 404 revocation.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 3-Service Monorepo Architecture */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Three-Service Microservice Architecture</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clean architectural boundaries across Frontend SPA, Laravel Core API, and FastAPI AI + MCP Service
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-semibold">
                  docker-compose.yml Ready
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                    <Code2 className="w-4 h-4" />
                    <span>1. Frontend Workspace (React 18)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    TypeScript 5.5 Strict SPA with Vite, Tailwind CSS, TanStack React Query, and Monaco Editor. Hosts
                    the Coding Workspace, Skill Radar, Learning Path, and Public Shared Dossier views.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <Server className="w-4 h-4" />
                    <span>2. Assessment Engine (Laravel 12)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sanctum RBAC authentication, isolated CodeExecutionService sandbox judge, hidden test case filtering
                    (<code>is_hidden = true</code>), empirical SkillEvidenceService, and 64-char token lifecycle.
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <Cpu className="w-4 h-4" />
                    <span>3. AI & MCP Service (FastAPI)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    5-Agent orchestration pipeline, Contextual Hybrid RAG (BM25 + Dense Vector + HyDE + CRAG), Token
                    Optimization Cache, Multi-LLM + Ollama routing, and JSON-RPC 2.0 MCP Server.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai-depth' && (
          <div className="space-y-8">
            {/* 5-Agent Pipeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5">
                <GitBranch className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  5-Stage Multi-Agent Pedagogical Pipeline (<code>ai-service/agents.py</code>)
                </h2>
              </div>
              <p className="text-sm text-slate-600">
                Every request to <code>POST /api/v1/hint</code> executes a deterministic supervisor graph with full
                execution telemetry in <code>pipeline_trace</code>:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  {
                    step: 'Agent 1',
                    name: 'GuardrailAgent',
                    desc: 'Scans untrusted code & stderr for prompt injection overrides and redacts email PII.',
                  },
                  {
                    step: 'Agent 2',
                    name: 'DiagnosticASTAgent',
                    desc: 'Parses Python/JS AST, counts nested loops, detects hash lookups, and estimates O(N) vs O(N^2).',
                  },
                  {
                    step: 'Agent 3',
                    name: 'KnowledgeRetriever',
                    desc: 'Runs Query Rewriting (HyDE) + Hybrid BM25/Vector Search + Corrective RAG filtering.',
                  },
                  {
                    step: 'Agent 4',
                    name: 'SocraticCoachAgent',
                    desc: 'Routes to Gemini, OpenAI, Claude, DeepSeek, Ollama Local, or Pedagogical Engine with cache.',
                  },
                  {
                    step: 'Agent 5',
                    name: 'PedagogicalCritic',
                    desc: 'Redacts any accidental code blocks in nudge/direction tiers and computes RAGAS scores.',
                  },
                ].map((ag) => (
                  <div key={ag.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-blue-600">{ag.step}</span>
                    <div className="font-bold text-sm text-slate-900">{ag.name}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{ag.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt Engineering & Token Optimization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold">
                  <FileCode className="w-5 h-5" />
                  <h3>XML Prompt Registry & Chain-of-Thought (v2.0)</h3>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                  <li>
                    <strong>Versioned Registry (<code>PROMPT_REGISTRY</code>):</strong> Maintains <code>v1.0</code> and{' '}
                    <code>v2.0</code> XML-tagged system instructions (<code>&lt;role&gt;</code>,{' '}
                    <code>&lt;pedagogical_tiers&gt;</code>, <code>&lt;security_guardrails&gt;</code>,{' '}
                    <code>&lt;chain_of_thought_protocol&gt;</code>, <code>&lt;few_shot_examples&gt;</code>).
                  </li>
                  <li>
                    <strong>Untrusted Input Fencing:</strong> Student code and compiler diagnostics are isolated inside{' '}
                    <code>&lt;untrusted_learner_code&gt;</code> and <code>&lt;untrusted_diagnostics&gt;</code> tags.
                  </li>
                  <li>
                    <strong>Strict JSON Output Mode:</strong> Enforces native JSON schema adherence (
                    <code>HintResponse</code>) at <code>temperature=0.2</code>.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Zap className="w-5 h-5" />
                  <h3>Token Optimization Engine (<code>token_optimizer.py</code>)</h3>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                  <li>
                    <strong>Prompt & Semantic Response Cache:</strong> SHA-256 normalized code/diagnostic fingerprinting
                    plus Anthropic ephemeral <code>cache_control</code>, Gemini Context Caching, and DeepSeek prefix
                    caching.
                  </li>
                  <li>
                    <strong>Codeburn-Style Compression & Sliding Window:</strong> Strips redundant whitespace,
                    deduplicates repeated traceback frames (<code>semantic_dedup_lines</code>), and trims long files via{' '}
                    <code>sliding_window_trim</code>.
                  </li>
                  <li>
                    <strong>Rolling Summary Memory & Cheap-Model Routing:</strong> Compresses multi-turn{' '}
                    <code>hint_history</code> into a 280-char digest and routes <code>nudge</code>/<code>direction</code>{' '}
                    to Flash/Mini/Haiku models while reserving Pro/Sonnet/Coder for deep debugging tiers.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rag-mcp' && (
          <div className="space-y-8">
            {/* Contextual Hybrid RAG */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <Search className="w-5 h-5" />
                <h2 className="text-lg text-slate-900">
                  Contextual Hybrid RAG + HyDE + Corrective RAG (<code>ai-service/rag.py</code>)
                </h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every hint request grounds the LLM in our curated Computer Science & Debugging Pattern Corpus using five
                retrieval techniques:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">1. Contextual RAG & Semantic Chunks</div>
                  <p className="text-slate-600">
                    Each chunk is prepended with Anthropic-style domain & target complexity context headers before
                    indexing.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">2. Query Rewriting (HyDE) + Hybrid Search</div>
                  <p className="text-slate-600">
                    Synthesizes a hypothetical bug diagnosis from code + stderr and fuses lexical BM25 with 128-dim L2
                    normalized vector cosine similarity.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-900">3. Cross-Feature Reranker & CRAG</div>
                  <p className="text-slate-600">
                    Boosts chunks matching challenge topic taxonomy and applies a Corrective RAG confidence threshold (
                    <code>&ge; 0.18</code>) with fallback recovery.
                  </p>
                </div>
              </div>
            </div>

            {/* MCP Server Inventory */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Model Context Protocol (MCP) Server (<code>ai-service/mcp_server.py</code>)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Protocol Version <code>2024-11-05</code> &bull; Dual Transport: <code>stdio</code> &amp;{' '}
                    <code>HTTP JSON-RPC 2.0 (POST /mcp)</code>
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-semibold">
                  bugquest-ai-mcp-server v2.0.0
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: 'generate_debugging_hint',
                    type: 'MCP Tool',
                    desc: 'Invokes the full 5-agent Socratic debugging pipeline and returns a schema-validated HintResponse.',
                  },
                  {
                    name: 'retrieve_debugging_knowledge',
                    type: 'MCP Tool',
                    desc: 'Queries the Contextual Hybrid RAG engine (BM25 + Dense Vector + HyDE + CRAG) for top-K CS patterns.',
                  },
                  {
                    name: 'analyze_code_complexity',
                    type: 'MCP Tool',
                    desc: 'Performs static AST analysis on Python/JS code to detect nested loops, hash lookups, and Big-O complexity.',
                  },
                  {
                    name: 'verify_prompt_safety',
                    type: 'MCP Tool',
                    desc: 'Runs GuardrailAgent prompt-injection detection and email PII redaction on untrusted inputs.',
                  },
                ].map((tool) => (
                  <div key={tool.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <code className="text-xs font-bold text-blue-700">{tool.name}</code>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-800">
                        {tool.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{tool.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security-eval' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Lock className="w-5 h-5" />
                  <h3>Security & Privacy Controls (<code>docs/SECURITY.md</code>)</h3>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                  <li>
                    <strong>Sandboxed Code Judge:</strong> Zero evaluation in web/AI processes; isolated subprocesses
                    enforce 128MB memory limits and 2000ms execution timeouts.
                  </li>
                  <li>
                    <strong>Hidden Boundary Test Protection:</strong> Controller queries strictly filter out{' '}
                    <code>is_hidden = true</code> test cases before API serialization or LLM prompting.
                  </li>
                  <li>
                    <strong>256-Bit Revocable Share Tokens:</strong> Workforce readiness links use{' '}
                    <code>bin2hex(random_bytes(32))</code>, <code>X-Robots-Tag: noindex</code>, and instant 404
                    revocation.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold">
                  <Activity className="w-5 h-5" />
                  <h3>RAGAS & Golden Benchmark Suite (<code>evaluation.py</code>)</h3>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                  <li>
                    <strong>Live Benchmark Endpoint (<code>GET /api/v1/eval/benchmark</code>):</strong> Evaluates golden
                    debugging test cases across RAGAS Context Relevance, Faithfulness, and Pedagogical Non-Leakage.
                  </li>
                  <li>
                    <strong>100% Schema & Non-Leakage Pass Rate:</strong> Automated critic verification guarantees zero
                    full-solution code leakage on <code>nudge</code> and <code>direction</code> tiers.
                  </li>
                  <li>
                    <strong>Full-Stack Verification:</strong> 7 PHPUnit test suites (103 assertions), 8 async Pytest
                    suites, strict TypeScript build verification, and 13 live E2E integration tests.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api-schema' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Core REST & JSON-RPC API Contracts</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase bg-slate-50">
                    <th className="py-3 px-4 font-semibold">Service</th>
                    <th className="py-3 px-4 font-semibold">Method & Endpoint</th>
                    <th className="py-3 px-4 font-semibold">Purpose & Contract</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="py-3 px-4 font-mono text-indigo-600">Laravel API</td>
                    <td className="py-3 px-4 font-mono font-semibold">POST /api/challenges/{'{slug}'}/submit</td>
                    <td className="py-3 px-4">Executes code in isolated sandbox against public &amp; hidden tests; updates SkillProfile.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-indigo-600">Laravel API</td>
                    <td className="py-3 px-4 font-mono font-semibold">POST /api/challenges/{'{slug}'}/hint</td>
                    <td className="py-3 px-4">Strips hidden tests, attaches diagnostics, and dispatches HintRequest to FastAPI coach.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-indigo-600">Laravel API</td>
                    <td className="py-3 px-4 font-mono font-semibold">POST /api/reports/generate &amp; /share</td>
                    <td className="py-3 px-4">Generates Workforce-Readiness Report and 64-hex cryptographic revocable share token.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-emerald-600">FastAPI AI</td>
                    <td className="py-3 px-4 font-mono font-semibold">POST /api/v1/hint</td>
                    <td className="py-3 px-4">Runs 5-agent Socratic pipeline + Contextual Hybrid RAG + Prompt Cache; returns HintResponse.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-emerald-600">FastAPI AI</td>
                    <td className="py-3 px-4 font-mono font-semibold">POST /mcp &amp; GET /mcp/manifest</td>
                    <td className="py-3 px-4">JSON-RPC 2.0 Model Context Protocol endpoint exposing 4 tools, 3 resources, and prompts.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-emerald-600">FastAPI AI</td>
                    <td className="py-3 px-4 font-mono font-semibold">GET /api/v1/eval/benchmark</td>
                    <td className="py-3 px-4">Executes golden RAGAS &amp; Pedagogical Non-Leakage evaluation suite.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Ready to test the sandbox & Socratic AI Coach live?</h3>
            <p className="text-xs text-blue-100">
              Jump into the interactive Monaco coding workspace and experience progressive debugging firsthand.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/challenges"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 text-xs font-bold shadow hover:bg-blue-50 transition-all"
            >
              <Terminal className="w-4 h-4" />
              <span>Explore Challenges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700/60 border border-blue-400/40 text-white text-xs font-semibold hover:bg-blue-700 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Readiness Dossier</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
