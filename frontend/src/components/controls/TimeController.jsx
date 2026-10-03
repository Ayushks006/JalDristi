import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock, FastForward } from 'lucide-react';
import { TIMESTAMPS } from '../../services/demoDataGenerator';

const FORMATTED_DATES = [
  "20 September 2026 — 00:00 UTC",
  "21 September 2026 — 06:00 UTC",
  "22 September 2026 — 12:00 UTC",
  "23 September 2026 — 18:00 UTC",
  "24 September 2026 — 12:00 UTC",
  "25 September 2026 — 18:00 UTC",
];

export default function TimeController({
  timeIdx = 0,
  onChangeTimeIdx,
  isPlaying = false,
  onTogglePlay
}) {
  const [playbackSpeed, setPlaybackSpeed] = useState(2500); // ms per step

  // Auto-advance timer when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onChangeTimeIdx((prev) => (prev + 1) % TIMESTAMPS.length);
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, onChangeTimeIdx]);

  const handlePrev = () => {
    onChangeTimeIdx((timeIdx - 1 + TIMESTAMPS.length) % TIMESTAMPS.length);
  };

  const handleNext = () => {
    onChangeTimeIdx((timeIdx + 1) % TIMESTAMPS.length);
  };

  return (
    <div className="bg-ocean-950/90 backdrop-blur-xl border border-navy-border rounded-xl px-4 py-2.5 shadow-2xl text-slate-200 select-none flex flex-col md:flex-row items-center justify-between gap-3 w-full max-w-4xl mx-auto">
      {/* Play / Step Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          title="Previous Timestep"
          className="p-1.5 rounded-lg bg-ocean-900 hover:bg-ocean-800 text-slate-300 hover:text-cyan-glow border border-navy-border transition-colors"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onTogglePlay}
          title={isPlaying ? "Pause 4D Animation" : "Play 4D Animation"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
            isPlaying
              ? 'bg-amber-500 text-ocean-950 shadow-md shadow-amber-500/20'
              : 'bg-cyan-glow text-ocean-950 shadow-md shadow-cyan-glow/20'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY 4D'}</span>
        </button>

        <button
          onClick={handleNext}
          title="Next Timestep"
          className="p-1.5 rounded-lg bg-ocean-900 hover:bg-ocean-800 text-slate-300 hover:text-cyan-glow border border-navy-border transition-colors"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline Slider & Markers */}
      <div className="flex-1 w-full flex flex-col gap-1 mx-2">
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
          <span>20 SEP 2026</span>
          <div className="flex items-center gap-1.5 text-cyan-glow font-bold">
            <Clock className="w-3 h-3 animate-spin-slow" />
            <span>{FORMATTED_DATES[timeIdx]}</span>
          </div>
          <span>25 SEP 2026</span>
        </div>

        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={TIMESTAMPS.length - 1}
            step="1"
            value={timeIdx}
            onChange={(e) => onChangeTimeIdx(Number(e.target.value))}
            className="w-full h-1.5 bg-ocean-800 rounded-lg appearance-none cursor-pointer accent-cyan-glow focus:outline-none"
          />
        </div>

        {/* Timestamp tick marks */}
        <div className="flex justify-between text-[9px] font-mono text-slate-500 px-0.5">
          {TIMESTAMPS.map((t, idx) => (
            <span
              key={idx}
              onClick={() => onChangeTimeIdx(idx)}
              className={`cursor-pointer hover:text-cyan-glow transition-colors ${
                timeIdx === idx ? 'text-cyan-glow font-bold' : ''
              }`}
            >
              T+{idx * 24}h
            </span>
          ))}
        </div>
      </div>

      {/* Playback speed toggle */}
      <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono bg-ocean-900/60 p-1 rounded border border-navy-border text-slate-400">
        <span className="px-1 text-[9px]">SPEED:</span>
        <button
          onClick={() => setPlaybackSpeed(3500)}
          className={`px-1.5 py-0.5 rounded ${playbackSpeed === 3500 ? 'bg-ocean-800 text-cyan-glow' : 'hover:text-slate-200'}`}
        >
          1x
        </button>
        <button
          onClick={() => setPlaybackSpeed(2000)}
          className={`px-1.5 py-0.5 rounded ${playbackSpeed === 2000 ? 'bg-ocean-800 text-cyan-glow' : 'hover:text-slate-200'}`}
        >
          2x
        </button>
      </div>
    </div>
  );
}
