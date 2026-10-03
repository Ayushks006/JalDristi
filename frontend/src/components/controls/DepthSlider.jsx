import React from 'react';
import { Layers, ArrowDown, ChevronDown } from 'lucide-react';
import { STANDARD_DEPTHS } from '../../services/demoDataGenerator';

export default function DepthSlider({ depth = 0, onChangeDepth }) {
  const depthLabels = {
    0: 'SURFACE',
    10: 'MIXED LAYER',
    50: 'THERMOCLINE',
    100: 'MID-DEPTH',
    250: 'SUB-SURFACE',
    500: 'DEEP OCEAN'
  };

  return (
    <div className="bg-ocean-950/90 backdrop-blur-xl border border-cyan-glow/30 rounded-xl p-3.5 shadow-2xl text-slate-200 select-none flex flex-col gap-2.5">
      {/* Title & Prominent Depth Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-glow" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-200 font-bold">
            OCEAN DEPTH
          </span>
        </div>
        <div className="bg-cyan-glow/20 border border-cyan-glow/50 px-2.5 py-0.5 rounded text-xs font-mono font-black text-cyan-glow shadow-sm">
          Depth: {depth} m
        </div>
      </div>

      {/* Layer description tag */}
      <div className="flex items-center justify-between text-[10px] font-mono text-cyan-muted">
        <span>CURRENT LEVEL:</span>
        <span className="text-amber-300 font-bold tracking-wider">
          {depthLabels[depth] || `${depth} m`}
        </span>
      </div>

      {/* Continuous Slider with ticks */}
      <div className="relative flex flex-col gap-1 mt-0.5">
        <input
          type="range"
          min="0"
          max="500"
          step="10"
          value={depth}
          onChange={(e) => onChangeDepth(Number(e.target.value))}
          className="w-full h-2 bg-gradient-to-r from-sky-400 via-blue-600 to-indigo-950 rounded-lg appearance-none cursor-pointer accent-cyan-glow focus:outline-none"
        />
        <div className="flex justify-between text-[8px] font-mono text-slate-500 px-0.5">
          <span>0m (SURFACE)</span>
          <span>100m</span>
          <span>250m</span>
          <span>500m (DEEP)</span>
        </div>
      </div>

      {/* Discrete Standard Depths Step Bar */}
      <div className="grid grid-cols-6 gap-1 pt-1 border-t border-navy-border">
        {STANDARD_DEPTHS.map((d) => {
          const isSelected = depth === d;
          return (
            <button
              key={d}
              onClick={() => onChangeDepth(d)}
              className={`py-1 px-1 rounded flex flex-col items-center justify-center font-mono transition-all text-center ${
                isSelected
                  ? 'bg-cyan-glow text-ocean-950 font-bold border border-cyan-glow shadow-md shadow-cyan-glow/30 scale-105'
                  : 'bg-ocean-900/60 text-slate-400 hover:text-slate-100 hover:bg-ocean-800/60 border border-navy-border'
              }`}
            >
              <span className="text-[10px] font-bold leading-tight">{d}m</span>
              <span className="text-[7px] uppercase tracking-tighter opacity-80 leading-none">
                {d === 0 ? 'SURF' : d === 500 ? 'DEEP' : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
