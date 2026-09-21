import React, { useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2,
  Sparkles,
  Zap,
  Music2
} from 'lucide-react';
import { AspectRatio, MediaItem, ReelSettings, ScriptLine } from '../types';
import { globalCanvasRenderer } from '../utils/canvasRenderer';
import { globalBeatEngine } from '../utils/audioEngine';

interface PlayerViewProps {
  mediaItems: MediaItem[];
  settings: ReelSettings;
  scriptLines: ScriptLine[];
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  activePresetName?: string;
  isAiProcessing?: boolean;
}

export const PlayerView: React.FC<PlayerViewProps> = ({
  mediaItems,
  settings,
  scriptLines,
  currentTime,
  totalDuration,
  isPlaying,
  onPlayPause,
  onSeek,
  onVolumeChange,
  activePresetName = 'Velocity Phonk Drop',
  isAiProcessing = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Preload images and video cache
  useEffect(() => {
    globalCanvasRenderer.preloadMedia(mediaItems);
  }, [mediaItems]);

  // Request Animation Frame loop for silky smooth 60fps rendering
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const bassEnergy = globalBeatEngine.getBassEnergy();
          const waveformData = globalBeatEngine.getWaveformData();

          globalCanvasRenderer.renderFrame(
            ctx,
            canvas.width,
            canvas.height,
            currentTime,
            mediaItems,
            settings,
            scriptLines,
            bassEnergy,
            waveformData,
            isPlaying
          );
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentTime, mediaItems, settings, scriptLines, isPlaying]);

  // Format timestamp helper
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m}:${String(s).padStart(2, '0')}.${ms}`;
  };

  // Determine stage dimensions based on aspect ratio
  const getCanvasDimensions = (aspectRatio: AspectRatio) => {
    switch (aspectRatio) {
      case '9:16':
        return { width: 720, height: 1280, containerClass: 'aspect-[9/16] max-h-[68vh]' };
      case '1:1':
        return { width: 1080, height: 1080, containerClass: 'aspect-[1/1] max-h-[64vh]' };
      case '16:9':
        return { width: 1280, height: 720, containerClass: 'aspect-[16/9] max-h-[58vh]' };
      default:
        return { width: 720, height: 1280, containerClass: 'aspect-[9/16] max-h-[68vh]' };
    }
  };

  const { width, height, containerClass } = getCanvasDimensions(settings.aspectRatio);

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(settings.musicVolume || 0.8);
      globalBeatEngine.setVolume(settings.musicVolume || 0.8);
    } else {
      setIsMuted(true);
      onVolumeChange(0);
      globalBeatEngine.setVolume(0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-5 w-full h-full relative">
      {/* Top stage pill: Current Beat & Preset badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-md">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-white">{activePresetName}</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-300 font-mono text-[11px]">{settings.bpm} BPM</span>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
          <Music2 className="w-3 h-3 text-indigo-400" />
          <span className="truncate max-w-[120px]">{settings.musicTrackId.replace('track-', '').replace('-', ' ')}</span>
        </div>
      </div>

      {/* Reel Canvas Stage */}
      <div
        ref={containerRef}
        className={`relative ${containerClass} w-auto rounded-2xl overflow-hidden bg-black shadow-2xl shadow-indigo-950/30 border border-slate-800/80 group flex items-center justify-center`}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-full object-contain cursor-pointer select-none"
          onClick={onPlayPause}
        />

        {/* Loading / AI Processing Overlay */}
        {isAiProcessing && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 animate-spin flex items-center justify-center" />
              <Sparkles className="w-6 h-6 text-white absolute inset-0 m-auto" />
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-bold text-white">AI Auto-Cut in Progress</p>
              <p className="text-xs text-slate-400 mt-1">Analyzing shot pacing, beat cuts, and viral captions...</p>
            </div>
          </div>
        )}

        {/* Center Hover Play/Pause Indicator Button */}
        {!isPlaying && !isAiProcessing && (
          <button
            onClick={onPlayPause}
            className="absolute inset-0 m-auto w-16 h-16 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-10"
            aria-label="Play Reel"
          >
            <Play className="w-7 h-7 fill-white translate-x-0.5 text-white" />
          </button>
        )}

        {/* Live HUD Floating Controls on bottom of player */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-3 sm:p-4 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={onPlayPause}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
            </button>

            <button
              onClick={() => onSeek(0)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              title="Restart from beginning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="text-xs font-mono text-slate-300 px-2 py-1 rounded bg-black/40 backdrop-blur-sm">
              <span className="text-amber-300 font-bold">{formatTime(currentTime)}</span> / {formatTime(totalDuration)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
