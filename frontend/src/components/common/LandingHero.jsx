import React from 'react';
import { Compass, Sparkles, ArrowRight, ShieldCheck, Globe, Layers, Activity } from 'lucide-react';

export default function LandingHero({ onLaunch, onLaunchDemo }) {
  return (
    <div className="fixed inset-0 z-50 bg-ocean-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
      {/* Background Animated Glow Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-glow/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

      {/* Main Glass Card Container */}
      <div className="relative z-10 max-w-2xl bg-ocean-900/60 backdrop-blur-xl border border-cyan-glow/30 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-cyan-glow/10">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-glow/10 border border-cyan-glow/40 text-[11px] font-mono text-cyan-glow mb-6">
          <span className="w-2 h-2 rounded-full bg-cyan-glow animate-ping" />
          <span className="font-bold tracking-wider uppercase">SIH 2026 PROTOTYPE</span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-cyan-glow via-white to-blue-400">
          JalDristi
        </h1>

        <h3 className="text-base sm:text-lg font-medium text-slate-300 mt-3 font-sans">
          Interactive 3D Ocean Intelligence & Visualization Platform
        </h3>

        <p className="text-sm font-mono text-cyan-muted/90 mt-4 max-w-lg mx-auto">
          “Explore the ocean across space, depth and time.”
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-8 text-xs font-mono text-slate-300">
          <div className="bg-ocean-950/70 p-3.5 rounded-xl border border-navy-border hover:border-cyan-glow/40 transition-colors flex flex-col items-center text-center gap-2">
            <Globe className="w-5 h-5 text-cyan-glow" />
            <div className="font-bold text-slate-100 uppercase tracking-wide">3D OCEAN GLOBE</div>
            <p className="text-[11px] text-slate-400 font-sans leading-tight">Explore ocean conditions in geographic space.</p>
          </div>
          <div className="bg-ocean-950/70 p-3.5 rounded-xl border border-navy-border hover:border-emerald-400/40 transition-colors flex flex-col items-center text-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div className="font-bold text-slate-100 uppercase tracking-wide">MODEL VALIDATION</div>
            <p className="text-[11px] text-slate-400 font-sans leading-tight">Compare numerical models with in-situ observations.</p>
          </div>
          <div className="bg-ocean-950/70 p-3.5 rounded-xl border border-navy-border hover:border-amber-400/40 transition-colors flex flex-col items-center text-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <div className="font-bold text-slate-100 uppercase tracking-wide">OCEAN DYNAMICS</div>
            <p className="text-[11px] text-slate-400 font-sans leading-tight">Visualize currents, temperature and salinity.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onLaunch}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-glow hover:bg-cyan-300 text-ocean-950 font-bold text-sm tracking-wider font-mono transition-all shadow-xl shadow-cyan-glow/20 hover:scale-105"
          >
            <span>LAUNCH EXPLORER</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onLaunchDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ocean-800/80 hover:bg-ocean-700/80 border border-amber-500/50 text-amber-300 font-bold text-sm tracking-wider font-mono transition-all shadow-lg hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>VIEW GUIDED DEMO</span>
          </button>
        </div>

        {/* Footnote */}
        <div className="mt-8 text-[10px] font-mono text-slate-500">
          Pure Client & FastAPI Architecture • Zero Paid API Keys Required • Ready for Evaluation
        </div>
      </div>
    </div>
  );
}
