'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/signin');
  }, [loading, user, router]);

  // Close drawer on outside click
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

  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <div className="relative w-full h-screen text-black overflow-hidden">
      {/* ✅ Background Video */}
      <video
        className="fixed top-0 left-0 w-full h-full object-cover z-[-1]"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/login-video.mp4" type="video/mp4" />
      </video>

      {/* ✅ Optional Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-white/40 z-0 pointer-events-none"></div>

      {/* ✅ Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white text-black z-30 transform ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out shadow-lg`}
      >
        <div className="p-4 font-bold text-xl border-b">Past Sessions</div>
        <div className="p-4 space-y-2">
          <p>Session #1</p>
          <p>Session #2</p>
          <p>Session #3</p>
        </div>
      </div>

      {/* ✅ Main Content */}
      <div className="relative z-20 h-full flex flex-col" ref={mainRef}>
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-4">
            <Menu
              className="cursor-pointer"
              onClick={() => setDrawerOpen(!drawerOpen)}
            />
            <h1 className="text-2xl font-bold">Reimage</h1>
          </div>

          {/* ✅ Profile & Sign Out */}
          <div className="flex items-center space-x-4">
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

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4">
            What would you like to do today?
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl">
            Effective Enhanced Prompts that you can use as much as you want
          </p>

          {/* ✅ Input with inner arrow button */}
          <div className="w-full max-w-3xl relative">
            <input
              type="text"
              placeholder="Start Typing...."
              className="w-full px-6 pr-16 py-6 text-lg bg-white/80 text-black placeholder:text-gray-500 
                         focus:outline-none border border-gray-300 rounded-md"
            />
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 
                         hover:bg-blue-700 p-4 rounded-full text-white flex items-center justify-center"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
