'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, ArrowRight, ArrowLeftRight } from 'lucide-react';
import Image from 'next/image';
import { getSession } from 'next-auth/react';
import DiffViewer from 'react-diff-viewer';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'diff'>('chat');

  const [code, setCode] = useState('');
  const [requirements, setRequirements] = useState('');
  const [output, setOutput] = useState('');
  const [visibleOutput, setVisibleOutput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/signin');
  }, [loading, user, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerOpen && mainRef.current && !mainRef.current.contains(event.target as Node)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [drawerOpen]);

  useEffect(() => {
    if (!output) return;
    setVisibleOutput('');
    let index = 0;
    const interval = setInterval(() => {
      setVisibleOutput((prev) => prev + output.charAt(index));
      index++;
      if (index >= output.length) clearInterval(interval);
    }, 10);
    return () => clearInterval(interval);
  }, [output]);

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  const handleChatSubmit = async () => {
    if (!code.trim()) return;

    try {
      setIsLoading(true);
      setSubmitted(true);
      setOutput('');
      setVisibleOutput('');

      const session = await getSession();
      if (!session?.accessToken) {
        alert('Session expired or unauthorized');
        return;
      }

      const res = await fetch('http://localhost:2999/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      setOutput(data.codeOutput || 'No output returned.');
    } catch (error) {
      setOutput('Error fetching response.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiffSubmit = async () => {
    if (!code.trim() || !requirements.trim()) return;

    try {
      setIsLoading(true);
      setSubmitted(true);
      setOutput('');

      const session = await getSession();
      if (!session?.accessToken) {
        alert('Session expired or unauthorized');
        return;
      }

      const res = await fetch('http://localhost:2999/sessions/diff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ code, requirements }),
      });

      const data = await res.json();
      const cleaned = data.updatedCode.replace(/```[\s\S]*?```/, (match: string) =>
        match.replace(/```[a-z]*\n?/gi, '').replace(/```$/, '').trim()
      );
      setOutput(cleaned);
    } catch (error) {
      setOutput('Error generating diff.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'chat' ? 'diff' : 'chat');
    setSubmitted(false);
    setOutput('');
    setCode('');
    setRequirements('');
  };

  return (
    <div className="relative w-full h-screen text-black overflow-hidden">
      <video
        className="fixed top-0 left-0 w-full h-full object-cover z-[-1]"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/login-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-white/40 z-0 pointer-events-none" />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white text-black z-30 transform ${drawerOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out shadow-lg`}
      >
        <div className="p-4 font-bold text-xl border-b">Past Sessions</div>
      </div>

      {/* Main */}
      <div className="relative z-20 h-full flex flex-col" ref={mainRef}>
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-4">
            <Menu className="cursor-pointer" onClick={() => setDrawerOpen(!drawerOpen)} />
            <h1 className="text-2xl font-bold">Reimage</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleMode} className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center">
              <ArrowLeftRight className="w-4 h-4 mr-2" /> Switch to {mode === 'chat' ? 'Diff' : 'Chat'}
            </button>
            <div
              onClick={() => router.push('/profile')}
              className="cursor-pointer ring-2 ring-blue-500 rounded-full p-0.5 transition-transform hover:scale-105"
            >
              <Image
                src={user.picture || '/default-avatar.png'}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            </div>
            <button
              onClick={signOut}
              className="text-sm px-4 py-2 border border-white text-red-600 rounded hover:bg-red-600 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Hero */}
        {!submitted && (
          <div className="flex flex-col items-center text-center px-4 mt-10 mb-8">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-4">{mode === 'chat' ? 'What would you like to do today?' : 'Code Diff Viewer'}</h2>
            <p className="text-lg md:text-xl mb-4 max-w-2xl">
              {mode === 'chat' ? 'Effective Enhanced Prompts that you can use as much as you want' : 'Compare your code with smart edits.'}
            </p>
          </div>
        )}

        {/* Input Section */}
        <div className="px-6 pb-6 w-full flex flex-col items-center gap-4">
          <textarea
            rows={4}
            placeholder="Your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full max-w-3xl px-6 py-4 text-lg bg-white/80 text-black placeholder:text-gray-500 focus:outline-none border border-gray-300 rounded-md resize-none"
          />

          {mode === 'diff' && (
            <textarea
              rows={2}
              placeholder="Change requirements (e.g. rename variable, add return)"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full max-w-3xl px-6 py-3 text-base bg-white/80 text-black placeholder:text-gray-500 focus:outline-none border border-gray-300 rounded-md resize-none"
            />
          )}

          <button
            onClick={mode === 'chat' ? handleChatSubmit : handleDiffSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : mode === 'chat' ? 'Submit Prompt' : 'Generate Diff'}
          </button>
        </div>

        {/* Output Section */}
        {submitted && output && (
          <div className="flex-1 overflow-auto px-6 pb-6 flex flex-col items-center">
            {mode === 'chat' ? (
              <div className="w-full max-w-3xl space-y-4">
                <div className="flex justify-end">
                  <div className="bg-blue-100 p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
                    {code}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-200 p-4 rounded-md text-sm whitespace-pre-wrap">
                    {visibleOutput}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-5xl">
                <DiffViewer oldValue={code} newValue={output} splitView={true} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}