import React from 'react';
import { Loader2, X, Sparkles, Film, Music, ShieldCheck } from 'lucide-react';

interface ExportProgressModalProps {
  isOpen: boolean;
  progressPercent?: number;
  progress?: number;
  elapsedSeconds?: number;
  totalDuration?: number;
  stage?: 'analyzing' | 'rendering' | 'mixing' | 'encoding' | 'ready' | string;
  onCancel?: () => void;
}

export const ExportProgressModal: React.FC<ExportProgressModalProps> = ({
  isOpen,
  progressPercent,
  progress,
  elapsedSeconds,
  totalDuration = 10,
  stage,
  onCancel,
}) => {
  if (!isOpen) return null;

  const currentPercent = progressPercent ?? progress ?? 0;

  const getStepText = (pct: number) => {
    if (stage === 'analyzing') return 'Multiplexing 60fps visual clips & Ken Burns motion...';
    if (stage === 'rendering') return 'Applying color filters, film LUTs & overlay effects...';
    if (stage === 'mixing') return 'Synchronizing audio beats, transitions & smart captions...';
    if (stage === 'encoding') return 'Packaging high-bitrate WebM video container...';
    if (stage === 'ready') return 'Export complete! Opening player preview...';
    if (pct < 30) return 'Multiplexing 60fps visual clips & Ken Burns motion...';
    if (pct < 70) return 'Synchronizing audio beats, transitions & smart captions...';
    if (pct < 95) return 'Rendering color grades, film LUTs & overlay effects...';
    return 'Finalizing ultra-HD WebM container...';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-syne">Exporting Ultra HD Reel</h3>
              <p className="text-[11px] text-slate-400">Rendering frame-by-frame with beat sync</p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Cancel export"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big percentage counter */}
        <div className="text-center py-2">
          <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 font-syne">
            {Math.round(currentPercent)}%
          </div>
          <p className="text-xs text-slate-300 mt-1.5 font-medium">
            {getStepText(currentPercent)}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              style={{ width: `${Math.min(100, Math.max(2, currentPercent))}%` }}
              className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 rounded-full transition-all duration-200 shadow-md shadow-amber-400/20"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{(elapsedSeconds ?? (currentPercent / 100 * totalDuration)).toFixed(1)}s elapsed</span>
            <span>{totalDuration.toFixed(1)}s target</span>
          </div>
        </div>

        {/* Feature status badges */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <Film className="w-3 h-3 text-amber-400 shrink-0" />
            <span>60 FPS</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <Music className="w-3 h-3 text-rose-400 shrink-0" />
            <span>Beat-Locked</span>
          </div>
          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>No Quality Loss</span>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          Cancel Export
        </button>
      </div>
    </div>
  );
};
