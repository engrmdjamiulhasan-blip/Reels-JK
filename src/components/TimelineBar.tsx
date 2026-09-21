import React, { useRef } from 'react';
import { 
  Play, 
  Pause, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Star, 
  Sparkles,
  Zap
} from 'lucide-react';
import { MediaItem, TransitionType } from '../types';

interface TimelineBarProps {
  mediaItems: MediaItem[];
  selectedClipId: string | null;
  onSelectClip: (id: string) => void;
  onReorderClip: (index: number, direction: 'left' | 'right') => void;
  onDeleteClip: (id: string) => void;
  onToggleBestShot: (id: string) => void;
  onAddFiles: (files: FileList) => void;
  onAddSampleClip: () => void;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  beats?: number[];
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  mediaItems,
  selectedClipId,
  onSelectClip,
  onReorderClip,
  onDeleteClip,
  onToggleBestShot,
  onAddFiles,
  onAddSampleClip,
  currentTime,
  totalDuration,
  isPlaying,
  onPlayPause,
  onSeek,
  beats = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timelineTrackRef = useRef<HTMLDivElement | null>(null);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineTrackRef.current || totalDuration <= 0) return;
    const rect = timelineTrackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(progress * totalDuration);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
      e.target.value = '';
    }
  };

  const getTransitionIcon = (t: TransitionType) => {
    switch (t) {
      case 'flash': return '⚡';
      case 'glitch': return '👾';
      case 'beat_shake': return '💥';
      case 'zoom_in': return '🔍';
      case 'zoom_out': return '🔭';
      default: return '〰️';
    }
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="border-t border-slate-800 bg-slate-950/95 backdrop-blur-md p-3 sm:p-4 flex flex-col gap-2.5 z-20">
      {/* Top row: Transport Controls, Beat Sync Indicator & Add Media */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onPlayPause}
            className="w-9 h-9 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20 active:scale-95 transition-all"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 translate-x-0.5" />}
          </button>

          <div className="text-xs font-mono text-slate-300">
            <span className="font-bold text-white">{currentTime.toFixed(1)}s</span>
            <span className="text-slate-600 mx-1.5">/</span>
            <span className="text-slate-400">{totalDuration.toFixed(1)}s Total</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-medium text-indigo-300">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Beat Sync Snapped</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all hover:border-slate-600"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Upload Media</span>
          </button>

          <button
            onClick={onAddSampleClip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Add curated 4K sample shot"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Add Sample</span>
          </button>
        </div>
      </div>

      {/* Scrub Bar with Beat Grid Ticks */}
      <div 
        ref={timelineTrackRef}
        onClick={handleTimelineClick}
        className="relative h-6 bg-slate-900/90 rounded-lg border border-slate-800/80 cursor-pointer overflow-hidden group select-none"
      >
        {/* Beat grid markers */}
        {beats.map((beatTime, idx) => {
          if (beatTime > totalDuration) return null;
          const leftPct = (beatTime / totalDuration) * 100;
          return (
            <div
              key={idx}
              style={{ left: `${leftPct}%` }}
              className="absolute top-0 bottom-0 w-[1px] bg-amber-400/25 pointer-events-none group-hover:bg-amber-400/40"
            />
          );
        })}

        {/* Progress Fill */}
        <div
          style={{ width: `${progressPercent}%` }}
          className="h-full bg-gradient-to-r from-amber-500/30 to-rose-500/40 pointer-events-none"
        />

        {/* Red Playhead line */}
        <div
          style={{ left: `${progressPercent}%` }}
          className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-md shadow-amber-400/50 pointer-events-none z-10 -translate-x-1/2"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 -translate-x-[3px] -translate-y-1 shadow-sm" />
        </div>
      </div>

      {/* Clips Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
        {mediaItems.map((item, index) => {
          const isSelected = item.id === selectedClipId;
          const widthWeight = Math.max(110, (item.duration / (totalDuration || 1)) * 400);

          return (
            <div
              key={item.id}
              style={{ minWidth: `${widthWeight}px` }}
              onClick={() => onSelectClip(item.id)}
              className={`relative h-20 rounded-xl overflow-hidden cursor-pointer transition-all border select-none group flex flex-col justify-between p-1.5 ${
                isSelected
                  ? 'border-amber-400 bg-slate-900 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/30'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              {/* Thumbnail background */}
              <img
                src={item.url}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-65 transition-opacity pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

              {/* Top badges: Clip Index + Best Shot star */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-slate-300 font-mono">
                  #{index + 1}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBestShot(item.id);
                  }}
                  className={`p-1 rounded-md transition-colors ${
                    item.isBestShot
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-black/50 text-slate-400 hover:text-amber-400'
                  }`}
                  title={item.isBestShot ? 'Best Picture Shot (Selected)' : 'Mark as Best Shot'}
                >
                  <Star className={`w-3 h-3 ${item.isBestShot ? 'fill-slate-950' : ''}`} />
                </button>
              </div>

              {/* Bottom details: Transition icon + Duration */}
              <div className="relative z-10 flex items-center justify-between text-[11px]">
                <span className="px-1.5 py-0.5 rounded bg-black/70 text-slate-200 font-mono flex items-center gap-1">
                  <span>{getTransitionIcon(item.transition)}</span>
                  <span>{item.duration.toFixed(1)}s</span>
                </span>

                {/* Clip quick reorder controls on hover */}
                <div className="hidden group-hover:flex items-center gap-0.5 bg-black/80 rounded-md p-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderClip(index, 'left');
                    }}
                    disabled={index === 0}
                    className="p-1 hover:text-white text-slate-400 disabled:opacity-20"
                    title="Move earlier"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderClip(index, 'right');
                    }}
                    disabled={index === mediaItems.length - 1}
                    className="p-1 hover:text-white text-slate-400 disabled:opacity-20"
                    title="Move later"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClip(item.id);
                    }}
                    className="p-1 hover:text-rose-400 text-slate-400"
                    title="Delete clip"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
