import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { ShieldCheck, Plus, CheckCircle2, AlertCircle, Trash2, Cpu, Check, ArrowLeft } from 'lucide-react';

export const AdminChallengePage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [category, setCategory] = useState('logic_state');
  const [framework, setFramework] = useState('Node.js');
  const [investigationTime, setInvestigationTime] = useState(25);
  const [description, setDescription] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [reproSteps, setReproSteps] = useState('1. Trigger workflow with test input.\n2. Observe assertion failure.');
  const [topics, setTopics] = useState('state_management, logic');
  const [jsStarter, setJsStarter] = useState("const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconsole.log(input);");
  
  // Test cases
  const [testCases, setTestCases] = useState<Array<{ input: string; expected_output: string; is_hidden: boolean; explanation?: string }>>([
    { input: '2,7,11,15\n9', expected_output: '[0,1]', is_hidden: false, explanation: 'Example 1' },
    { input: '3,3\n6', expected_output: '[0,1]', is_hidden: true, explanation: 'Hidden edge case' },
  ]);

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [createdChallengeId, setCreatedChallengeId] = useState<number | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expected_output: '', is_hidden: true }]);
  };

  const handleUpdateTestCase = (index: number, field: string, value: any) => {
    const updated = [...testCases];
    (updated[index] as any)[field] = value;
    setTestCases(updated);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    setValidationResult(null);

    try {
      const topicArray = topics.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      const stepsArray = reproSteps.split('\n').map(s => s.trim()).filter(Boolean);

      const res = await api.challenges.adminCreate({
        title,
        difficulty,
        category,
        framework,
        investigation_time_minutes: investigationTime,
        description,
        bug_report: {
          issue_title: title,
          symptoms,
          expected_behavior: expectedBehavior,
          actual_behavior: actualBehavior,
          reproduction_steps: stepsArray,
          environment: `${framework}, isolated sandbox`,
          scope_boundary: 'Fix the reported defect without altering test files.',
        },
        starter_code: {
          javascript: jsStarter,
        },
        supported_languages: ['javascript'],
        topics: topicArray,
        test_cases: testCases,
      });

      setMessage('Challenge created successfully in library!');
      setCreatedChallengeId(res.challenge.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateChallenge = async () => {
    if (!createdChallengeId) return;
    setValidating(true);
    try {
      const res = await api.challenges.validateChallenge(createdChallengeId);
      setValidationResult(res);
    } catch (err: any) {
      alert(err.message || 'Validation request failed');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className={embedded ? 'font-sans' : 'min-h-screen bg-[#f1f5f9] py-8 px-4 sm:px-6 lg:px-8 font-sans'}>
      <div className={embedded ? 'space-y-6' : 'max-w-4xl mx-auto space-y-6 selection:bg-blue-100 selection:text-blue-900'}>
        {!embedded && (
          <div className="flex items-center justify-between border-b border-slate-200/90 pb-5">
            <div>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Admin Console
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Direct Challenge Authoring Studio
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Author realistic multi-file debugging quests with bug tickets, reproduction steps, and automated mutation validation.
              </p>
            </div>
          </div>
        )}

      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-card">
        {message && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
            {createdChallengeId && (
              <button
                type="button"
                onClick={handleValidateChallenge}
                disabled={validating}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{validating ? 'Testing Mutation...' : 'Validate Mutation Lab'}</span>
              </button>
            )}
          </div>
        )}

        {validationResult && (
          <div className={`mb-6 p-4 rounded-xl border text-xs space-y-2 ${
            validationResult.valid ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {validationResult.valid ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
              <span>{validationResult.summary}</span>
            </div>
            <div className="text-xs space-y-1 font-mono">
              <div>Defect Reproduces in Unmodified Starter: <span className="font-bold">{validationResult.defect_reproduced ? 'Yes (Fails as expected)' : 'No'}</span></div>
              <div>Reference Fix Passes All Tests: <span className="font-bold">{validationResult.reference_fix_passes ? 'Yes (100% Passed)' : 'No'}</span></div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Quest Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Shopping Cart Double Discount on Session Reload"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Difficulty Tier
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs font-medium"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Defect Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 text-xs font-medium"
              >
                <option value="logic_state">Logic & State Management</option>
                <option value="boundary_off_by_one">Boundary & Off-By-One</option>
                <option value="auth_security">Authentication & Security</option>
                <option value="data_parsing">Data Validation & Parsing</option>
                <option value="concurrency_race">Concurrency & Race Condition</option>
                <option value="api_integration">API & HTTP Integration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Framework / Runtime
              </label>
              <input
                type="text"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                placeholder="e.g. Node.js, Express, Python"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Investigation Time (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={investigationTime}
                onChange={(e) => setInvestigationTime(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Topic Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e_commerce, state_management, idempotency"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs font-medium"
            />
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Bug Ticket Specifications</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Observable Symptoms</label>
              <textarea
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe what the user observes happening in production."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected Behavior</label>
                <textarea
                  rows={2}
                  value={expectedBehavior}
                  onChange={(e) => setExpectedBehavior(e.target.value)}
                  placeholder="What should occur under correct conditions."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Actual Behavior (Defect)</label>
                <textarea
                  rows={2}
                  value={actualBehavior}
                  onChange={(e) => setActualBehavior(e.target.value)}
                  placeholder="What incorrectly occurs in the buggy implementation."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reproduction Steps</label>
              <textarea
                rows={3}
                value={reproSteps}
                onChange={(e) => setReproSteps(e.target.value)}
                placeholder="Numbered steps to reproduce the bug."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Task Context & Problem Overview
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the broader system context and architectural overview."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Starter Source Code Template
            </label>
            <textarea
              rows={4}
              value={jsStarter}
              onChange={(e) => setJsStarter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Test Cases Editor */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs">Test Cases & Regression Assertions</h3>
              <button
                type="button"
                onClick={handleAddTestCase}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Test Case
              </button>
            </div>

            <div className="space-y-3">
              {testCases.map((tc, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans font-bold text-slate-800">Test Case #{idx + 1}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer font-sans text-xs font-medium">
                        <input
                          type="checkbox"
                          checked={tc.is_hidden}
                          onChange={(e) => handleUpdateTestCase(idx, 'is_hidden', e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-0"
                        />
                        <span>Hidden Test</span>
                      </label>
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCase(idx)}
                          className="text-rose-600 hover:text-rose-700 font-sans"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 font-sans">Standard Input</label>
                      <textarea
                        rows={2}
                        value={tc.input}
                        onChange={(e) => handleUpdateTestCase(idx, 'input', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:border-blue-600 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 font-sans">Expected Standard Output</label>
                      <textarea
                        rows={2}
                        value={tc.expected_output}
                        onChange={(e) => handleUpdateTestCase(idx, 'expected_output', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:border-blue-600 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-blue-sm transition-all"
            >
              {loading ? 'Deploying Quest...' : 'Publish Debugging Quest'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};
