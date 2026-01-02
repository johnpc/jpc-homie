'use client';

import { useState, useEffect } from 'react';

interface Script {
  id: string;
  name: string;
}

export default function ScriptButtons() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const response = await fetch('/api/scripts');
      const data = await response.json();
      setScripts(data.scripts);
    } catch (err) {
      console.error('Failed to fetch scripts:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const runScript = async (scriptId: string) => {
    setLoading(scriptId);
    try {
      await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: scriptId }),
      });
      setTimeout(() => setLoading(null), 2000);
    } catch (err) {
      console.error('Failed to run script:', err);
      setLoading(null);
    }
  };

  if (fetchLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">⚡ Scripts</h2>
        <div className="text-center text-gray-600">Loading scripts...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">⚡ Scripts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scripts.map((script) => (
          <button
            key={script.id}
            onClick={() => runScript(script.id)}
            disabled={loading === script.id}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-6 px-4 rounded-lg transition"
          >
            {loading === script.id ? 'Running...' : script.name}
          </button>
        ))}
      </div>
    </div>
  );
}
