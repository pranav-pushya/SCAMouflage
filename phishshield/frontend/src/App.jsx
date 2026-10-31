import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [type, setType] = useState('auto');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError('Content cannot be empty.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          content,
        }),
      });

      if (!response.ok) {
        let errorMsg = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorJson = await response.json();
          if (errorJson.detail) {
            errorMsg = typeof errorJson.detail === 'string'
              ? errorJson.detail
              : JSON.stringify(errorJson.detail);
          }
        } catch (_) {
          // Keep generic errorMsg
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 flex flex-col items-center">
      <main className="w-full max-w-3xl space-y-4">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">PhishShield India</h1>
          <p className="text-sm text-gray-400">Step 0 - Project Skeleton</p>
        </header>

        <section className="space-y-4 bg-gray-900 border border-gray-800 rounded p-4">
          <div>
            <label htmlFor="type-selector" className="block text-sm font-medium text-gray-300 mb-1">
              Input Type
            </label>
            <select
              id="type-selector"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
            >
              <option value="auto">auto</option>
              <option value="sms">sms</option>
              <option value="url">url</option>
              <option value="header">header</option>
            </select>
          </div>

          <div>
            <label htmlFor="content-input" className="block text-sm font-medium text-gray-300 mb-1">
              Content
            </label>
            <textarea
              id="content-input"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste suspicious SMS, URL, or raw email header..."
              className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-gray-100 focus:outline-none focus:border-blue-500 font-mono text-sm"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium rounded transition-colors"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </section>

        {loading && (
          <div className="p-4 bg-gray-900 border border-gray-800 rounded text-yellow-400 text-sm">
            Analyzing content...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 rounded text-red-300 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        <section className="bg-gray-900 border border-gray-800 rounded p-4 space-y-2">
          <h2 className="text-sm font-medium text-gray-400">Raw JSON Response</h2>
          <pre className="bg-black/60 p-3 rounded text-xs font-mono text-green-400 overflow-x-auto min-h-[120px]">
            {result ? JSON.stringify(result, null, 2) : 'No response yet.'}
          </pre>
        </section>
      </main>
    </div>
  );
}
