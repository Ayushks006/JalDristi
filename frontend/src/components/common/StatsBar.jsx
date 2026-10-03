import React from 'react';
import { Activity, ShieldCheck, Thermometer, Database, CheckCircle } from 'lucide-react';

export default function StatsBar({ stats }) {
  const {
    observationCount = 48,
    modelPointCount = 384,
    averageTemperature = 28.5,
    mae = 0.38,
    rmse = 0.49,
    lastUpdate = '20 Sep 2026',
    dataSource = 'DEMO DATASET'
  } = stats || {};

  return (
    <div className="h-9 bg-ocean-950/95 backdrop-blur-xl border-t border-navy-border px-4 flex items-center justify-between z-30 select-none text-[11px] font-mono text-slate-300">
      {/* Left side: Key live metrics */}
      <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400">STATUS:</span>
          <span className="text-emerald-400 font-bold">OPERATIONAL</span>
        </div>

        <div className="h-3 w-px bg-navy-border hidden sm:block" />

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">OBSERVATIONS:</span>
          <span className="text-cyan-glow font-bold">{observationCount.toLocaleString()}</span>
        </div>

        <div className="h-3 w-px bg-navy-border hidden sm:block" />

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">MODEL POINTS:</span>
          <span className="text-slate-100 font-bold">{modelPointCount.toLocaleString()}</span>
        </div>

        <div className="h-3 w-px bg-navy-border hidden sm:block" />

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">AVG TEMP:</span>
          <span className="text-cyan-glow font-bold">{averageTemperature} °C</span>
        </div>

        <div className="h-3 w-px bg-navy-border hidden sm:block" />

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">MODEL MAE:</span>
          <span className="text-amber-400 font-bold">{mae} °C</span>
        </div>

        <div className="h-3 w-px bg-navy-border hidden sm:block" />

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">RMSE:</span>
          <span className="text-amber-400 font-bold">{rmse} °C</span>
        </div>
      </div>

      {/* Right side: Timestamp & Data Source badge */}
      <div className="flex items-center gap-3 whitespace-nowrap pl-3">
        <div className="hidden lg:flex items-center gap-1 text-slate-400">
          <span>UPDATED:</span>
          <span className="text-slate-200">{lastUpdate}</span>
        </div>

        <div className="px-2 py-0.5 rounded bg-ocean-900 border border-navy-border text-[10px] text-cyan-muted font-bold tracking-tight">
          {dataSource}
        </div>
      </div>
    </div>
  );
}
