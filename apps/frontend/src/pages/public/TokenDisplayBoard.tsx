import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSSEQueue } from '../../hooks/useSSEQueue';
import { apiClient } from '../../api/client';
import { CheckCircle2, Clock, Megaphone, Radio } from 'lucide-react';

export const TokenDisplayBoard: React.FC = () => {
  const { centreId } = useParams<{ centreId: string }>();
  const activeCentreId = centreId || '10000000-0000-0000-0000-000000000001';

  const [displayData, setDisplayData] = useState<any>({
    centreName: 'Amritsar Central Mandi',
    district: 'Amritsar',
    now_serving: { token: 44, farmer_name: 'Gurpreet Singh', crop: 'wheat', quantity_kg: 500 },
    next_tokens: [45, 46, 47, 48],
    waiting_count: 8,
    today_done: 23,
    avg_wait_minutes: 28,
    announcements: ['Paddy MSP Revised for Kharif 2026. Electronic weighbridge in bay 1 & 2 fully operational.'],
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const { snapshot, isConnected } = useSSEQueue(activeCentreId);

  // Live IST Clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial snapshot and periodic fallback
  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get(`/display/${activeCentreId}`);
        setDisplayData(res.data);
      } catch (err) {
        // fallback
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [activeCentreId]);

  // Sync SSE updates
  useEffect(() => {
    if (snapshot) {
      setDisplayData((prev: any) => ({
        ...prev,
        now_serving: {
          ...prev.now_serving,
          token: snapshot.currentlyServing,
        },
        next_tokens: snapshot.waitingTokens.slice(0, 4),
        waiting_count: snapshot.totalWaiting,
        today_done: snapshot.completedToday,
      }));
    }
  }, [snapshot]);

  return (
    <div className="min-h-screen bg-[#1C2B1C] text-white flex flex-col justify-between p-6 sm:p-10 font-display select-none overflow-hidden">
      {/* 1. TV HEADER */}
      <header className="flex items-center justify-between border-b-2 border-white/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center text-4xl border-2 border-gold/40">
            🌾
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gold tracking-wider">
              KRISHISEVA
            </h1>
            <p className="text-sm uppercase tracking-widest text-gray-300 font-mono">
              Electronic Mandi Procurement Display
            </p>
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
            {displayData.centreName}
          </div>
          <div className="flex items-center justify-end gap-3 text-sm text-gray-300">
            <span className="flex items-center gap-1.5">
              <Radio className={`w-4 h-4 ${isConnected ? 'text-green-400 animate-pulse' : 'text-amber-400'}`} />
              <span className="font-mono text-xs">{isConnected ? 'LIVE FEED' : 'RECONNECTING'}</span>
            </span>
            <span className="text-white/40">|</span>
            <span className="font-mono text-gold-light text-base font-bold">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
              {' · '}
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </span>
          </div>
        </div>
      </header>

      {/* 2. MAIN SPLIT SCREEN DISPLAY */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6 items-stretch">
        {/* LEFT: NOW SERVING (Huge display) */}
        <div className="lg:col-span-6 bg-white/5 rounded-3xl border-2 border-green-500/40 p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-green-600 text-white font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
            Gate / Weighbridge Bay
          </div>

          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-gold-light">
              Current Token
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              NOW SERVING
            </h2>
          </div>

          <div className="my-8 text-center">
            <div className="text-[7rem] sm:text-[9rem] font-black text-gold leading-none tracking-tighter drop-shadow-[0_10px_20px_rgba(212,160,23,0.3)] animate-pulse">
              #{displayData.now_serving?.token || 44}
            </div>
            <div className="mt-4 inline-block bg-white/10 px-6 py-2 rounded-full border border-white/20 text-lg sm:text-xl font-bold text-white">
              🧑🌾 {displayData.now_serving?.farmer_name || 'Gurpreet Singh'}
            </div>
            <div className="mt-2 text-sm text-green-300 font-semibold uppercase tracking-wider">
              🌾 {displayData.now_serving?.crop || 'Wheat'} · {displayData.now_serving?.quantity_kg || 500} kg
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 border-t border-white/10 pt-4">
            <span>Status: Weighing in progress</span>
            <span>Gate 1 Direct Access</span>
          </div>
        </div>

        {/* RIGHT: NEXT UP TOKENS */}
        <div className="lg:col-span-6 bg-white/5 rounded-3xl border-2 border-white/15 p-8 flex flex-col justify-between shadow-2xl">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Queue Schedule
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              NEXT IN LINE
            </h2>
          </div>

          {/* Tokens Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
            {(displayData.next_tokens || [45, 46, 47, 48]).map((num: number, idx: number) => (
              <div
                key={num}
                className={`p-5 rounded-2xl text-center border transition-all ${
                  idx === 0
                    ? 'bg-gold/20 border-gold shadow-lg scale-105'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">
                  {idx === 0 ? 'Next' : `+${idx + 1}`}
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-white block">
                  #{num}
                </span>
              </div>
            ))}
          </div>

          {/* Queue Statistics Card */}
          <div className="grid grid-cols-2 gap-4 bg-black/30 p-5 rounded-2xl border border-white/10">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider block">Total Waiting</span>
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {displayData.waiting_count || 8} Farmers
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider block">Average Wait</span>
              <span className="text-2xl sm:text-3xl font-bold text-green-400">
                ~{displayData.avg_wait_minutes || 28} Mins
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* 3. TV FOOTER & TICKER */}
      <footer className="space-y-4 pt-4 border-t-2 border-white/20">
        <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-300 font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>Today's Total Procured & Weighed: <strong className="text-white text-base">{displayData.today_done || 23} Farmers</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold" />
            <span>Operating Hours: 08:00 AM – 05:00 PM</span>
          </div>
        </div>

        {/* Scrolling News Ticker */}
        <div className="flex items-center bg-black/40 rounded-xl px-4 py-2.5 border border-white/10 overflow-hidden">
          <div className="flex items-center gap-2 text-gold font-bold uppercase text-xs shrink-0 pr-4 border-r border-white/20">
            <Megaphone className="w-4 h-4" />
            <span>Notice:</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap pl-4 w-full">
            <p className="inline-block text-xs font-mono text-gray-200 animate-marquee">
              {(displayData.announcements || []).join('  ★★★  ')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TokenDisplayBoard;
