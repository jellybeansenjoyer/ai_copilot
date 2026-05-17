'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DiffViewer from 'react-diff-viewer';
import { Loader2 } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api';

export default function EditorDiffPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [original, setOriginal] = useState('');
  const [requirements, setRequirements] = useState('');
  const [updated, setUpdated] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    }
  }, [status, router]);

  const handleDiffSubmit = async () => {
    if (status !== 'authenticated') return;
    const token = session?.accessToken;
    if (!token) {
      alert('Session expired or unauthorized');
      return;
    }

    setLoading(true);
    setUpdated('');
    try {
      const res = await fetch(`${getApiBaseUrl()}/sessions/diff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: original, requirements }),
      });

      if (res.status === 403) {
        alert('Insufficient quota. Please recharge.');
        return;
      }

      if (!res.ok) {
        alert('Failed to generate diff.');
        return;
      }

      const data = await res.json();
      if (!data?.updatedCode) {
        alert('No updated code was returned.');
        return;
      }

      const cleaned = data.updatedCode.replace(/```[\s\S]*?```/, (match: string) =>
        match.replace(/```[a-z]*\n?/gi, '').replace(/```$/, '').trim(),
      );
      setUpdated(cleaned);
    } catch {
      alert('Failed to generate diff.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3 p-6 text-gray-600">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden />
        <span>{status === 'loading' ? 'Loading session…' : 'Redirecting…'}</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Diff Checker</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          placeholder="Original Code"
          value={original}
          onChange={(e) => setOriginal(e.target.value)}
          className="w-full p-4 border rounded-md font-mono disabled:opacity-60"
          rows={12}
          disabled={loading}
        />
        <textarea
          placeholder="Change Requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          className="w-full p-4 border rounded-md disabled:opacity-60"
          rows={12}
          disabled={loading}
        />
      </div>

      <button
        type="button"
        onClick={() => void handleDiffSubmit()}
        className="inline-flex items-center justify-center gap-2 min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
        {loading ? 'Generating…' : 'Generate Diff'}
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
