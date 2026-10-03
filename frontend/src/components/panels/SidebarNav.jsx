import React from 'react';
import { 
  Globe2, 
  MapPin, 
  ShieldCheck, 
  BarChart3, 
  Database, 
  Info, 
  Compass, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

export default function SidebarNav({
  activeTab = 'explorer',
  onSelectTab,
  onOpenDemoMode,
  isDemoModeActive = false
}) {
  const navItems = [
    { id: 'explorer', label: '3D Explorer', icon: Globe2 },
    { id: 'observations', label: 'Observations', icon: MapPin },
    { id: 'validation', label: 'Model Validation', icon: ShieldCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'datasources', label: 'Data Sources', icon: Database },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <aside className="w-16 md:w-20 bg-ocean-950/90 backdrop-blur-xl border-r border-navy-border flex flex-col items-center py-4 z-30 select-none shadow-2xl justify-between">
      {/* Brand Logo & Icon */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-glow to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-glow/20 border border-cyan-glow/40">
          <Compass className="w-6 h-6 text-ocean-950" />
        </div>
        <span className="text-[9px] font-black tracking-widest text-cyan-glow uppercase mt-1">JALDRISTI</span>
      </div>

      {/* Navigation Buttons */}
      <nav className="flex flex-col gap-3 my-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={item.label}
              className={`relative group flex flex-col items-center justify-center p-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/50 shadow-md shadow-cyan-glow/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-ocean-800/50'
              }`}
            >
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="text-[9px] font-mono mt-1 hidden md:block tracking-tight">{item.label.split(' ')[0]}</span>

              {/* Active neon pip */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-glow rounded-r-full shadow-sm shadow-cyan-glow" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Hackathon Demo Mode Launcher Button */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onOpenDemoMode}
          title="Launch Guided Hackathon Demo Mode"
          className={`flex flex-col items-center p-2 rounded-xl transition-all border ${
            isDemoModeActive
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 animate-pulse'
              : 'bg-ocean-900/60 text-cyan-muted hover:text-cyan-glow border-navy-border hover:border-cyan-glow/40'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-[8px] font-bold tracking-wider uppercase mt-0.5 text-amber-300">DEMO</span>
        </button>

        <span className="text-[8px] font-mono text-slate-500 text-center uppercase tracking-tighter">SIH 2026</span>
      </div>
    </aside>
  );
}
