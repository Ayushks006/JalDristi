import React, { useEffect, useState, useRef } from 'react';
import { ArrowDown, Waves } from 'lucide-react';

export default function DepthTransitionOverlay({ depth }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prevDepth, setPrevDepth] = useState(depth);
  const timerRef = useRef(null);

  useEffect(() => {
    if (depth !== prevDepth) {
      setIsTransitioning(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 750);
      setPrevDepth(depth);
    }
  }, [depth, prevDepth]);

  if (!isTransitioning) return null;

  const isDescending = depth > prevDepth;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center overflow-hidden">
      {/* Subtle depth volumetric attenuation flash */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-blue-900/25 to-slate-950/40 animate-pulse transition-opacity duration-700" />

      {/* Depth Sonar Scanner Line */}
      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-glow to-transparent shadow-[0_0_15px_#00f2fe] animate-scanline" />

      {/* Scientific Telemetry Badge */}
      <div className="relative z-10 bg-ocean-950/90 backdrop-blur-md border border-cyan-glow/60 rounded-xl px-5 py-2.5 shadow-2xl flex items-center gap-3 animate-in zoom-in-95 fade-in duration-200">
        <div className="w-8 h-8 rounded-lg bg-cyan-glow/15 border border-cyan-glow/40 flex items-center justify-center text-cyan-glow">
          <ArrowDown className={`w-4 h-4 transition-transform duration-300 ${isDescending ? '' : 'rotate-180'}`} />
        </div>
        <div>
          <div className="text-[10px] font-mono tracking-widest text-cyan-glow font-bold uppercase">
            {isDescending ? 'DESCENDING WATER COLUMN' : 'ASCENDING WATER COLUMN'}
          </div>
          <div className="text-xs font-mono text-slate-100 flex items-center gap-2 font-bold">
            <span>{prevDepth} m</span>
            <span className="text-cyan-muted">→</span>
            <span className="text-cyan-glow">{depth} m</span>
            <span className="text-[10px] font-normal text-slate-400">
              ({depth === 0 ? 'Sea Surface' : depth === 500 ? 'Deep Ocean' : 'Sub-surface'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
