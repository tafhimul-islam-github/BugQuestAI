import React, { useState } from 'react';
import { api } from '../api/client';
import { ShieldCheck, Plus, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

export const AdminChallengePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState('arrays, hash_maps');
  const [jsStarter, setJsStarter] = useState("const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconsole.log(input);");
  const [pyStarter, setPyStarter] = useState("import sys\ninput_data = sys.stdin.read().strip()\nprint(input_data)");
  
  // Test cases
  const [testCases, setTestCases] = useState<Array<{ input: string; expected_output: string; is_hidden: boolean; explanation?: string }>>([
    { input: '2,7,11,15\n9', expected_output: '[0,1]', is_hidden: false, explanation: 'Example 1' },
    { input: '3,3\n6', expected_output: '[0,1]', is_hidden: true, explanation: 'Hidden edge case' },
  ]);

  const [loading, setLoading] = useState(false);
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

    try {
      const topicArray = topics.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      await api.challenges.adminCreate({
        title,
        difficulty,
        description,
        starter_code: {
          javascript: jsStarter,
          python: pyStarter,
        },
        supported_languages: ['javascript', 'python'],
        topics: topicArray,
        test_cases: testCases,
      });

      setMessage('Challenge created successfully and added to library!');
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      <div className="border-b border-white/[0.06] pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          <span>Admin Challenge Studio</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Create verified coding challenges with starter templates and isolated hidden test cases.
        </p>
      </div>

      <div className="quest-card p-6 sm:p-8">
        {message && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
                Challenge Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Valid Anagram"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-obsidian-950 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
                Difficulty Tier
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-obsidian-950 text-white focus:outline-none focus:border-indigo-500 text-xs"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
              Topic Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="arrays, hash_maps, two_pointers"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-obsidian-950 text-white focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
              Problem Description & Task Statement
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the problem clearly, including constraints and expected behavior."
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-obsidian-950 text-white focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
                JavaScript Starter Code
              </label>
              <textarea
                rows={4}
                value={jsStarter}
                onChange={(e) => setJsStarter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-obsidian-950 font-mono text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
                Python Starter Code
              </label>
              <textarea
                rows={4}
                value={pyStarter}
                onChange={(e) => setPyStarter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-obsidian-950 font-mono text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Test Cases Editor */}
          <div className="space-y-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs">Test Cases & Assertions</h3>
              <button
                type="button"
                onClick={handleAddTestCase}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.1] bg-obsidian-900 hover:bg-obsidian-850 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Test Case
              </button>
            </div>

            <div className="space-y-3">
              {testCases.map((tc, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-white/[0.06] bg-obsidian-950 space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-sans font-bold text-slate-300">Test Case #{idx + 1}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer font-sans text-xs">
                        <input
                          type="checkbox"
                          checked={tc.is_hidden}
                          onChange={(e) => handleUpdateTestCase(idx, 'is_hidden', e.target.checked)}
                          className="rounded border-white/[0.1] bg-obsidian-900 text-indigo-600 focus:ring-0"
                        />
                        <span>Hidden Test</span>
                      </label>
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCase(idx)}
                          className="text-rose-400 hover:text-rose-300 font-sans"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Standard Input</label>
                      <textarea
                        rows={2}
                        value={tc.input}
                        onChange={(e) => handleUpdateTestCase(idx, 'input', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-obsidian-900 text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Expected Standard Output</label>
                      <textarea
                        rows={2}
                        value={tc.expected_output}
                        onChange={(e) => handleUpdateTestCase(idx, 'expected_output', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-obsidian-900 text-white text-xs focus:outline-none"
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs shadow-glow-sm transition-all"
            >
              {loading ? 'Deploying Challenge...' : 'Publish Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
