import React from 'react';
import { Info, CheckCircle2, ShieldCheck, Globe, Layers, Activity, X } from 'lucide-react';

export default function AboutModal({ onClose }) {
  const capabilities = [
    { title: "Interactive 3D Earth", desc: "Photorealistic digital globe with global continents, high-resolution bathymetry, atmospheric glow, and smooth multi-perspective camera navigation." },
    { title: "Ocean Model Visualization", desc: "Continuous smooth spatial fields representing numerical circulation model temperature, salinity, and flow patterns." },
    { title: "In-Situ Observations", desc: "Geographically co-located multi-platform monitoring including Argo profiling floats, moored buoys (RAMA / INCOIS OMNI), research vessels, and coastal stations." },
    { title: "Temperature", desc: "Multi-depth thermal stratification fields, sea surface temperatures, and vertical thermocline profiles." },
    { title: "Salinity", desc: "Practical Salinity Unit (PSU) distribution fields across basins from the high-salinity Arabian Sea to river-fed Bay of Bengal." },
    { title: "Ocean Currents", desc: "Geographically anchored vector particle flow fields dynamically animated according to eastward (u) and northward (v) velocity components." },
    { title: "Depth Exploration", desc: "Seamless vertical water column slicing from sea surface (0m) down through 10m, 50m, 100m, 250m, and 500m deep ocean." },
    { title: "Time Exploration", desc: "4D temporal trajectory playback highlighting monsoon circulation dynamics, seasonal upwelling, and eddy evolution." },
    { title: "Model Validation", desc: "Real-time statistical verification calculating MAE, RMSE, Mean Bias, Pearson correlation (r), and 1:1 parity scatter distributions." },
    { title: "Difference Analysis", desc: "Intuitive diverging anomaly layers (-2°C to +2°C) highlighting numerical model over-prediction and under-prediction zones." },
    { title: "Interactive Analytics", desc: "Basin-level comparative hydrodynamics charts and interactive CTD vertical profile inspection." }
  ];

  return (
    <div className="absolute inset-x-20 top-12 bottom-16 z-40 bg-ocean-950/95 backdrop-blur-2xl border border-cyan-glow/40 rounded-2xl p-6 shadow-2xl overflow-y-auto text-slate-100 flex flex-col max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-navy-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-glow/15 border border-cyan-glow/40 flex items-center justify-center text-cyan-glow">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-wider text-slate-100">JalDristi</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30">
                SIH 2026 PROTOTYPE
              </span>
            </div>
            <p className="text-xs font-mono text-cyan-muted">Interactive 3D Ocean Intelligence & Visualization Platform</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Problem & Solution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-ocean-900/60 p-4 rounded-xl border border-navy-border">
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1 font-bold">
            PROBLEM
          </span>
          <p className="text-xs text-slate-300 leading-relaxed mt-2">
            Ocean information is distributed across numerical models and multiple observation systems, making integrated exploration and comparison difficult.
          </p>
        </div>

        <div className="bg-ocean-900/60 p-4 rounded-xl border border-cyan-glow/30">
          <span className="text-[10px] font-mono text-cyan-glow uppercase tracking-wider block mb-1 font-bold">
            SOLUTION
          </span>
          <p className="text-xs text-slate-300 leading-relaxed mt-2">
            JalDristi provides an interactive 3D environment to explore, visualize and compare ocean model outputs with in-situ observations across space, depth and time.
          </p>
        </div>
      </div>

      {/* Key Capabilities */}
      <div className="mt-5">
        <h3 className="text-xs font-bold font-mono tracking-wider text-cyan-glow uppercase mb-3">
          KEY CAPABILITIES
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {capabilities.map((c, idx) => (
            <div key={idx} className="bg-ocean-900/40 p-3 rounded-lg border border-navy-border flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-glow flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">{c.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
