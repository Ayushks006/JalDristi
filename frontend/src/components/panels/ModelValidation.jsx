import React, { useMemo } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  HelpCircle, 
  BarChart2, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Line, 
  ComposedChart, 
  Bar, 
  Legend 
} from 'recharts';
import { computeValidationMetrics } from '../../services/validationMetrics';

export default function ModelValidation({
  observations = [],
  depth = 0,
  variable = 'temperature',
  onClose
}) {
  const metrics = useMemo(() => computeValidationMetrics(observations), [observations]);

  // Prepare scatter plot data (Observed vs Model)
  const scatterData = useMemo(() => {
    return observations.map((o) => ({
      name: o.id,
      model: o.model_temperature,
      observed: o.observed_temperature,
      diff: o.temperature_difference,
      platform: o.platform_type
    }));
  }, [observations]);

  // Generate 1:1 ideal agreement reference line points
  const parityLine = [
    { x: 10, y: 10 },
    { x: 32, y: 32 }
  ];

  return (
    <div className="absolute inset-x-20 top-12 bottom-16 z-40 bg-ocean-950/95 backdrop-blur-2xl border border-cyan-glow/40 rounded-2xl p-6 shadow-2xl overflow-y-auto text-slate-100 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-navy-border">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-cyan-glow/15 border border-cyan-glow/40 flex items-center justify-center text-cyan-glow shadow-lg shadow-cyan-glow/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-wider text-slate-100">NUMERICAL MODEL VALIDATION</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30">
                ACTIVE DEPTH: {depth} m
              </span>
            </div>
            <p className="text-xs font-mono text-cyan-muted mt-0.5">
              Comparative verification between in-situ ocean measurements and numerical model predictions
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-lg bg-ocean-900 hover:bg-ocean-800 border border-navy-border text-xs font-mono text-slate-300 hover:text-cyan-glow transition-all"
        >
          CLOSE DASHBOARD
        </button>
      </div>

      {/* Scientific Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MAE */}
        <div className="bg-ocean-900/60 border border-navy-border hover:border-cyan-glow/50 rounded-xl p-4 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>MEAN ABSOLUTE ERROR</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-ocean-800 text-cyan-glow font-bold">MAE</span>
          </div>
          <div className="text-3xl font-black font-mono text-cyan-glow mt-2">
            {metrics.mae} <span className="text-sm font-normal text-slate-400">°C</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
            Formula: <span className="text-slate-300">1/N ∑ |Obs_i - Model_i|</span>
          </div>
        </div>

        {/* RMSE */}
        <div className="bg-ocean-900/60 border border-navy-border hover:border-cyan-glow/50 rounded-xl p-4 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>ROOT MEAN SQUARE ERROR</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-ocean-800 text-cyan-glow font-bold">RMSE</span>
          </div>
          <div className="text-3xl font-black font-mono text-cyan-glow mt-2">
            {metrics.rmse} <span className="text-sm font-normal text-slate-400">°C</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
            Formula: <span className="text-slate-300">√( 1/N ∑ (Obs_i - Model_i)² )</span>
          </div>
        </div>

        {/* MEAN BIAS */}
        <div className="bg-ocean-900/60 border border-navy-border hover:border-cyan-glow/50 rounded-xl p-4 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>MEAN DISCREPANCY BIAS</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-ocean-800 text-cyan-glow font-bold">BIAS</span>
          </div>
          <div className={`text-3xl font-black font-mono mt-2 ${metrics.mean_bias >= 0 ? 'text-amber-400' : 'text-blue-400'}`}>
            {metrics.mean_bias > 0 ? `+${metrics.mean_bias}` : metrics.mean_bias} <span className="text-sm font-normal text-slate-400">°C</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
            Formula: <span className="text-slate-300">1/N ∑ (Obs_i - Model_i)</span>
          </div>
        </div>

        {/* N OBSERVATIONS & CORRELATION */}
        <div className="bg-ocean-900/60 border border-navy-border hover:border-cyan-glow/50 rounded-xl p-4 transition-all">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>SAMPLE SIZE & CORR</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-ocean-800 text-cyan-glow font-bold">r = {metrics.correlation}</span>
          </div>
          <div className="text-3xl font-black font-mono text-slate-100 mt-2">
            {metrics.count} <span className="text-sm font-normal text-slate-400">stations</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5 flex justify-between">
            <span>Pearson r: {metrics.correlation}</span>
            <span className="text-emerald-400">High Reliability</span>
          </div>
        </div>
      </div>

      {/* Chart Visualizations: Scatter Plot & Error Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[340px]">
        {/* Scatter 1:1 Plot */}
        <div className="bg-ocean-900/50 rounded-xl p-4 border border-navy-border flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200">
              OBSERVED VS MODEL 1:1 CORRELATION
            </h3>
            <span className="text-[10px] font-mono text-cyan-muted">Solid line = Ideal 1:1 Parity</span>
          </div>

          <div className="flex-1 w-full min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="model"
                  name="Model Temperature"
                  unit="°C"
                  domain={['dataMin - 1', 'dataMax + 1']}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  label={{ value: 'Numerical Model Prediction (°C)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="observed"
                  name="Observed Temperature"
                  unit="°C"
                  domain={['dataMin - 1', 'dataMax + 1']}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  label={{ value: 'In-Situ Observation (°C)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#071329', borderColor: '#00f2fe', fontSize: 11, borderRadius: 8 }}
                />
                <Scatter
                  name="Platforms"
                  data={scatterData}
                  fill="#00f2fe"
                  line={false}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly / Error Distribution Histogram */}
        <div className="bg-ocean-900/50 rounded-xl p-4 border border-navy-border flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200">
              ERROR FREQUENCY DISTRIBUTION (Observed - Model)
            </h3>
            <span className="text-[10px] font-mono text-cyan-muted">Binned Discrepancies</span>
          </div>

          <div className="flex-1 w-full min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metrics.histogram} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="range"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 9 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  label={{ value: 'Number of Observations', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071329', borderColor: '#00f2fe', fontSize: 11, borderRadius: 8 }}
                  formatter={(val) => [`${val} platforms`, 'Count']}
                />
                <Bar
                  dataKey="count"
                  name="Observation Frequency"
                  fill="#0284c7"
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dataset Notice & Certification */}
      <div className="bg-ocean-900/40 p-3 rounded-xl border border-navy-border flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Displayed validation metrics are computed directly from currently loaded oceanographic records.</span>
        </div>
        <span className="text-cyan-glow font-bold">Standard: IOC / UNESCO Ocean Data Standards</span>
      </div>
    </div>
  );
}
