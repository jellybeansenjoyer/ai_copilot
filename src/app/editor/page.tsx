'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DiffViewer from 'react-diff-viewer';

export default function DiffCheckerPage() {
  const [original, setOriginal] = useState('');
  const [requirements, setRequirements] = useState('');
  const [updated, setUpdated] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDiffSubmit = async () => {
    setLoading(true);
    const res = await fetch('https://ai-copilot-backend.onrender.com/sessions/diff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJhZ2hhdmthc2gyNjZAZ21haWwuY29tIiwic3ViIjoiY2I1NjI1ODMtYTgzNi00MzRkLTgwOGYtZDM1ZWIxNjc1ZGQ0IiwiaWF0IjoxNzUxNzE5Mjg2LCJleHAiOjE3NTE3MTkzNDZ9.DPfBoXwAFAAz97XsCV75hycwImeM_cJrGXD8uYYqekY`,
      },
      body: JSON.stringify({ code: original, requirements }),
    });
    const data = await res.json();
    const cleaned = data.updatedCode.replace(/```[\s\S]*?```/, (match: any) =>
      match.replace(/```[a-z]*\n?/gi, '').replace(/```$/, '').trim()
    );
    setUpdated(cleaned);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Diff Checker</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          placeholder="Original Code"
          value={original}
          onChange={(e) => setOriginal(e.target.value)}
          className="w-full p-4 border rounded-md font-mono"
          rows={12}
        />
        <textarea
          placeholder="Change Requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          className="w-full p-4 border rounded-md"
          rows={12}
        />
      </div>

      <button
        onClick={handleDiffSubmit}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded"
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Diff'}
      </button>

      {updated && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Changes:</h2>
          <DiffViewer oldValue={original} newValue={updated} splitView={true} />
        </div>
      )}
    </div>
  );
}
