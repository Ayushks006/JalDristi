import React, { useState } from 'react';
import { X, Activity, Thermometer, Droplet, ArrowRight, ShieldCheck, Compass, Anchor, Layers, LineChart as ChartIcon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import DepthCrossSection from '../controls/DepthCrossSection';

export default function ObservationDetail({ observation, onClose }) {
  const [activeChartVar, setActiveChartVar] = useState('temperature'); // 'temperature' | 'salinity'
  const [activeProfileTab, setActiveProfileTab] = useState('cross-section'); // 'cross-section' | 'chart'

  if (!observation) return null;

  const profileData = observation.depth_profile || [
    { depth: 0, model_temp: observation.model_temperature, observed_temp: observation.observed_temperature, model_sal: observation.model_salinity, observed_sal: observation.observed_salinity },
    { depth: 10, model_temp: observation.model_temperature - 0.1, observed_temp: observation.observed_temperature - 0.1, model_sal: observation.model_salinity, observed_sal: observation.observed_salinity },
    { depth: 50, model_temp: observation.model_temperature - 1.5, observed_temp: observation.observed_temperature - 1.3, model_sal: observation.model_salinity, observed_sal: observation.observed_salinity },
    { depth: 100, model_temp: observation.model_temperature - 7.0, observed_temp: observation.observed_temperature - 6.8, model_sal: observation.model_salinity + 0.3, observed_sal: observation.observed_salinity + 0.2 },
    { depth: 250, model_temp: observation.model_temperature - 15.0, observed_temp: observation.observed_temperature - 14.8, model_sal: observation.model_salinity - 0.2, observed_sal: observation.observed_salinity - 0.3 },
    { depth: 500, model_temp: 8.5, observed_temp: 8.8, model_sal: 34.8, observed_sal: 34.85 },
  ];

  const diffTemp = observation.temperature_difference ?? Number((observation.observed_temperature - observation.model_temperature).toFixed(2));
  const diffSal = observation.salinity_difference ?? Number((observation.observed_salinity - observation.model_salinity).toFixed(2));

  // Quality badge styling
  let qualityColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  if (observation.quality_flag === 'Moderate') qualityColor = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
  else if (observation.quality_flag === 'Poor') qualityColor = 'bg-red-500/20 text-red-400 border-red-500/40';

  return (
    <div className="absolute top-4 right-84 z-30 w-96 bg-ocean-950/95 backdrop-blur-2xl border border-cyan-glow/40 rounded-xl p-4 shadow-2xl text-slate-100 animate-in fade-in slide-in-from-right-5 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-navy-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-glow/15 border border-cyan-glow/40 flex items-center justify-center text-cyan-glow">
            <Anchor className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide text-slate-100 font-mono">{observation.id}</h3>
            <span className="text-[10px] font-mono text-cyan-muted uppercase">{observation.name}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-100 hover:bg-ocean-800 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
        <div className="bg-ocean-900/60 p-2 rounded border border-navy-border">
          <span className="text-[10px] text-slate-400 block">SOURCE / PLATFORM</span>
          <span className="text-cyan-glow capitalize">{observation.platform_type}</span>
        </div>
        <div className="bg-ocean-900/60 p-2 rounded border border-navy-border">
          <span className="text-[10px] text-slate-400 block">QUALITY FLAG</span>
          <span className={`inline-block px-1.5 py-0.2 rounded border text-[10px] mt-0.5 ${qualityColor}`}>
            ● {observation.quality_flag || 'Good'}
          </span>
        </div>
        <div className="bg-ocean-900/60 p-2 rounded border border-navy-border">
          <span className="text-[10px] text-slate-400 block">COORDINATES</span>
          <span className="text-slate-200">{observation.lat}° N, {observation.lon}° E</span>
        </div>
        <div className="bg-ocean-900/60 p-2 rounded border border-navy-border">
          <span className="text-[10px] text-slate-400 block">MEASUREMENT DEPTH</span>
          <span className="text-slate-200">{observation.depth} meters</span>
        </div>
      </div>

      {/* Model vs Observation Comparison Box */}
      <div className="mt-3 bg-ocean-900/80 rounded-lg p-3 border border-cyan-glow/25">
        <div className="text-[10px] font-mono text-cyan-muted uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>MODEL VS OBSERVATION CO-LOCATION</span>
          <Activity className="w-3.5 h-3.5 text-cyan-glow" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="bg-ocean-950/60 p-2 rounded border border-slate-800">
            <span className="text-[9px] text-slate-400 block">MODEL VALUE</span>
            <span className="text-xs font-bold text-slate-200">{observation.model_temperature} °C</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">{observation.model_salinity} PSU</span>
          </div>
          <div className="bg-ocean-950/60 p-2 rounded border border-slate-800">
            <span className="text-[9px] text-cyan-muted block">OBSERVED</span>
            <span className="text-xs font-bold text-cyan-glow">{observation.observed_temperature} °C</span>
            <span className="text-[9px] text-cyan-muted/80 block mt-0.5">{observation.observed_salinity} PSU</span>
          </div>
          <div className="bg-ocean-950/60 p-2 rounded border border-slate-800">
            <span className="text-[9px] text-slate-400 block">DIFFERENCE</span>
            <span className={`text-xs font-bold ${diffTemp >= 0 ? 'text-amber-400' : 'text-blue-400'}`}>
              {diffTemp > 0 ? `+${diffTemp}` : diffTemp} °C
            </span>
            <span className={`text-[9px] block mt-0.5 ${diffSal >= 0 ? 'text-amber-400' : 'text-blue-400'}`}>
              {diffSal > 0 ? `+${diffSal}` : diffSal} PSU
            </span>
          </div>
        </div>
      </div>

      {/* Profile Visualization Section with Tabs */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          {/* View Tab Switcher */}
          <div className="flex items-center gap-1 bg-ocean-900/80 p-0.5 rounded-lg border border-navy-border">
            <button
              onClick={() => setActiveProfileTab('cross-section')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono transition-all ${
                activeProfileTab === 'cross-section'
                  ? 'bg-cyan-glow text-ocean-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Cross-Section</span>
            </button>
            <button
              onClick={() => setActiveProfileTab('chart')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono transition-all ${
                activeProfileTab === 'chart'
                  ? 'bg-cyan-glow text-ocean-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ChartIcon className="w-3 h-3" />
              <span>CTD Curve</span>
            </button>
          </div>

          {/* Variable Toggle */}
          <div className="flex gap-1">
            <button
              onClick={() => setActiveChartVar('temperature')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                activeChartVar === 'temperature'
                  ? 'bg-cyan-glow text-ocean-950 font-bold'
                  : 'bg-ocean-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Temp (°C)
            </button>
            <button
              onClick={() => setActiveChartVar('salinity')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                activeChartVar === 'salinity'
                  ? 'bg-cyan-glow text-ocean-950 font-bold'
                  : 'bg-ocean-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Sal (PSU)
            </button>
          </div>
        </div>

        {activeProfileTab === 'cross-section' ? (
          <DepthCrossSection
            profile={profileData}
            activeDepth={observation.depth || 0}
            isDemo={true}
            variable={activeChartVar}
          />
        ) : (
          <div className="h-44 w-full bg-ocean-900/60 rounded-lg p-2 border border-navy-border">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={profileData}
                layout="vertical"
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  domain={activeChartVar === 'temperature' ? [5, 32] : [31, 37]}
                  tick={{ fill: '#94a3b8', fontSize: 9 }}
                  stroke="#334155"
                />
                <YAxis
                  dataKey="depth"
                  type="number"
                  reversed={true}
                  domain={[0, 500]}
                  tick={{ fill: '#94a3b8', fontSize: 9 }}
                  stroke="#334155"
                  unit="m"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071329', borderColor: '#00f2fe', fontSize: 10, borderRadius: 6 }}
                  formatter={(val, name) => [`${val} ${activeChartVar === 'temperature' ? '°C' : 'PSU'}`, name]}
                  labelFormatter={(d) => `Depth: ${d} m`}
                />
                <Legend
                  wrapperStyle={{ fontSize: 9, paddingTop: 4 }}
                  iconSize={8}
                />
                {activeChartVar === 'temperature' ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="observed_temp"
                      name="In-Situ Observed"
                      stroke="#00f2fe"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#00f2fe' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="model_temp"
                      name="Numerical Model"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 2.5, fill: '#f59e0b' }}
                    />
                  </>
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="observed_sal"
                      name="In-Situ Salinity"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#38bdf8' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="model_sal"
                      name="Model Salinity"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 2.5, fill: '#10b981' }}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-2 text-[9px] font-mono text-slate-500 text-center">
        Values co-located at timestamp: {observation.time || '20 Sep 2026'}
      </div>
    </div>
  );
}
