import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, X, Compass, Activity, Thermometer } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export default function AnalyticsPanel({ modelData = [], observations = [], depth = 0, onClose }) {
  // Compute basin-level analytics
  const basinStats = useMemo(() => {
    const arabianSea = modelData.filter(pt => pt.lat > 5.0 && pt.lon < 72.0);
    const bayOfBengal = modelData.filter(pt => pt.lon >= 78.0 && pt.lat > 8.0);
    const equatorial = modelData.filter(pt => Math.abs(pt.lat) <= 5.0);

    const getAvg = (arr, key) => arr.length ? Number((arr.reduce((a, b) => a + (b[key] || 0), 0) / arr.length).toFixed(2)) : 0;

    return [
      {
        basin: "Arabian Sea",
        temp: getAvg(arabianSea, 'temperature'),
        salinity: getAvg(arabianSea, 'salinity'),
        speed: getAvg(arabianSea, 'current_speed'),
        samples: arabianSea.length
      },
      {
        basin: "Bay of Bengal",
        temp: getAvg(bayOfBengal, 'temperature'),
        salinity: getAvg(bayOfBengal, 'salinity'),
        speed: getAvg(bayOfBengal, 'current_speed'),
        samples: bayOfBengal.length
      },
      {
        basin: "Equatorial IO",
        temp: getAvg(equatorial, 'temperature'),
        salinity: getAvg(equatorial, 'salinity'),
        speed: getAvg(equatorial, 'current_speed'),
        samples: equatorial.length
      },
    ];
  }, [modelData]);

  // Thermocline depth decay profile curve
  const thermoclineProfile = [
    { depth: 0, temp: 28.8, sal: 35.2 },
    { depth: 10, temp: 28.7, sal: 35.2 },
    { depth: 50, temp: 27.2, sal: 35.1 },
    { depth: 100, temp: 21.4, sal: 35.3 },
    { depth: 250, temp: 13.2, sal: 34.9 },
    { depth: 500, temp: 8.5, sal: 34.8 },
  ];

  return (
    <div className="absolute inset-x-20 top-12 bottom-16 z-40 bg-ocean-950/95 backdrop-blur-2xl border border-cyan-glow/40 rounded-2xl p-6 shadow-2xl overflow-y-auto text-slate-100 flex flex-col max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-navy-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-glow/15 border border-cyan-glow/40 flex items-center justify-center text-cyan-glow">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wider text-slate-100">OCEANOGRAPHIC BASIN ANALYTICS</h2>
            <p className="text-xs font-mono text-cyan-muted">Regional hydrodynamics and thermocline structure</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Regional Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="bg-ocean-900/50 p-4 rounded-xl border border-navy-border flex flex-col">
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 mb-2">
            REGIONAL TEMPERATURE & SALINITY PROFILE (Depth: {depth}m)
          </h3>
          <div className="flex-1 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={basinStats} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="basin" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071329', borderColor: '#00f2fe', fontSize: 11, borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="temp" name="Avg Temperature (°C)" fill="#00f2fe" radius={[4, 4, 0, 0]} />
                <Bar dataKey="salinity" name="Avg Salinity (PSU)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vertical Water Column Profile */}
        <div className="bg-ocean-900/50 p-4 rounded-xl border border-navy-border flex flex-col">
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-200 mb-2">
            BASIN-AVERAGED THERMOCLINE CURVE (0m - 500m)
          </h3>
          <div className="flex-1 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={thermoclineProfile} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="depth" unit="m" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis domain={[5, 32]} unit="°C" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#071329', borderColor: '#00f2fe', fontSize: 11, borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="temp" name="Mean Temp" stroke="#00f2fe" fillOpacity={1} fill="url(#colorTemp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
