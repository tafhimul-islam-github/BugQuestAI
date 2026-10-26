import React, { useState } from 'react';
import { api } from '../api/client';
import { ShieldCheck, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-amber-400" />
          Admin Challenge Studio
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Create verified coding challenges with starter templates and isolated hidden test cases.
        </p>
      </div>

      <div className="quest-card p-6 sm:p-8">
        {message && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Challenge Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Reverse Linked List"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Topic Tags (comma-separated)
            </label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="arrays, two_pointers, hash_maps"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Description (Markdown)
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Given an array of integers..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                JavaScript Starter Code
              </label>
              <textarea
                rows={4}
                value={jsStarter}
                onChange={(e) => setJsStarter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Python Starter Code
              </label>
              <textarea
                rows={4}
                value={pyStarter}
                onChange={(e) => setPyStarter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Test cases */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Assessment Test Cases ({testCases.length})
              </label>
              <button
                type="button"
                onClick={handleAddTestCase}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Test Case
              </button>
            </div>

            <div className="space-y-3">
              {testCases.map((tc, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Test Case #{idx + 1}</span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.is_hidden}
                          onChange={(e) => handleUpdateTestCase(idx, 'is_hidden', e.target.checked)}
                          className="rounded text-indigo-600 bg-slate-900 border-slate-700"
                        />
                        <span>Hidden Test Case</span>
                      </label>
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCase(idx)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Standard Input:</span>
                      <textarea
                        rows={2}
                        value={tc.input}
                        onChange={(e) => handleUpdateTestCase(idx, 'input', e.target.value)}
                        className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">Expected Output:</span>
                      <textarea
                        rows={2}
                        value={tc.expected_output}
                        onChange={(e) => handleUpdateTestCase(idx, 'expected_output', e.target.value)}
                        className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-md transition-all"
          >
            {loading ? 'Creating Challenge...' : 'Publish Challenge to Library'}
          </button>
        </form>
      </div>
    </div>
  );
};
