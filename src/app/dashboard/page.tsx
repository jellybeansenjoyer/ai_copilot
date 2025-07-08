'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, Loader2, Copy } from 'lucide-react';
import Image from 'next/image';
import { getSession } from 'next-auth/react';
import { diffLines } from 'diff';
import dynamic from 'next/dynamic';

const ProfileDialog = dynamic(() => import('@/components/ProfileDialog'), { ssr: false });

export default function DiffCheckerPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [originalCode, setOriginalCode] = useState('');
  const [requirements, setRequirements] = useState('');
  const [updatedCode, setUpdatedCode] = useState('');
  const [diffOutput, setDiffOutput] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [updatedPicture, setUpdatedPicture] = useState<string>('');
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/signin');
  }, [loading, user, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerOpen &&
        mainRef.current &&
        !mainRef.current.contains(event.target as Node)
      ) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [drawerOpen]);

  useEffect(() => {
    const fetchSessions = async () => {
      const session = await getSession();
      if (!session?.accessToken) return;

      const res = await fetch('https://ai-copilot-backend.onrender.com/sessions/history', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setSessionHistory(data);
      } else {
        console.error('Expected array but got:', data);
        setSessionHistory([]);
      }
    };

    if (user) fetchSessions();
  }, [user]);

  const handleDiffSubmit = async () => {
    if (!originalCode.trim() || !requirements.trim()) return;
  
    setIsLoading(true);
    setUpdatedCode('');
    setDiffOutput([]);
  
    try {
      const session = await getSession();
      if (!session?.accessToken) {
        alert('Session expired or unauthorized');
        return;
      }
  
      const quotaRes = await fetch('https://ai-copilot-backend.onrender.com/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
  
      const updatedUser = await quotaRes.json();
  
      if (updatedUser.quota <= 0) {
        alert('Please recharge, you have exhausted your daily quota.');
        return;
      }
  
      const res = await fetch('https://ai-copilot-backend.onrender.com/sessions/diff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ code: originalCode, requirements }),
      });
  
      const data = await res.json();
      const cleanCode = data.updatedCode.replace(/```(\w+)?/g, '').trim();
  
      // 💾 Save the session to DB
      await fetch('https://ai-copilot-backend.onrender.com/sessions/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          codeInput: originalCode,
          codeOutput: cleanCode,
        }),
      });
  
      // 🔁 Update state
      setUpdatedCode(cleanCode);
      setDiffOutput(diffLines(originalCode, cleanCode));
  
      // ✅ Refresh session history
      const historyRes = await fetch('https://ai-copilot-backend.onrender.com/sessions/history', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      const newHistory = await historyRes.json();
      if (Array.isArray(newHistory)) setSessionHistory(newHistory);
    } catch (error: any) {
      alert(error.message.includes('quota') ? 'Insufficient quota. Please recharge.' : 'Failed to fetch diff.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleProfileClose = () => {
    setShowProfileDialog(false);
    if (user?.picture) setUpdatedPicture(user.picture);
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

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white text-black z-30 transform ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out shadow-lg`}
      >
        <div className="p-4 font-bold text-xl border-b">Diff Sessions</div>
        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-3rem)]">
          {sessionHistory.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                setOriginalCode(s.codeInput);
                setUpdatedCode(s.codeOutput);
                setDiffOutput(diffLines(s.codeInput, s.codeOutput));
                setSelectedSessionId(s.id);
              }}
              className={`p-3 rounded-lg cursor-pointer border transition transform duration-200 hover:scale-105 ${
                selectedSessionId === s.id ? 'bg-blue-100 border-blue-400' : 'bg-white'
              }`}
            >
              <div className="font-semibold text-sm truncate">{s.codeInput.slice(0, 40)}...</div>
              <div className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-20 h-full flex flex-col" ref={mainRef}>
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-4">
            <Menu className="cursor-pointer" onClick={() => setDrawerOpen(!drawerOpen)} />
            <h1 className="text-2xl font-bold">Reimage Diff</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div
              onClick={() => setShowProfileDialog(true)}
              className="cursor-pointer ring-2 ring-blue-500 rounded-full p-0.5 transition-transform hover:scale-105"
            >
              <Image
                src={updatedPicture || user?.picture || '/default-avatar.png'}
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

        {showProfileDialog && user?.email && (
          <ProfileDialog email={user.email} onClose={handleProfileClose} />
        )}

        <div className="flex-1 overflow-auto px-6 pb-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 p-4 rounded-md border relative">
              <label className="block text-sm font-medium mb-1">Original Code</label>
              <textarea
                rows={10}
                value={originalCode}
                onChange={(e) => setOriginalCode(e.target.value)}
                className="w-full p-3 text-sm font-mono bg-gray-100 rounded-md border"
              />
              <button
                onClick={() => copyToClipboard(originalCode)}
                className="absolute top-2 right-2 text-xs flex items-center gap-1 bg-white border p-1 rounded hover:bg-gray-200"
              >
                <Copy size={14} /> Copy
              </button>
            </div>

            <div className="bg-white/80 p-4 rounded-md border relative">
              <label className="block text-sm font-medium mb-1">Change Requirements</label>
              <textarea
                rows={10}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full p-3 text-sm bg-gray-100 rounded-md border"
              />
            </div>
          </div>

          <button
            onClick={handleDiffSubmit}
            disabled={isLoading}
            className="self-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md mt-4 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Generate Diff'}
          </button>

          {diffOutput.length > 0 && (
            <div className="mt-6 bg-white/90 rounded-md border p-4 relative">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">Updated Code with Diff</h3>
                <button
                  onClick={() => copyToClipboard(updatedCode)}
                  className="text-xs flex items-center gap-1 bg-white border p-1 rounded hover:bg-gray-200"
                >
                  <Copy size={14} /> Copy Updated
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {diffOutput.map((part, index) => (
                  <span
                    key={index}
                    className={`block px-1 rounded ${
                      part.added ? 'bg-green-100' :
                      part.removed ? 'bg-red-100' :
                      ''}`}
                  >
                    {part.value}
                  </span>
                ))}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
