import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Play, X, Compass, Globe, ShieldCheck, Activity, Layers, Clock } from 'lucide-react';

const TOUR_STEPS = [
  {
    step: 1,
    title: "Step 1: Realistic Digital Earth Globe",
    desc: "Displaying the realistic 3D Earth globe showing all major continents, clear land masses, atmospheric glow, and true-color oceanic waters.",
    badge: "GLOBAL VIEW",
    config: {
      location: { lat: 15.0, lon: 75.0, zoom: 20000000 },
      layers: { model: false, observations: false, difference: false, currents: false, depth3D: false },
      depth: 0,
      isPlaying: false
    }
  },
  {
    step: 2,
    title: "Step 2: Fly Toward the Indian Ocean",
    desc: "Smoothly navigating camera focus into the North & Equatorial Indian Ocean basin, highlighting the Arabian Sea, Bay of Bengal, and Indian subcontinent.",
    badge: "INDIAN OCEAN",
    config: {
      location: { lat: 8.0, lon: 77.0, zoom: 6800000 },
      layers: { model: false, observations: false, difference: false, currents: false, depth3D: false },
      depth: 0,
      isPlaying: false
    }
  },
  {
    step: 3,
    title: "Step 3: Enable Numerical Ocean Model",
    desc: "Overlaying the continuous numerical circulation model layer (Sea Surface Temperature). Notice thermal stratification and warm pool gradients.",
    badge: "NUMERICAL MODEL",
    config: {
      variable: 'temperature',
      depth: 0,
      layers: { model: true, observations: false, difference: false, currents: false, depth3D: false },
      location: { lat: 8.0, lon: 77.0, zoom: 6500000 },
      isPlaying: false
    }
  },
  {
    step: 4,
    title: "Step 4: Enable In-Situ Observations",
    desc: "Activating co-located discrete observation platforms: autonomous Argo profiling floats (cyan), moored RAMA/OMNI buoys (amber diamonds), and coastal stations.",
    badge: "IN-SITU OBSERVATIONS",
    config: {
      layers: { model: true, observations: true, difference: false, currents: false, depth3D: false },
      location: { lat: 13.0, lon: 72.0, zoom: 3800000 },
      isPlaying: false
    }
  },
  {
    step: 5,
    title: "Step 5: Enable Ocean Currents",
    desc: "Activating the Ocean Currents layer on the 3D globe. Particle streamlines are geographically positioned and driven by horizontal u (east/west) and v (north/south) velocity fields.",
    badge: "OCEAN CURRENTS",
    config: {
      layers: { model: true, observations: true, difference: false, currents: true, depth3D: false },
      location: { lat: 10.0, lon: 75.0, zoom: 4500000 },
      isPlaying: false
    }
  },
  {
    step: 6,
    title: "Step 6: Select an In-Situ Observation",
    desc: "Focusing onto moored buoy INCOIS OMNI AD07 in the Arabian Sea to co-locate ground-truth measurements with numerical model forecasts.",
    badge: "TARGET PLATFORM",
    selectObsId: "BUOY-OMNI-AD07",
    config: {
      location: { lat: 14.92, lon: 69.18, zoom: 2200000 },
      layers: { model: true, observations: true, difference: false, currents: true, depth3D: false }
    }
  },
  {
    step: 7,
    title: "Step 7: Model vs Observed Comparison",
    desc: "Comparing co-located values in real-time. Notice Observed: 29.4°C vs Model: 29.1°C, along with the vertical CTD cross-section and thermocline structure.",
    badge: "CO-LOCATION",
    selectObsId: "BUOY-OMNI-AD07",
    config: {
      layers: { model: true, observations: true, difference: false, currents: true, depth3D: false }
    }
  },
  {
    step: 8,
    title: "Step 8: Show Model Difference / Anomaly",
    desc: "Switching on the diverging difference layer (-2°C to +2°C). Negative bias displays in blue, near zero in neutral green, and positive warm bias in red.",
    badge: "ERROR ANOMALY",
    config: {
      variable: 'difference',
      layers: { model: true, observations: true, difference: true, currents: true, depth3D: false },
      location: { lat: 12.0, lon: 74.0, zoom: 4500000 }
    }
  },
  {
    step: 9,
    title: "Step 9: Change Depth (0m → 100m Sub-Surface)",
    desc: "Descending through the water column to 100m depth. Notice the temperature drop across the thermocline and changing current vectors.",
    badge: "DEPTH: 100m",
    config: {
      depth: 100,
      variable: 'temperature',
      layers: { model: true, observations: true, difference: false, currents: true, depth3D: true }
    }
  },
  {
    step: 10,
    title: "Step 10: Animate Through 4D Time",
    desc: "Triggering 4D time playback across time steps. Watch the seasonal current jet evolution, shifting eddy circulations, and drifting Argo platforms.",
    badge: "4D TIMELAPSE",
    config: {
      isPlaying: true,
      layers: { model: true, observations: true, difference: false, currents: true, depth3D: false }
    }
  }
];

export default function DemoStoryTour({
  onApplyConfig,
  onSelectObsById,
  onClose
}) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const currentTour = TOUR_STEPS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      const nextStep = TOUR_STEPS[nextIdx];
      onApplyConfig(nextStep.config);
      if (nextStep.selectObsId) onSelectObsById(nextStep.selectObsId);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      const prevStep = TOUR_STEPS[prevIdx];
      onApplyConfig(prevStep.config);
      if (prevStep.selectObsId) onSelectObsById(prevStep.selectObsId);
    }
  };

  // Run initial step config on mount
  React.useEffect(() => {
    onApplyConfig(currentTour.config);
    if (currentTour.selectObsId) onSelectObsById(currentTour.selectObsId);
  }, []);

  return (
    <div className="absolute top-16 left-20 z-50 w-[410px] bg-ocean-950/95 backdrop-blur-2xl border border-amber-500/60 rounded-2xl p-5 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-navy-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider font-mono text-amber-300 uppercase">
              SIH 2026 GUIDED DEMO
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono text-slate-400">Step {currentStepIdx + 1} of {TOUR_STEPS.length}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold uppercase">
                {currentTour.badge}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="mt-3">
        <h4 className="text-sm font-bold text-slate-100 leading-snug">
          {currentTour.title}
        </h4>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          {currentTour.desc}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center items-center gap-1.5 mt-4 py-1">
        {TOUR_STEPS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentStepIdx(idx);
              onApplyConfig(s.config);
              if (s.selectObsId) onSelectObsById(s.selectObsId);
            }}
            title={s.title}
            className={`h-2 rounded-full cursor-pointer transition-all ${
              currentStepIdx === idx
                ? 'w-6 bg-amber-400 shadow-sm shadow-amber-400/50'
                : 'w-2 bg-slate-700 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-navy-border">
        <button
          onClick={handlePrev}
          disabled={currentStepIdx === 0}
          className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-ocean-900 hover:bg-ocean-800 disabled:opacity-40 disabled:hover:bg-ocean-900 text-xs font-mono text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-ocean-950 font-bold text-xs font-mono shadow-lg shadow-amber-500/20 transition-all"
        >
          <span>{currentStepIdx === TOUR_STEPS.length - 1 ? "Finish Tour" : "Next Step"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
