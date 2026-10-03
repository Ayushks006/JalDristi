import React from 'react';
import { Layers, ArrowDown, Droplet, Thermometer } from 'lucide-react';

export default function DepthCrossSection({
  profile = [],
  activeDepth = 0,
  isDemo = true,
  variable = 'temperature'
}) {
  // Standard depth fallbacks if not provided
  const depthsList = profile.length > 0 ? profile : [
    { depth: 0, observed_temp: 29.2, model_temp: 29.0, observed_sal: 34.8, model_sal: 34.9 },
    { depth: 10, observed_temp: 28.5, model_temp: 28.3, observed_sal: 34.8, model_sal: 34.9 },
    { depth: 50, observed_temp: 26.1, model_temp: 26.0, observed_sal: 35.1, model_sal: 35.0 },
    { depth: 100, observed_temp: 22.8, model_temp: 22.5, observed_sal: 35.3, model_sal: 35.2 },
    { depth: 250, observed_temp: 15.4, model_temp: 15.1, observed_sal: 34.9, model_sal: 34.8 },
    { depth: 500, observed_temp: 8.7, model_temp: 8.5, observed_sal: 34.8, model_sal: 34.75 },
  ];

  return (
    <div className="bg-ocean-950/90 rounded-xl p-3 border border-navy-border font-mono text-xs select-none">
      <div className="flex items-center justify-between pb-2 border-b border-navy-border mb-2.5">
        <div className="flex items-center gap-1.5 text-cyan-glow font-bold">
          <Layers className="w-3.5 h-3.5" />
          <span className="text-[11px] tracking-wider uppercase">DEPTH CROSS-SECTION</span>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
          {isDemo ? 'DEMO DATA' : 'LIVE DATA'}
        </span>
      </div>

      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center py-0.5 bg-ocean-900/60 rounded">
        SEA SURFACE
      </div>
      <div className="h-px bg-cyan-glow/30 my-1.5" />

      <div className="relative pl-3 space-y-2 my-2">
        {/* Vertical connecting line */}
        <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-cyan-glow via-sky-500 to-indigo-700" />

        {depthsList.map((item, idx) => {
          const isCurrent = activeDepth === item.depth;
          const tempVal = item.observed_temp ?? item.temperature ?? item.model_temp;
          const salVal = item.observed_sal ?? item.salinity ?? item.model_sal;

          return (
            <div
              key={idx}
              className={`relative flex items-center justify-between py-1 px-2 rounded transition-all ${
                isCurrent
                  ? 'bg-cyan-glow/20 border border-cyan-glow/60 shadow-sm'
                  : 'hover:bg-ocean-900/40'
              }`}
            >
              {/* Depth node */}
              <div className="flex items-center gap-2 z-10">
                <span
                  className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-cyan-glow ring-4 ring-cyan-glow/30 animate-pulse'
                      : 'bg-ocean-800 border border-slate-600'
                  }`}
                >
                  <span className="w-1 h-1 rounded-full bg-white" />
                </span>
                <span className={`text-[11px] font-bold ${isCurrent ? 'text-cyan-glow' : 'text-slate-300'}`}>
                  {item.depth === 0 ? '0 m' : `${item.depth} m`}
                </span>
              </div>

              {/* Data values */}
              <div className="flex items-center gap-3 text-[11px]">
                {tempVal !== undefined && (
                  <span className={`flex items-center gap-0.5 ${isCurrent ? 'text-amber-300 font-bold' : 'text-slate-200'}`}>
                    <Thermometer className="w-3 h-3 text-amber-400 inline" />
                    {tempVal}°C
                  </span>
                )}
                {salVal !== undefined && (
                  <span className="text-slate-400 text-[10px] hidden sm:inline">
                    <Droplet className="w-2.5 h-2.5 text-sky-400 inline mr-0.5" />
                    {salVal} PSU
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-indigo-500/30 my-1.5" />
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center py-0.5 bg-ocean-900/60 rounded">
        DEEP OCEAN (500 m)
      </div>
    </div>
  );
}
