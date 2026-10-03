import React, { useState } from 'react';
import { Sparkles, CornerDownLeft, CheckCircle2, AlertCircle, X, Terminal } from 'lucide-react';
import { parseNaturalLanguageQuery } from '../../services/nlpQueryParser';

export default function AskJalDristi({ onExecuteQuery, onClose }) {
  const [inputQuery, setInputQuery] = useState('');
  const [feedback, setFeedback] = useState(null);

  const sampleQueries = [
    "Show temperature at 100 m",
    "Show salinity",
    "Show model difference",
    "Show observations",
    "Show currents",
    "Show areas where temperature is above 30°C",
    "Show observations near 12°N 72°E",
    "Show Arabian Sea buoys",
    "Show Argo floats",
  ];

  const handleSubmit = (queryToRun) => {
    const text = queryToRun || inputQuery;
    if (!text.trim()) return;

    const parsed = parseNaturalLanguageQuery(text);
    if (parsed.interpreted) {
      setFeedback({ success: true, text: parsed.message });
      onExecuteQuery(parsed);
    } else {
      setFeedback({ success: false, text: parsed.message });
    }
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl bg-ocean-950/95 backdrop-blur-2xl border border-cyan-glow/50 rounded-2xl p-5 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-navy-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-glow/20 border border-cyan-glow/50 flex items-center justify-center text-cyan-glow shadow-sm shadow-cyan-glow/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider text-slate-100 flex items-center gap-2">
              ASK JALDRISTI
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-glow/10 text-cyan-glow border border-cyan-glow/30">
                SCIENTIFIC NLP INTERFACE
              </span>
            </h3>
            <p className="text-[10px] font-mono text-cyan-muted">Offline rule-based natural language commands • Zero external API keys needed</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="mt-4 relative"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="e.g. 'Show temperature at 100 m' or 'Show model difference'..."
          className="w-full bg-ocean-900 border border-cyan-glow/40 focus:border-cyan-glow rounded-xl pl-4 pr-12 py-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none shadow-inner transition-all"
          autoFocus
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cyan-glow text-ocean-950 hover:bg-cyan-300 font-bold transition-all shadow-md shadow-cyan-glow/20"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </form>

      {/* Execution Feedback Message */}
      {feedback && (
        <div
          className={`mt-3 p-3 rounded-lg border text-xs font-mono flex items-start gap-2 animate-in fade-in duration-150 ${
            feedback.success
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
          }`}
        >
          {feedback.success ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Quick Suggestions Chips */}
      <div className="mt-4">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
          <Terminal className="w-3 h-3 text-cyan-glow" />
          SUPPORTED COMMANDS
        </span>
        <div className="flex flex-wrap gap-1.5">
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputQuery(q);
                handleSubmit(q);
              }}
              className="px-2.5 py-1 rounded-lg bg-ocean-900/80 hover:bg-cyan-glow/15 border border-navy-border hover:border-cyan-glow/40 text-[11px] font-mono text-slate-300 hover:text-cyan-glow transition-all"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
