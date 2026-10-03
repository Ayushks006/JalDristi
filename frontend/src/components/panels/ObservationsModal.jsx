import React, { useState, useMemo } from 'react';
import { MapPin, X, Search, Filter, Anchor, ExternalLink, Activity, ArrowRight } from 'lucide-react';

export default function ObservationsModal({
  observations = [],
  depth = 0,
  onSelectObservation,
  onFlyToLocation,
  onClose
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformType, setPlatformType] = useState('all');

  const filteredObs = useMemo(() => {
    return observations.filter((o) => {
      const matchType = platformType === 'all' || o.platform_type.toLowerCase() === platformType.toLowerCase();
      const matchSearch =
        !searchQuery ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [observations, platformType, searchQuery]);

  return (
    <div className="absolute inset-x-12 top-10 bottom-12 z-40 bg-ocean-950/95 backdrop-blur-2xl border border-cyan-glow/40 rounded-2xl p-6 shadow-2xl overflow-y-auto text-slate-100 flex flex-col max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-navy-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-glow/15 border border-cyan-glow/40 flex items-center justify-center text-cyan-glow shadow-md">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-wider text-slate-100 font-mono">IN-SITU OBSERVATIONS REGISTRY</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30">
                ACTIVE DEPTH: {depth} m
              </span>
            </div>
            <p className="text-xs font-mono text-cyan-muted mt-0.5">
              Live directory of oceanographic sampling platforms deployed across the Indian Ocean basin
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-lg bg-ocean-900 hover:bg-ocean-800 border border-navy-border text-xs font-mono text-slate-300 hover:text-cyan-glow transition-all"
        >
          CLOSE
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search float ID, WMO, or buoy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ocean-900 border border-navy-border rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-glow"
          />
        </div>

        {/* Platform Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Platforms' },
            { id: 'argo', label: '○ Argo Floats' },
            { id: 'buoy', label: '◆ Moored Buoys' },
            { id: 'vessel', label: '▲ Vessels' },
            { id: 'station', label: '■ Marine Stations' }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatformType(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                platformType === p.id
                  ? 'bg-cyan-glow text-ocean-950 font-bold shadow-md shadow-cyan-glow/20'
                  : 'bg-ocean-900/60 text-slate-400 hover:text-slate-200 border border-navy-border'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count readout */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-3 pb-1">
        <span>Showing {filteredObs.length} of {observations.length} active platforms</span>
        <span className="text-cyan-muted">Click row or inspect to target on 3D globe</span>
      </div>

      {/* Observations Table */}
      <div className="flex-1 overflow-x-auto border border-navy-border rounded-xl mt-1 bg-ocean-900/40">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-ocean-900/90 border-b border-navy-border text-slate-400 text-[10px] uppercase">
              <th className="p-3">Platform ID</th>
              <th className="p-3">Type</th>
              <th className="p-3">Name / Network</th>
              <th className="p-3">Coordinates</th>
              <th className="p-3 text-right">Obs Temp</th>
              <th className="p-3 text-right">Model Temp</th>
              <th className="p-3 text-right">Difference</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredObs.map((obs) => {
              const diff = obs.temperature_difference ?? Number((obs.observed_temperature - obs.model_temperature).toFixed(2));
              let badgeColor = 'text-cyan-glow bg-cyan-glow/10 border-cyan-glow/30';
              if (obs.platform_type === 'buoy') badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
              else if (obs.platform_type === 'vessel') badgeColor = 'text-pink-400 bg-pink-500/10 border-pink-500/30';
              else if (obs.platform_type === 'station') badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

              return (
                <tr
                  key={obs.id}
                  className="hover:bg-ocean-800/50 transition-colors cursor-pointer group"
                  onClick={() => {
                    if (onSelectObservation) onSelectObservation(obs);
                    if (onFlyToLocation) onFlyToLocation({ lat: obs.lat, lon: obs.lon, zoom: 2200000 });
                    onClose();
                  }}
                >
                  <td className="p-3 font-bold text-slate-100 group-hover:text-cyan-glow">
                    {obs.id}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${badgeColor}`}>
                      {obs.platform_type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 max-w-[200px] truncate">
                    {obs.name}
                  </td>
                  <td className="p-3 text-slate-400">
                    {obs.lat}°N, {obs.lon}°E
                  </td>
                  <td className="p-3 text-right text-cyan-glow font-bold">
                    {obs.observed_temperature}°C
                  </td>
                  <td className="p-3 text-right text-slate-300">
                    {obs.model_temperature}°C
                  </td>
                  <td className="p-3 text-right">
                    <span className={`font-bold ${diff >= 0 ? 'text-amber-400' : 'text-blue-400'}`}>
                      {diff > 0 ? `+${diff}` : diff}°C
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectObservation) onSelectObservation(obs);
                        if (onFlyToLocation) onFlyToLocation({ lat: obs.lat, lon: obs.lon, zoom: 2200000 });
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-ocean-800 hover:bg-cyan-glow hover:text-ocean-950 text-cyan-glow border border-cyan-glow/40 text-[10px] transition-all inline-flex items-center gap-1"
                    >
                      <span>Target</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
