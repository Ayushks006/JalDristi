import React, { useState } from 'react';
import { MapPin, X, Activity, ArrowRight, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import DepthCrossSection from '../controls/DepthCrossSection';

export default function LocationInspectCard({
  locationData,
  depth = 0,
  onClose,
  onCompare
}) {
  const [showCrossSection, setShowCrossSection] = useState(false);

  if (!locationData) return null;

  const { lat, lon, nearestObs, nearestModel } = locationData;

  // Synthesize realistic local profile if nearestObs has depth_profile
  const localProfile = nearestObs?.depth_profile || [
    { depth: 0, model_temp: Number((nearestModel?.temperature ?? 28.5).toFixed(1)), observed_temp: Number(((nearestModel?.temperature ?? 28.5) + 0.3).toFixed(1)) },
    { depth: 10, model_temp: Number((nearestModel?.temperature ?? 28.5 - 0.2).toFixed(1)), observed_temp: Number(((nearestModel?.temperature ?? 28.5) + 0.1).toFixed(1)) },
    { depth: 50, model_temp: Number(((nearestModel?.temperature ?? 28.5) - 2.0).toFixed(1)), observed_temp: Number(((nearestModel?.temperature ?? 28.5) - 1.8).toFixed(1)) },
    { depth: 100, model_temp: Number(((nearestModel?.temperature ?? 28.5) - 6.5).toFixed(1)), observed_temp: Number(((nearestModel?.temperature ?? 28.5) - 6.2).toFixed(1)) },
    { depth: 250, model_temp: 14.8, observed_temp: 15.1 },
    { depth: 500, model_temp: 8.6, observed_temp: 8.9 },
  ];

  return (
    <div className="absolute top-20 left-20 z-30 w-84 bg-ocean-950/95 backdrop-blur-2xl border border-cyan-glow/40 rounded-xl p-4 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-navy-border">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-glow" />
          <h3 className="text-xs font-bold tracking-wider font-mono text-slate-100">SELECTED COORDINATES</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
            DEMO DATA
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-xs font-mono">
        <div className="flex justify-between text-slate-300 bg-ocean-900/60 p-1.5 rounded border border-navy-border">
          <span>LATITUDE / LONGITUDE</span>
          <span className="text-cyan-glow font-bold">{lat}° N, {lon}° E</span>
        </div>
        <div className="flex justify-between text-slate-300 bg-ocean-900/60 p-1.5 rounded border border-navy-border">
          <span>ACTIVE DEPTH</span>
          <span className="text-slate-100">{depth} meters</span>
        </div>

        {nearestModel && (
          <div className="bg-ocean-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <div className="text-[10px] text-cyan-muted uppercase font-bold flex justify-between">
              <span>NEAREST NUMERICAL MODEL GRID</span>
              <span className="text-cyan-glow">MODEL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Temperature:</span>
              <span className="text-slate-100 font-bold">{nearestModel.temperature} °C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Salinity:</span>
              <span className="text-slate-100">{nearestModel.salinity} PSU</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Current Velocity:</span>
              <span className="text-slate-100">{nearestModel.current_speed} m/s ({nearestModel.current_direction}°)</span>
            </div>
          </div>
        )}

        {nearestObs && (
          <div className="bg-ocean-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <div className="flex justify-between items-center text-[10px] text-amber-400 uppercase font-bold">
              <span>NEAREST IN-SITU OBSERVATION</span>
              <span className="text-slate-400 font-normal uppercase">{nearestObs.platform_type}</span>
            </div>
            <div className="text-[11px] text-slate-200 truncate">{nearestObs.id} ({nearestObs.name})</div>
            <div className="flex justify-between">
              <span className="text-slate-400">Observed Temp:</span>
              <span className="text-cyan-glow font-bold">{nearestObs.observed_temperature} °C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Discrepancy:</span>
              <span className={nearestObs.temperature_difference >= 0 ? "text-amber-400 font-bold" : "text-blue-400 font-bold"}>
                {nearestObs.temperature_difference > 0 ? `+${nearestObs.temperature_difference}` : nearestObs.temperature_difference} °C
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Depth Cross-Section Expandable Accordion */}
      <div className="mt-3">
        <button
          onClick={() => setShowCrossSection(!showCrossSection)}
          className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-ocean-900/90 hover:bg-ocean-800 border border-navy-border text-[11px] font-mono text-slate-300 transition-colors"
        >
          <span className="flex items-center gap-1.5 text-cyan-glow">
            <Layers className="w-3.5 h-3.5" />
            Vertical Depth Cross-Section
          </span>
          {showCrossSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showCrossSection && (
          <div className="mt-2 animate-in fade-in duration-150">
            <DepthCrossSection
              profile={localProfile}
              activeDepth={depth}
              isDemo={true}
            />
          </div>
        )}
      </div>

      <div className="mt-3">
        <button
          onClick={() => onCompare(nearestObs || locationData)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cyan-glow text-ocean-950 font-mono font-bold text-xs hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-glow/20"
        >
          <span>COMPARE AT THIS LOCATION</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
