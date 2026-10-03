import React from 'react';
import { Compass, Sparkles, Upload, MessageSquareCode, ShieldAlert } from 'lucide-react';
import SearchBar from '../controls/SearchBar';

export default function Header({
  observations = [],
  onNavigateLocation,
  onSelectObservation,
  onOpenUpload,
  onOpenAskVision,
  onOpenDemoTour,
  isDemoTourActive
}) {
  return (
    <header className="h-14 bg-ocean-950/90 backdrop-blur-xl border-b border-navy-border px-4 flex items-center justify-between z-30 select-none shadow-lg">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-glow to-blue-600 flex items-center justify-center text-ocean-950 shadow-md shadow-cyan-glow/20">
            <Compass className="w-5 h-5 text-ocean-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wider text-slate-100 font-sans">
                JalDristi
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30 font-bold uppercase tracking-wider hidden sm:inline-block">
                SIH 2026 PROTOTYPE
              </span>
            </div>
            <p className="text-[10px] font-mono text-cyan-muted truncate hidden md:block">
              Interactive 3D Ocean Intelligence & Visualization Platform
            </p>
          </div>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <SearchBar
          observations={observations}
          onNavigateLocation={onNavigateLocation}
          onSelectObservation={onSelectObservation}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Ask JalDristi Natural Language Query Button */}
        <button
          onClick={onOpenAskVision}
          title="Ask JalDristi with scientific query commands"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ocean-900/80 hover:bg-cyan-glow/15 border border-navy-border hover:border-cyan-glow/50 text-xs font-mono text-slate-200 hover:text-cyan-glow transition-all shadow-sm"
        >
          <MessageSquareCode className="w-3.5 h-3.5 text-cyan-glow" />
          <span className="hidden md:inline">Ask JalDristi</span>
        </button>

        {/* Upload Dataset Button */}
        <button
          onClick={onOpenUpload}
          title="Upload CSV / JSON ocean dataset"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ocean-900/80 hover:bg-ocean-800 border border-navy-border hover:border-slate-600 text-xs font-mono text-slate-300 hover:text-slate-100 transition-all"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Upload</span>
        </button>

        {/* Guided Hackathon Demo Mode */}
        <button
          onClick={onOpenDemoTour}
          title="Launch Guided Hackathon Demo Story"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-md ${
            isDemoTourActive
              ? 'bg-amber-500 text-ocean-950 shadow-amber-500/20 animate-pulse'
              : 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 text-amber-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>DEMO MODE</span>
        </button>
      </div>
    </header>
  );
}
