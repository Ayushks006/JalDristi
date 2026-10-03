import React, { useState } from 'react';
import { Search, MapPin, Navigation, X } from 'lucide-react';

export default function SearchBar({ observations = [], onNavigateLocation, onSelectObservation }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    // 1. Check if latitude/longitude format (e.g. "12.34, 72.18" or "15N 68E")
    const coordMatch = q.match(/(-?\d+\.?\d*)\s*(?:°|deg)?\s*([ns])?,?\s*(-?\d+\.?\d*)\s*(?:°|deg)?\s*([ew])?/i);
    if (coordMatch && coordMatch[1] && coordMatch[3]) {
      let lat = parseFloat(coordMatch[1]);
      let lon = parseFloat(coordMatch[3]);
      if (coordMatch[2] && coordMatch[2].toLowerCase() === 's') lat = -lat;
      if (coordMatch[4] && coordMatch[4].toLowerCase() === 'w') lon = -lon;

      if (!isNaN(lat) && !isNaN(lon)) {
        onNavigateLocation({ lat, lon, zoom: 2200000 });
        setIsOpen(false);
        return;
      }
    }

    // 2. Check region names
    const qLower = q.toLowerCase();
    if (qLower.includes('arabian')) {
      onNavigateLocation({ lat: 15.0, lon: 65.0, zoom: 2500000 });
      setIsOpen(false);
      return;
    }
    if (qLower.includes('bengal') || qLower.includes('bob')) {
      onNavigateLocation({ lat: 14.0, lon: 87.0, zoom: 2500000 });
      setIsOpen(false);
      return;
    }
    if (qLower.includes('equator')) {
      onNavigateLocation({ lat: 0.0, lon: 78.0, zoom: 3500000 });
      setIsOpen(false);
      return;
    }

    // 3. Search observations list
    const foundObs = observations.find(o => 
      o.id.toLowerCase().includes(qLower) || 
      o.name.toLowerCase().includes(qLower)
    );

    if (foundObs) {
      onNavigateLocation({ lat: foundObs.lat, lon: foundObs.lon, zoom: 1800000 });
      onSelectObservation(foundObs);
      setIsOpen(false);
      return;
    }

    // Default fallback
    onNavigateLocation({ lat: 6.0, lon: 76.0, zoom: 6000000 });
    setIsOpen(false);
  };

  // Filtered auto-suggestions
  const suggestions = query.trim().length > 1
    ? observations.filter(o => o.id.toLowerCase().includes(query.toLowerCase()) || o.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="relative w-72 md:w-96 select-none">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <div className="absolute left-3 text-cyan-glow pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search location (12.3, 72.1), buoy, Argo ID..."
          className="w-full bg-ocean-950/85 backdrop-blur-xl border border-navy-border focus:border-cyan-glow rounded-xl pl-9 pr-8 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none shadow-lg transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-2.5 text-slate-400 hover:text-slate-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Auto-suggest dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-ocean-950/95 backdrop-blur-2xl border border-cyan-glow/40 rounded-xl shadow-2xl p-1.5 z-50 text-xs font-mono">
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setQuery(s.id);
                setIsOpen(false);
                onNavigateLocation({ lat: s.lat, lon: s.lon, zoom: 1800000 });
                onSelectObservation(s);
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-ocean-800 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-glow" />
                <div>
                  <span className="font-bold text-slate-100">{s.id}</span>
                  <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">{s.name}</span>
                </div>
              </div>
              <span className="text-[10px] text-cyan-muted">{s.lat}°N, {s.lon}°E</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
