import React from 'react';
import { 
  Sparkles, 
  Download, 
  Camera, 
  Smartphone, 
  Square, 
  Tv, 
  Wand2, 
  Flame
} from 'lucide-react';
import { AspectRatio } from '../types';

interface HeaderProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onAutoCutClick: () => void;
  onExportClick: () => void;
  onCaptureFrameClick: () => void;
  isAiProcessing: boolean;
  isExporting: boolean;
  viralScore?: number;
}

export const Header: React.FC<HeaderProps> = ({
  aspectRatio,
  onAspectRatioChange,
  onAutoCutClick,
  onExportClick,
  onCaptureFrameClick,
  isAiProcessing,
  isExporting,
  viralScore = 94,
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-[1px] flex items-center justify-center shadow-lg shadow-rose-950/40">
          <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-syne">
              AutoCut <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400">Reels</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
              <Flame className="w-3 h-3 text-rose-400" /> Best Reels AI
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Beat-synced auto-cut video & picture maker
          </p>
        </div>
      </div>

      {/* Aspect Ratio Switcher */}
      <div className="hidden md:flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl gap-1">
        <button
          onClick={() => onAspectRatioChange('9:16')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            aspectRatio === '9:16'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="9:16 - Reels, TikTok & Shorts"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>9:16 Reels</span>
        </button>

        <button
          onClick={() => onAspectRatioChange('1:1')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            aspectRatio === '1:1'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="1:1 - Instagram Feed Square"
        >
          <Square className="w-3.5 h-3.5" />
          <span>1:1 Post</span>
        </button>

        <button
          onClick={() => onAspectRatioChange('16:9')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            aspectRatio === '16:9'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
          title="16:9 - YouTube Landscape"
        >
          <Tv className="w-3.5 h-3.5" />
          <span>16:9 Cinema</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Viral Score Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Viral Index: {viralScore}%</span>
        </div>

        {/* Best Picture Snapshot Button */}
        <button
          onClick={onCaptureFrameClick}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          title="Save high-res thumbnail / best picture"
        >
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Best Picture</span>
        </button>

        {/* AI Auto-Cut Button */}
        <button
          onClick={onAutoCutClick}
          disabled={isAiProcessing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 shadow-lg shadow-rose-950/50 active:scale-95 transition-all disabled:opacity-50"
        >
          <Wand2 className={`w-3.5 h-3.5 ${isAiProcessing ? 'animate-spin' : ''}`} />
          <span>{isAiProcessing ? 'Auto-Cutting...' : 'Auto-Cut Magic'}</span>
        </button>

        {/* Export Reel Button */}
        <button
          onClick={onExportClick}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-400/20 active:scale-95 transition-all disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5 text-slate-950" />
          <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export Reel'}</span>
        </button>
      </div>
    </header>
  );
};
