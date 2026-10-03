import React from 'react';
import { 
  Layers, 
  Thermometer, 
  Droplet, 
  Wind, 
  Compass, 
  SlidersHorizontal, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  Activity,
  Box,
  Map
} from 'lucide-react';
import { PALETTES, getVariableBounds } from '../../services/colorScales';

export default function ControlPanel({
  variable = 'temperature',
  onSelectVariable,
  dataSource = 'demo',
  onSelectDataSource,
  layers = { model: true, observations: true, difference: false, currents: false, depth3D: false },
  onToggleLayer,
  viewMode = '3D',
  onToggleViewMode,
  depth = 0,
  platformFilter = 'all',
  onSelectPlatformFilter,
  selectedRegion = 'all',
  onSelectRegion,
  onResetFilters,
  onOpenUpload
}) {
  const bounds = getVariableBounds(variable, depth);
  const activePalette = layers.difference ? PALETTES.difference : (PALETTES[variable] || PALETTES.temperature);

  return (
    <div className="w-80 bg-ocean-950/85 backdrop-blur-xl border-l border-navy-border flex flex-col p-4 z-30 select-none shadow-2xl overflow-y-auto max-h-screen text-slate-200">
      {/* Header with Title & Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-navy-border">
        <div>
          <h2 className="text-sm font-bold tracking-wider text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-glow" />
            CONTROL PANEL
          </h2>
          <span className="text-[10px] font-mono text-cyan-muted">4D Multi-Layer Controls</span>
        </div>
        <div className="bg-cyan-glow/10 border border-cyan-glow/30 px-2 py-0.5 rounded text-[9px] font-mono text-cyan-glow">
          {dataSource === 'demo' ? 'DEMO DATA' : (dataSource === 'erddap' ? 'NOAA ERDDAP' : 'USER DATA')}
        </div>
      </div>

      {/* 2D MAP vs 3D GLOBE Switch */}
      <div className="mt-4">
        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
          PROJECTION MODE
        </label>
        <div className="grid grid-cols-2 gap-2 bg-ocean-900/80 p-1 rounded-lg border border-navy-border">
          <button
            onClick={() => onToggleViewMode('3D')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-mono transition-all ${
              viewMode === '3D'
                ? 'bg-cyan-glow text-ocean-950 font-bold shadow-md shadow-cyan-glow/20'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            3D GLOBE
          </button>
          <button
            onClick={() => onToggleViewMode('2D')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-mono transition-all ${
              viewMode === '2D'
                ? 'bg-cyan-glow text-ocean-950 font-bold shadow-md shadow-cyan-glow/20'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            2D MAP
          </button>
        </div>
      </div>

      {/* Variable Selector */}
      <div className="mt-4">
        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
          VARIABLE
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'temperature', label: 'Temperature', unit: '°C', icon: Thermometer },
            { id: 'salinity', label: 'Salinity', unit: 'PSU', icon: Droplet },
            { id: 'current_speed', label: 'Current Speed', unit: 'm/s', icon: Wind },
            { id: 'current_direction', label: 'Current Dir.', unit: 'deg', icon: Compass },
          ].map((v) => {
            const Icon = v.icon;
            const isSelected = variable === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onSelectVariable(v.id)}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-glow/15 border-cyan-glow text-cyan-glow shadow-sm'
                    : 'bg-ocean-900/50 border-navy-border text-slate-400 hover:text-slate-200 hover:bg-ocean-800/40'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-[11px] font-medium leading-tight truncate">{v.label}</div>
                  <div className="text-[9px] font-mono text-slate-500">{v.unit}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Source Selector */}
      <div className="mt-4">
        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
          DATA SOURCE
        </label>
        <select
          value={dataSource}
          onChange={(e) => {
            if (e.target.value === 'upload_modal') {
              onOpenUpload();
            } else {
              onSelectDataSource(e.target.value);
            }
          }}
          className="w-full bg-ocean-900 border border-navy-border rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-glow transition-colors cursor-pointer"
        >
          <option value="demo">Demo Dataset (Indian Ocean)</option>
          <option value="erddap">NOAA ERDDAP Open Gateway</option>
          <option value="uploaded">Uploaded Dataset</option>
          <option value="upload_modal">⚡ Upload Custom CSV / JSON...</option>
        </select>
        <div className="text-[10px] font-mono text-cyan-muted/80 mt-1 flex items-center gap-1">
          <span>●</span>
          {dataSource === 'demo' && 'Using demonstration dataset'}
          {dataSource === 'erddap' && 'Connected to NOAA CoastWatch ERDDAP'}
          {dataSource === 'uploaded' && 'Using custom uploaded user data'}
        </div>
      </div>

      {/* Layer Toggles */}
      <div className="mt-4">
        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center justify-between">
          <span>ACTIVE LAYERS</span>
          <Layers className="w-3.5 h-3.5 text-cyan-glow" />
        </label>
        <div className="space-y-1.5 bg-ocean-900/60 p-2.5 rounded-lg border border-navy-border">
          {[
            { id: 'model', label: 'Numerical Ocean Model', desc: 'Continuous Gridded Field' },
            { id: 'observations', label: 'In-Situ Observations', desc: 'Argo Floats & Moored Buoys' },
            { id: 'difference', label: 'Model-Observation Difference', desc: 'Diverging Anomaly Layer' },
            { id: 'currents', label: 'Ocean Currents', desc: 'Animated Vector Particles' },
            { id: 'depth3D', label: '3D Depth Mode', desc: 'Vertical Sub-Surface Profiles' },
          ].map((l) => (
            <label
              key={l.id}
              className="flex items-center justify-between p-1.5 rounded hover:bg-ocean-800/40 cursor-pointer transition-colors"
            >
              <div className="pr-2">
                <div className="text-xs font-medium text-slate-200 leading-tight">{l.label}</div>
                <div className="text-[9px] font-mono text-slate-500">{l.desc}</div>
              </div>
              <input
                type="checkbox"
                checked={layers[l.id]}
                onChange={() => onToggleLayer(l.id)}
                className="w-4 h-4 rounded border-slate-700 bg-ocean-950 text-cyan-glow focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-glow"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Dynamic Colormap Legend */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            {layers.difference ? 'MODEL ERROR / DIFFERENCE' : `${variable.replace('_', ' ').toUpperCase()} (${bounds.unit})`}
          </label>
          <span className="text-[10px] font-mono text-cyan-glow font-bold">
            {layers.difference ? '-2°C to +2°C' : `${bounds.min} - ${bounds.max} ${bounds.unit}`}
          </span>
        </div>

        {/* Gradient bar */}
        <div
          className="h-3.5 w-full rounded-md border border-navy-border shadow-inner"
          style={{
            background: `linear-gradient(to right, ${activePalette.map(p => p.hex).join(', ')})`
          }}
        />

        {/* Legend tick marks */}
        <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-1">
          {activePalette.map((p, idx) => (
            <span key={idx}>{p.label}</span>
          ))}
        </div>

        {layers.difference && (
          <div className="mt-1.5 text-[9px] font-mono text-slate-400 bg-ocean-900/80 p-1.5 rounded border border-slate-800 flex justify-between">
            <span className="text-blue-400">● Blue: Model Warm Bias</span>
            <span className="text-emerald-400">● Green: Near Zero</span>
            <span className="text-red-400">● Red: Cool Bias</span>
          </div>
        )}
      </div>

      {/* Observation Platform Filter */}
      <div className="mt-4">
        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
          PLATFORM TYPE
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: 'All Platforms' },
            { id: 'argo', label: '○ Argo Floats' },
            { id: 'buoy', label: '◆ Moored Buoys' },
            { id: 'vessel', label: '▲ Research Vessels' },
            { id: 'station', label: '■ Ocean Stations' },
          ].map((pf) => (
            <button
              key={pf.id}
              onClick={() => onSelectPlatformFilter(pf.id)}
              className={`py-1 px-2 text-[10px] font-mono rounded border text-left truncate transition-colors ${
                platformFilter === pf.id
                  ? 'bg-cyan-glow/20 border-cyan-glow text-cyan-glow font-bold'
                  : 'bg-ocean-900/40 border-navy-border text-slate-400 hover:text-slate-200'
              }`}
            >
              {pf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Region Fast Navigation */}
      <div className="mt-4">
        <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
          OCEAN BASIN
        </label>
        <select
          value={selectedRegion}
          onChange={(e) => onSelectRegion(e.target.value)}
          className="w-full bg-ocean-900 border border-navy-border rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-glow cursor-pointer"
        >
          <option value="all">All Indian Ocean Basin</option>
          <option value="arabian_sea">Arabian Sea</option>
          <option value="bay_of_bengal">Bay of Bengal</option>
          <option value="equatorial_io">Equatorial Indian Ocean</option>
          <option value="south_io">South Indian Ocean</option>
        </select>
      </div>

      {/* Reset Filters Action */}
      <div className="mt-6 pt-3 border-t border-navy-border">
        <button
          onClick={onResetFilters}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-ocean-900 hover:bg-ocean-800 text-slate-300 hover:text-cyan-glow border border-navy-border transition-all text-xs font-mono"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          RESET FILTERS
        </button>
      </div>
    </div>
  );
}
