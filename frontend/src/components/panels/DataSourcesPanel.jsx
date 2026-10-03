import React from 'react';
import { Database, ExternalLink, X, CheckCircle2, Globe, FileCode, Server } from 'lucide-react';

export default function DataSourcesPanel({ onClose }) {
  const sources = [
    {
      category: "NUMERICAL OCEAN CIRCULATION MODEL",
      title: "Global High-Resolution Ocean General Circulation Model (OGCM)",
      provider: "NOAA / NCEP & HYCOM Ocean Consortium",
      format: "NetCDF-4 / OPeNDAP Gridded Slices",
      desc: "Simulates continuous multi-layer velocity, sea surface temperature (SST), and salinity dynamics across the Indian Ocean basin with hydrostatic ocean primitives.",
      url: "https://www.hycom.org/data/datashare"
    },
    {
      category: "IN-SITU OBSERVATIONS (PROFILING FLOATS)",
      title: "Argo Global Marine Profiling Floats",
      provider: "International Argo Programme / INCOIS India",
      format: "NetCDF / WMO BUFR / CSV",
      desc: "Autonomous robotic floats cycling 0m to 2000m depths measuring CTD profiles every 10 days with global GPS telemetry.",
      url: "https://argo.ucsd.edu"
    },
    {
      category: "MOORED BUOYS & OCEAN FLUX NETWORKS",
      title: "RAMA & INCOIS OMNI Moored Deep-Sea Buoys",
      provider: "Ministry of Earth Sciences (MoES) / NOAA PMEL",
      format: "ASCII CSV / ERDDAP Open Streams",
      desc: "Fixed deep-ocean moorings anchored in the Arabian Sea, Bay of Bengal, and Equatorial Indian Ocean monitoring ocean-atmosphere interactions.",
      url: "https://incois.gov.in/portal/datainfo/mb.jsp"
    },
    {
      category: "PUBLIC API & DATA ACCESS PROTOCOL",
      title: "NOAA CoastWatch ERDDAP Server Protocol",
      provider: "NOAA Environmental Research Division",
      format: "RESTful ERDDAP 2.23 (JSON, CSV, NetCDF)",
      desc: "High-performance scientific data brokerage system allowing standardized subsetting across multidimensional space, depth, and time.",
      url: "https://coastwatch.pfeg.noaa.gov/erddap"
    }
  ];

  return (
    <div className="absolute inset-x-20 top-12 bottom-16 z-40 bg-ocean-950/95 backdrop-blur-2xl border border-cyan-glow/40 rounded-2xl p-6 shadow-2xl overflow-y-auto text-slate-100 flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-navy-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-glow/15 border border-cyan-glow/40 flex items-center justify-center text-cyan-glow">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-wider text-slate-100">DATA SOURCES & ARCHITECTURE</h2>
            <p className="text-xs font-mono text-cyan-muted">Open-source scientific data integration architecture</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {sources.map((s, idx) => (
          <div key={idx} className="bg-ocean-900/60 rounded-xl p-4 border border-navy-border flex flex-col justify-between hover:border-cyan-glow/40 transition-colors">
            <div>
              <span className="text-[10px] font-mono text-cyan-glow tracking-wider block mb-1">
                {s.category}
              </span>
              <h3 className="text-sm font-bold text-slate-100 mb-1 leading-snug">{s.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">{s.desc}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Provider:</span>
                <span className="text-slate-200">{s.provider}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Format:</span>
                <span className="text-cyan-muted">{s.format}</span>
              </div>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-cyan-glow hover:underline mt-2 pt-1"
              >
                <span>Access Documentation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Box */}
      <div className="mt-4 bg-ocean-900/40 p-3 rounded-xl border border-navy-border flex items-center gap-3 text-xs font-mono text-slate-400">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <span>
          Compliance notice: All datasets integrated adhere to WMO/IOC free and open ocean data sharing policies. Demo data is clearly segregated from production public gateways.
        </span>
      </div>
    </div>
  );
}
