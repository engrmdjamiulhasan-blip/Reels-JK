import React, { useState, useRef } from 'react';
import { 
  Wand2, 
  Film, 
  Music, 
  Sliders, 
  Sparkles, 
  Flame, 
  Copy, 
  Check, 
  Play, 
  Star,
  Layers,
  Type,
  Sun,
  Contrast,
  Gauge,
  Upload,
  Zap,
  Volume2,
  Smile,
  ShieldCheck,
  CheckCircle2,
  Scissors
} from 'lucide-react';
import { 
  AutoCutPreset, 
  CaptionStyleType, 
  ColorFilterType, 
  MediaItem, 
  MusicTrack, 
  OverlaySticker, 
  ReelSettings, 
  TransitionType 
} from '../types';
import { VoiceoverRecorder } from './VoiceoverRecorder';
import { globalBeatEngine } from '../utils/audioEngine';

interface InspectorPanelProps {
  activeTab: 'autocut' | 'clip' | 'music' | 'style';
  onTabChange: (tab: 'autocut' | 'clip' | 'music' | 'style') => void;
  presets: AutoCutPreset[];
  activePresetId: string;
  onApplyPreset: (preset: AutoCutPreset) => void;
  onRunAiAutoCut: (promptText: string) => void;
  isAiProcessing: boolean;
  aiReport: {
    title: string;
    summary: string;
    viralScore: number;
    vibe: string;
    hashtags: string[];
  } | null;
  selectedClip: MediaItem | null;
  onUpdateClip: (clipId: string, updates: Partial<MediaItem>) => void;
  musicTracks: MusicTrack[];
  settings: ReelSettings;
  onUpdateSettings: (updates: Partial<ReelSettings>) => void;
  onPreviewTrack: (trackId: string) => void;
  onGenerateSmartCaptions: () => void;
  generatedHooks: string[];
  onSnapClipsToBeats?: () => void;
  onCustomMusicUploaded?: (file: File) => void;
  onVoiceoverRecorded?: (url: string, blob: Blob) => void;
  onVoiceoverRemoved?: () => void;
  onAutoMatchMusic?: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  activeTab,
  onTabChange,
  presets,
  activePresetId,
  onApplyPreset,
  onRunAiAutoCut,
  isAiProcessing,
  aiReport,
  selectedClip,
  onUpdateClip,
  musicTracks,
  settings,
  onUpdateSettings,
  onPreviewTrack,
  onGenerateSmartCaptions,
  generatedHooks,
  onSnapClipsToBeats,
  onCustomMusicUploaded,
  onVoiceoverRecorded,
  onVoiceoverRemoved,
  onAutoMatchMusic,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedAttribution, setCopiedAttribution] = useState(false);
  const [musicCategory, setMusicCategory] = useState<'copyright_free' | 'all' | 'high_energy' | 'chill'>('copyright_free');
  const [tapTempoLabel, setTapTempoLabel] = useState<string | null>(null);
  const [isEnhancingClip, setIsEnhancingClip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const STICKER_PRESETS: { id: string; text: string; emoji?: string; animation: 'pulse' | 'bounce' | 'none' }[] = [
    { id: 'viral', text: 'VIRAL REEL', emoji: '🔥', animation: 'pulse' },
    { id: 'wait', text: 'WAIT FOR IT...', animation: 'pulse' },
    { id: 'pov', text: 'POV: BEST LIFE', emoji: '✨', animation: 'bounce' },
    { id: 'sound_on', text: 'SOUND ON', emoji: '🔊', animation: 'pulse' },
    { id: 'golden', text: 'GOLDEN HOUR', emoji: '🌅', animation: 'none' },
    { id: 'rec', text: 'REC', emoji: '🔴', animation: 'pulse' },
    { id: 'best_shot', text: 'TOP 10 BEST', emoji: '📸', animation: 'bounce' },
  ];

  const handleTapTempo = () => {
    const bpm = globalBeatEngine.recordTap();
    if (bpm) {
      onUpdateSettings({ bpm });
      setTapTempoLabel(`${bpm} BPM Tapped!`);
      setTimeout(() => setTapTempoLabel(null), 2000);
    } else {
      setTapTempoLabel('Keep tapping...');
    }
  };

  const handleAiAutoEnhanceSelectedClip = async () => {
    if (!selectedClip) return;
    setIsEnhancingClip(true);
    try {
      const res = await fetch('/api/ai/enhance-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedClip.name,
          tags: selectedClip.tags || ['aesthetic', 'reel'],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateClip(selectedClip.id, {
          filter: (data.recommendedFilter as ColorFilterType) || 'vibrant',
          brightness: data.brightness || 1.05,
          contrast: data.contrast || 1.15,
          saturation: data.saturation || 1.25,
          warmth: data.warmth || 0.08,
          caption: data.caption || selectedClip.caption,
        });
      } else {
        // Local fallback
        onUpdateClip(selectedClip.id, {
          filter: 'vibrant',
          brightness: 1.06,
          contrast: 1.14,
          saturation: 1.22,
          warmth: 0.06,
        });
      }
    } catch {
      onUpdateClip(selectedClip.id, {
        filter: 'vibrant',
        brightness: 1.06,
        contrast: 1.14,
        saturation: 1.22,
        warmth: 0.06,
      });
    } finally {
      setIsEnhancingClip(false);
    }
  };

  const transitions: { id: TransitionType; label: string; icon: string }[] = [
    { id: 'beat_shake', label: 'Beat Shake', icon: '💥' },
    { id: 'flash', label: 'White Flash', icon: '⚡' },
    { id: 'glitch', label: 'Cyber Glitch', icon: '👾' },
    { id: 'zoom_in', label: 'Zoom Snap', icon: '🔍' },
    { id: 'zoom_out', label: 'Zoom Out', icon: '🔭' },
    { id: 'fade', label: 'Smooth Dissolve', icon: '〰️' },
    { id: 'dip_to_black', label: 'Dip to Black', icon: '⬛' },
  ];

  const filters: { id: ColorFilterType; label: string; tone: string }[] = [
    { id: 'none', label: 'Natural', tone: 'bg-slate-700' },
    { id: 'vibrant', label: 'Vibrant Hype', tone: 'bg-gradient-to-r from-amber-400 to-rose-500' },
    { id: 'cyberpunk', label: 'Cyber Neon', tone: 'bg-gradient-to-r from-purple-500 to-cyan-400' },
    { id: 'cinematic_teal', label: 'Teal & Orange', tone: 'bg-gradient-to-r from-teal-500 to-amber-500' },
    { id: 'kodak_gold', label: 'Kodak Gold', tone: 'bg-gradient-to-r from-yellow-600 to-amber-400' },
    { id: 'vintage_warm', label: 'Warm 70s', tone: 'bg-gradient-to-r from-amber-700 to-orange-400' },
    { id: 'monochrome', label: 'Monochrome', tone: 'bg-slate-400' },
  ];

  const captionStyles: { id: CaptionStyleType; label: string; desc: string }[] = [
    { id: 'yellow_highlight', label: 'CapCut Viral Yellow', desc: 'Bouncing yellow box on keywords' },
    { id: 'karaoke_neon', label: 'Neon Glow Pulse', desc: 'Glowing electric cyan drop shadow' },
    { id: 'bold_impact', label: 'Bold Impact', desc: 'High-contrast all-caps outline' },
    { id: 'minimal_clean', label: 'Clean Subtitle Pill', desc: 'Aesthetic frosted glass badge' },
  ];

  const handleCopyHashtags = () => {
    if (!aiReport) return;
    navigator.clipboard.writeText(aiReport.hashtags.join(' '));
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <aside className="w-full lg:w-96 border-l border-slate-800/80 bg-slate-950/95 flex flex-col h-full overflow-hidden">
      {/* Tab Navigation */}
      <div className="grid grid-cols-4 border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => onTabChange('autocut')}
          className={`py-3 flex flex-col items-center gap-1 transition-colors border-b-2 ${
            activeTab === 'autocut'
              ? 'border-amber-400 text-amber-400 bg-amber-400/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>Auto-Cut</span>
        </button>

        <button
          onClick={() => onTabChange('clip')}
          className={`py-3 flex flex-col items-center gap-1 transition-colors border-b-2 ${
            activeTab === 'clip'
              ? 'border-amber-400 text-amber-400 bg-amber-400/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Clips</span>
        </button>

        <button
          onClick={() => onTabChange('music')}
          className={`py-3 flex flex-col items-center gap-1 transition-colors border-b-2 ${
            activeTab === 'music'
              ? 'border-amber-400 text-amber-400 bg-amber-400/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Beats</span>
        </button>

        <button
          onClick={() => onTabChange('style')}
          className={`py-3 flex flex-col items-center gap-1 transition-colors border-b-2 ${
            activeTab === 'style'
              ? 'border-amber-400 text-amber-400 bg-amber-400/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Style</span>
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 1. AUTO-CUT TAB */}
        {activeTab === 'autocut' && (
          <div className="space-y-4">
            {/* Prompt input box */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Reel Concept Prompt</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">Gemini 3.8</span>
              </div>
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Turn my best pictures into a high-energy travel reel with intense beat drops and viral captions..."
                rows={3}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 resize-none"
              />

              {/* Quick Concept Chips */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[
                  { label: '🌴 Vacation Travel', text: 'High-energy summer travel reel with vibrant colors, quick beat drops, and wanderlust aesthetic' },
                  { label: '🏎️ Velocity Phonk', text: 'Ultra fast phonk drift velocity auto-cut with intense flash cuts and bass drop shakes' },
                  { label: '☕ Aesthetic Vlog', text: 'Soft golden hour lifestyle vlog with warm 70s tones, smooth dissolves, and chill lofi beats' },
                  { label: '🏋️ Gym Motivation', text: 'Hard-hitting workout motivation reel with aggressive zoom snaps and heavy beat cuts' },
                  { label: '💎 Luxury Minimal', text: 'Clean cinematic luxury reel with teal & orange grading, crisp timing, and elegant typography' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPromptInput(chip.text)}
                    className="text-[10px] font-medium px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onRunAiAutoCut(promptInput)}
                disabled={isAiProcessing}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-rose-400 hover:opacity-95 shadow-md shadow-amber-400/10 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Wand2 className={`w-4 h-4 ${isAiProcessing ? 'animate-spin' : ''}`} />
                <span>{isAiProcessing ? 'Analyzing & Cutting...' : 'Auto-Cut Best Reel'}</span>
              </button>
            </div>

            {/* Auto-Cut Presets */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Viral Auto-Cut Templates
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {presets.map((preset) => {
                  const isSelected = preset.id === activePresetId;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => onApplyPreset(preset)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 shadow-md shadow-amber-400/5'
                          : 'border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{preset.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {preset.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-slate-400">
                        <span>⚡ {preset.targetBpm} BPM</span>
                        <span>•</span>
                        <span>{preset.shotPacing.replace('_', ' ')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Report Card */}
            {aiReport && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Flame className="w-4 h-4" />
                    <span>Viral Prediction: {aiReport.viralScore}%</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                    {aiReport.vibe}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white font-syne">{aiReport.title}</h4>
                <p className="text-xs text-slate-300">{aiReport.summary}</p>

                {/* Hashtags */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-amber-300 truncate max-w-[220px]">
                    {aiReport.hashtags.join(' ')}
                  </div>
                  <button
                    onClick={handleCopyHashtags}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Copy hashtags"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Smart Viral Hooks Section */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Viral Reel Hooks</span>
                <button
                  onClick={onGenerateSmartCaptions}
                  className="text-[10px] font-semibold text-amber-400 hover:text-amber-300"
                >
                  Generate More
                </button>
              </div>
              <div className="space-y-1.5">
                {generatedHooks.map((hook, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (selectedClip) {
                        onUpdateClip(selectedClip.id, { caption: hook });
                      }
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/60 text-xs text-slate-300 transition-colors truncate"
                  >
                    "{hook}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. CLIP EDITOR TAB */}
        {activeTab === 'clip' && (
          <div className="space-y-4">
            {selectedClip ? (
              <>
                {/* Clip Preview Box */}
                <div className="relative h-32 rounded-xl overflow-hidden border border-slate-800">
                  <img
                    src={selectedClip.url}
                    alt={selectedClip.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[170px]">
                      {selectedClip.name}
                    </span>
                    <button
                      onClick={() => onUpdateClip(selectedClip.id, { isBestShot: !selectedClip.isBestShot })}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors ${
                        selectedClip.isBestShot
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-black/60 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${selectedClip.isBestShot ? 'fill-slate-950' : ''}`} />
                      <span>{selectedClip.isBestShot ? 'Best Shot' : 'Mark Best'}</span>
                    </button>
                  </div>
                </div>

                {/* 1-Click AI Auto-Enhance Button */}
                <button
                  type="button"
                  onClick={handleAiAutoEnhanceSelectedClip}
                  disabled={isEnhancingClip}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-amber-300 bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-indigo-500/15 hover:from-amber-500/25 hover:to-indigo-500/25 border border-amber-500/30 flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isEnhancingClip ? 'animate-spin' : ''}`} />
                  <span>{isEnhancingClip ? 'AI Color Grading...' : '1-Click AI Auto-Enhance Photo'}</span>
                </button>

                {/* Clip Trim Range Slider (Start & End Time) */}
                {(() => {
                  const clipMaxDuration = Math.max(
                    selectedClip.maxDuration || 8.0,
                    Math.max(8.0, Math.ceil(((selectedClip.trimEnd ?? selectedClip.duration) || 0) + 2))
                  );
                  const rawTrimStart = typeof selectedClip.trimStart === 'number' && Number.isFinite(selectedClip.trimStart)
                    ? selectedClip.trimStart
                    : 0;
                  const rawTrimEnd = typeof selectedClip.trimEnd === 'number' && Number.isFinite(selectedClip.trimEnd)
                    ? selectedClip.trimEnd
                    : parseFloat(Math.min(clipMaxDuration, Math.max(0.2, selectedClip.duration || 1.5)).toFixed(1));

                  const trimStart = Math.max(0, Math.min(clipMaxDuration - 0.2, rawTrimStart));
                  const trimEnd = Math.max(trimStart + 0.2, Math.min(clipMaxDuration, rawTrimEnd));
                  const activeDuration = Math.max(0.2, parseFloat((trimEnd - trimStart).toFixed(1)));

                  const maxTrimStartSlider = Math.max(0, parseFloat((trimEnd - 0.2).toFixed(1)));
                  const minTrimEndSlider = parseFloat((trimStart + 0.2).toFixed(1));

                  return (
                    <div className="space-y-4">
                      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
                        {/* Trim Header */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <Scissors className="w-3.5 h-3.5 text-amber-400" />
                            <span>Clip Trim Range (In / Out)</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-mono">Duration:</span>
                            <span className="font-mono text-xs font-bold bg-amber-400/15 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                              {selectedClip.duration.toFixed(1)}s
                            </span>
                          </div>
                        </div>

                        {/* Visual Filmstrip Trim Range Track */}
                        <div className="space-y-1">
                          <div className="relative h-7 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden select-none">
                            {/* Filmstrip hash marks */}
                            <div className="absolute inset-0 flex justify-between px-2 opacity-15 pointer-events-none">
                              {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="h-full w-[1px] bg-slate-400" />
                              ))}
                            </div>

                            {/* Trimmed Head (Cut Start) */}
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-slate-950/85 border-r border-amber-400/50 z-10 flex items-center justify-end pr-1"
                              style={{ width: `${Math.max(0, Math.min(100, (trimStart / clipMaxDuration) * 100))}%` }}
                            >
                              {trimStart >= 0.5 && (
                                <span className="text-[9px] font-mono text-slate-500">cut</span>
                              )}
                            </div>

                            {/* Active Trimmed In-Zone */}
                            <div
                              className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border-t border-b border-amber-400/70 z-0 flex items-center justify-between px-1"
                              style={{
                                left: `${Math.max(0, Math.min(100, (trimStart / clipMaxDuration) * 100))}%`,
                                width: `${Math.max(2, Math.min(100, ((trimEnd - trimStart) / clipMaxDuration) * 100))}%`,
                              }}
                            >
                              <div className="w-1.5 h-3.5 rounded-sm bg-amber-400 shadow-sm shadow-amber-400/50" />
                              <span className="text-[10px] font-mono font-bold text-amber-300 drop-shadow">
                                {activeDuration.toFixed(1)}s
                              </span>
                              <div className="w-1.5 h-3.5 rounded-sm bg-rose-400 shadow-sm shadow-rose-400/50" />
                            </div>

                            {/* Trimmed Tail (Cut End) */}
                            <div
                              className="absolute right-0 top-0 bottom-0 bg-slate-950/85 border-l border-rose-400/50 z-10 flex items-center justify-start pl-1"
                              style={{ width: `${Math.max(0, Math.min(100, 100 - (trimEnd / clipMaxDuration) * 100))}%` }}
                            >
                              {clipMaxDuration - trimEnd >= 0.5 && (
                                <span className="text-[9px] font-mono text-slate-500">cut</span>
                              )}
                            </div>
                          </div>

                          {/* Visual Range Ruler Ticks */}
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>0.0s</span>
                            <span className="text-amber-300/90 font-medium">
                              In: {trimStart.toFixed(1)}s — Out: {trimEnd.toFixed(1)}s
                            </span>
                            <span>{clipMaxDuration.toFixed(1)}s max</span>
                          </div>
                        </div>

                        {/* Trim In Slider (Start Time) */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                              <span>Trim Start Time</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={trimStart <= 0}
                                onClick={() => {
                                  const newStart = Math.max(0, parseFloat((trimStart - 0.1).toFixed(1)));
                                  const newDur = Math.max(0.2, parseFloat((trimEnd - newStart).toFixed(1)));
                                  onUpdateClip(selectedClip.id, { trimStart: newStart, trimEnd, duration: newDur });
                                }}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              >
                                -0.1s
                              </button>
                              <span className="font-mono text-amber-300 font-bold min-w-[36px] text-right">
                                {trimStart.toFixed(1)}s
                              </span>
                              <button
                                type="button"
                                disabled={trimStart >= maxTrimStartSlider}
                                onClick={() => {
                                  const newStart = Math.min(maxTrimStartSlider, parseFloat((trimStart + 0.1).toFixed(1)));
                                  const newDur = Math.max(0.2, parseFloat((trimEnd - newStart).toFixed(1)));
                                  onUpdateClip(selectedClip.id, { trimStart: newStart, trimEnd, duration: newDur });
                                }}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              >
                                +0.1s
                              </button>
                            </div>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={maxTrimStartSlider}
                            step="0.1"
                            value={Math.min(trimStart, maxTrimStartSlider)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              const safeVal = Math.min(val, maxTrimStartSlider);
                              const newDur = Math.max(0.2, parseFloat((trimEnd - safeVal).toFixed(1)));
                              onUpdateClip(selectedClip.id, {
                                trimStart: safeVal,
                                trimEnd,
                                duration: newDur,
                              });
                            }}
                            className="w-full accent-amber-400 cursor-pointer"
                          />
                        </div>

                        {/* Trim Out Slider (End Time) */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                              <span>Trim End Time</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={trimEnd <= minTrimEndSlider}
                                onClick={() => {
                                  const newEnd = Math.max(minTrimEndSlider, parseFloat((trimEnd - 0.1).toFixed(1)));
                                  const newDur = Math.max(0.2, parseFloat((newEnd - trimStart).toFixed(1)));
                                  onUpdateClip(selectedClip.id, { trimStart, trimEnd: newEnd, duration: newDur });
                                }}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              >
                                -0.1s
                              </button>
                              <span className="font-mono text-rose-300 font-bold min-w-[36px] text-right">
                                {trimEnd.toFixed(1)}s
                              </span>
                              <button
                                type="button"
                                disabled={trimEnd >= clipMaxDuration}
                                onClick={() => {
                                  const newEnd = Math.min(clipMaxDuration, parseFloat((trimEnd + 0.1).toFixed(1)));
                                  const newDur = Math.max(0.2, parseFloat((newEnd - trimStart).toFixed(1)));
                                  onUpdateClip(selectedClip.id, { trimStart, trimEnd: newEnd, duration: newDur });
                                }}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              >
                                +0.1s
                              </button>
                            </div>
                          </div>
                          <input
                            type="range"
                            min={minTrimEndSlider}
                            max={clipMaxDuration}
                            step="0.1"
                            value={Math.max(minTrimEndSlider, Math.min(clipMaxDuration, trimEnd))}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              const safeVal = Math.max(minTrimEndSlider, Math.min(clipMaxDuration, val));
                              const newDur = Math.max(0.2, parseFloat((safeVal - trimStart).toFixed(1)));
                              onUpdateClip(selectedClip.id, {
                                trimStart,
                                trimEnd: safeVal,
                                duration: newDur,
                              });
                            }}
                            className="w-full accent-rose-400 cursor-pointer"
                          />
                        </div>

                        {/* Quick Trim Preset Chips */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5 items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">Quick Trims:</span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const dur = Math.min(clipMaxDuration, 1.0);
                                onUpdateClip(selectedClip.id, { trimStart: 0, trimEnd: dur, duration: dur });
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                            >
                              1.0s Rapid
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const dur = Math.min(clipMaxDuration, 1.8);
                                onUpdateClip(selectedClip.id, { trimStart: 0, trimEnd: dur, duration: dur });
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                            >
                              1.8s Hook
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const dur = Math.min(clipMaxDuration, 3.0);
                                onUpdateClip(selectedClip.id, { trimStart: 0, trimEnd: dur, duration: dur });
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                            >
                              3.0s Flow
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateClip(selectedClip.id, {
                                  trimStart: 0,
                                  trimEnd: clipMaxDuration,
                                  duration: clipMaxDuration,
                                });
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors cursor-pointer"
                              title="Reset to full source duration"
                            >
                              Full
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Direct Duration Slider (Linked) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Total Cut Duration</span>
                          <span className="font-mono text-amber-300 font-bold">{selectedClip.duration.toFixed(1)}s</span>
                        </div>
                        <input
                          type="range"
                          min="0.3"
                          max={clipMaxDuration}
                          step="0.1"
                          value={Math.min(clipMaxDuration, Math.max(0.3, selectedClip.duration))}
                          onChange={(e) => {
                            const newDur = parseFloat(e.target.value);
                            const currentStart = typeof selectedClip.trimStart === 'number' && Number.isFinite(selectedClip.trimStart)
                              ? selectedClip.trimStart
                              : 0;
                            const safeStart = Math.max(0, Math.min(parseFloat((clipMaxDuration - newDur).toFixed(1)), currentStart));
                            onUpdateClip(selectedClip.id, {
                              duration: newDur,
                              trimStart: safeStart,
                              trimEnd: parseFloat((safeStart + newDur).toFixed(1)),
                            });
                          }}
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                          <span>0.3s (Rapid)</span>
                          <span>1.5s (Balanced)</span>
                          <span>{clipMaxDuration.toFixed(1)}s (Max)</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Speed Ramping */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Speed Ramping</span>
                    </span>
                    <span className="font-mono text-amber-400 text-[11px] font-bold">
                      {selectedClip.speed || 1.0}x
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[0.5, 1.0, 1.5, 2.0].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => onUpdateClip(selectedClip.id, { speed: spd })}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          (selectedClip.speed || 1.0) === spd
                            ? 'border-amber-400 bg-amber-400/15 text-amber-300'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photo & Video Tuning Sliders */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-3">
                  <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Image Color Tuning</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateClip(selectedClip.id, {
                          brightness: 1.0,
                          contrast: 1.0,
                          saturation: 1.0,
                          warmth: 0.0,
                        })
                      }
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Brightness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-300" />
                        <span>Brightness</span>
                      </span>
                      <span className="font-mono text-slate-200 font-bold">
                        {Math.round((selectedClip.brightness ?? 1.0) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.4"
                      step="0.05"
                      value={selectedClip.brightness ?? 1.0}
                      onChange={(e) => onUpdateClip(selectedClip.id, { brightness: parseFloat(e.target.value) })}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Contrast className="w-3 h-3 text-cyan-300" />
                        <span>Contrast</span>
                      </span>
                      <span className="font-mono text-slate-200 font-bold">
                        {Math.round((selectedClip.contrast ?? 1.0) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.5"
                      step="0.05"
                      value={selectedClip.contrast ?? 1.0}
                      onChange={(e) => onUpdateClip(selectedClip.id, { contrast: parseFloat(e.target.value) })}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Saturation / Vibrance</span>
                      <span className="font-mono text-slate-200 font-bold">
                        {Math.round((selectedClip.saturation ?? 1.0) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.8"
                      step="0.05"
                      value={selectedClip.saturation ?? 1.0}
                      onChange={(e) => onUpdateClip(selectedClip.id, { saturation: parseFloat(e.target.value) })}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* Warmth */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Warmth / Color Temp</span>
                      <span className="font-mono text-slate-200 font-bold">
                        {(selectedClip.warmth ?? 0.0) > 0 ? `+${Math.round((selectedClip.warmth ?? 0) * 100)}` : Math.round((selectedClip.warmth ?? 0) * 100)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-0.3"
                      max="0.3"
                      step="0.02"
                      value={selectedClip.warmth ?? 0.0}
                      onChange={(e) => onUpdateClip(selectedClip.id, { warmth: parseFloat(e.target.value) })}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Transition Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Transition</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {transitions.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onUpdateClip(selectedClip.id, { transition: t.id })}
                        className={`p-2 rounded-lg text-xs font-medium text-left flex items-center gap-1.5 border transition-all ${
                          selectedClip.transition === t.id
                            ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                            : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Grade / Filter LUT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Color Grade Filter</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {filters.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => onUpdateClip(selectedClip.id, { filter: f.id })}
                        className={`p-2 rounded-lg text-xs font-medium text-left flex items-center gap-2 border transition-all ${
                          selectedClip.filter === f.id
                            ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                            : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${f.tone}`} />
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Caption on this shot */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Shot Caption Overlay</label>
                  <input
                    type="text"
                    value={selectedClip.caption || ''}
                    onChange={(e) => onUpdateClip(selectedClip.id, { caption: e.target.value })}
                    placeholder="Enter subtitle for this clip..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                <Film className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Select any clip from the timeline to edit transitions, durations, and color filters.</p>
              </div>
            )}
          </div>
        )}

        {/* 3. MUSIC & BEATS TAB */}
        {activeTab === 'music' && (
          <div className="space-y-4">
            {/* Auto-Match Best Copyright-Free Music Button */}
            {onAutoMatchMusic && (
              <button
                type="button"
                onClick={onAutoMatchMusic}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-rose-400 to-amber-300 hover:opacity-95 shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
                <span>Auto-Match Best Copyright-Free Music (AI)</span>
              </button>
            )}

            {/* 100% Copyright-Free & Monetization Safe Banner */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300">100% Copyright-Free & Monetization Safe</h4>
                    <p className="text-[10px] text-slate-400">Zero strikes • Safe for Instagram, TikTok, YouTube Shorts, & FB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const current = musicTracks.find(t => t.id === settings.musicTrackId);
                    const text = current?.attributionText || 'Music: 100% Copyright-Free Commercial License (AutoCut Audio Library). Safe for Instagram Reels, TikTok, YouTube Shorts monetization.';
                    navigator.clipboard.writeText(text);
                    setCopiedAttribution(true);
                    setTimeout(() => setCopiedAttribution(false), 2000);
                  }}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 cursor-pointer"
                >
                  {copiedAttribution ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy License</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1 pt-1 text-[9px] text-emerald-200">
                <span className="bg-slate-900/90 px-1.5 py-0.5 rounded border border-emerald-500/20">✓ Reels</span>
                <span className="bg-slate-900/90 px-1.5 py-0.5 rounded border border-emerald-500/20">✓ TikTok Commercial</span>
                <span className="bg-slate-900/90 px-1.5 py-0.5 rounded border border-emerald-500/20">✓ YouTube Shorts</span>
                <span className="bg-slate-900/90 px-1.5 py-0.5 rounded border border-emerald-500/20">✓ Facebook</span>
              </div>
            </div>

            {/* Custom Music Upload & Tap Tempo */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-amber-400" />
                  <span>Custom Sound & Tap Beat</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="file"
                  accept="audio/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && onCustomMusicUploaded) {
                      onCustomMusicUploaded(f);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-2.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload Audio</span>
                </button>

                <button
                  type="button"
                  onClick={handleTapTempo}
                  className="py-2 px-2.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{tapTempoLabel || 'Tap Beat (BPM)'}</span>
                </button>
              </div>

              {/* Snap Clips to Beats Button */}
              {onSnapClipsToBeats && (
                <button
                  type="button"
                  onClick={onSnapClipsToBeats}
                  className="w-full py-2 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>Snap All Clip Durations to Beats</span>
                </button>
              )}
            </div>

            {/* Voiceover Recorder Section */}
            {onVoiceoverRecorded && onVoiceoverRemoved && (
              <VoiceoverRecorder
                voiceoverUrl={settings.voiceoverUrl}
                voiceoverVolume={settings.voiceoverVolume}
                onVoiceoverRecorded={onVoiceoverRecorded}
                onVoiceoverRemoved={onVoiceoverRemoved}
                onVolumeChange={(vol) => onUpdateSettings({ voiceoverVolume: vol })}
              />
            )}

            {/* Transition Sound FX */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Transition Sound Effects</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.enableSfx ?? true}
                  onChange={(e) => onUpdateSettings({ enableSfx: e.target.checked })}
                  className="accent-amber-400 w-4 h-4 cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Plays synchronized whooshes, flash hits, and glitch risers on transitions.
              </p>
              {(settings.enableSfx ?? true) && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>SFX Volume</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {Math.round((settings.sfxVolume ?? 0.7) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.sfxVolume ?? 0.7}
                    onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Soundtrack Filter Pills */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Copyright-Free Soundtracks
                </h3>
                <span className="text-[10px] font-mono text-emerald-400">
                  {musicTracks.filter(t => t.copyrightFree !== false).length} Clear Tracks
                </span>
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                <button
                  type="button"
                  onClick={() => setMusicCategory('copyright_free')}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    musicCategory === 'copyright_free'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-300'
                  }`}
                >
                  🛡️ 100% No-Copyright
                </button>
                <button
                  type="button"
                  onClick={() => setMusicCategory('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    musicCategory === 'all'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-300'
                  }`}
                >
                  All ({musicTracks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMusicCategory('high_energy')}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    musicCategory === 'high_energy'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-300'
                  }`}
                >
                  🔥 High Energy
                </button>
                <button
                  type="button"
                  onClick={() => setMusicCategory('chill')}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    musicCategory === 'chill'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-300'
                  }`}
                >
                  ☕ Chill / Lo-Fi
                </button>
              </div>
            </div>

            {/* Track List */}
            <div className="space-y-2">
              {musicTracks
                .filter((track) => {
                  if (musicCategory === 'copyright_free') return track.copyrightFree !== false;
                  if (musicCategory === 'high_energy') return track.energy === 'high' || track.energy === 'explosive';
                  if (musicCategory === 'chill') return track.energy === 'chill' || track.energy === 'medium';
                  return true;
                })
                .map((track) => {
                  const isSelected = track.id === settings.musicTrackId && !settings.customMusicUrl;
                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        onUpdateSettings({ musicTrackId: track.id, bpm: track.bpm, customMusicUrl: undefined });
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10'
                          : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white">{track.title}</h4>
                          {track.copyrightFree !== false && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-semibold border border-emerald-500/30">
                              🛡️ No Copyright
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{track.artist} • {track.genre}</p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-amber-300">
                          <span>{track.bpm} BPM</span>
                          <span>•</span>
                          <span className="uppercase">{track.energy} ENERGY</span>
                          {track.licenseType && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400">{track.licenseType.split(' ')[0]}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewTrack(track.id);
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-amber-400 transition-colors cursor-pointer ml-2 flex-shrink-0"
                        title="Preview Track"
                      >
                        <Play className="w-3.5 h-3.5 fill-amber-400" />
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* BPM Master Tempo Slider */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-bold">Master Tempo (BPM)</span>
                <span className="font-mono text-amber-400 font-bold">{settings.bpm} BPM</span>
              </div>
              <input
                type="range"
                min="80"
                max="160"
                step="1"
                value={settings.bpm}
                onChange={(e) => onUpdateSettings({ bpm: parseInt(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>80 (Lofi)</span>
                <span>128 (House/EDM)</span>
                <span>160 (Speed Up)</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. STYLE & OVERLAYS TAB */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Animated Viral Sticker Overlay */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-amber-400" />
                  <span>Viral Animated Stickers</span>
                </h3>
                {settings.activeSticker && (
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ activeSticker: undefined })}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {STICKER_PRESETS.map((stk) => {
                  const isActive = settings.activeSticker?.text === stk.text;
                  return (
                    <button
                      key={stk.id}
                      type="button"
                      onClick={() =>
                        onUpdateSettings({
                          activeSticker: {
                            id: stk.id,
                            text: stk.text,
                            emoji: stk.emoji,
                            position: settings.activeSticker?.position || 'top',
                            animation: stk.animation,
                          },
                        })
                      }
                      className={`p-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all text-left ${
                        isActive
                          ? 'border-amber-400 bg-amber-400/15 text-amber-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{stk.emoji || '✨'}</span>
                      <span className="truncate">{stk.text}</span>
                    </button>
                  );
                })}
              </div>

              {settings.activeSticker && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Sticker Position:</span>
                    <div className="flex gap-1">
                      {(['top', 'center', 'bottom'] as const).map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() =>
                            onUpdateSettings({
                              activeSticker: {
                                ...settings.activeSticker!,
                                position: pos,
                              },
                            })
                          }
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            settings.activeSticker?.position === pos
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Caption Typography Style */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-amber-400" />
                <span>Animated Captions Style</span>
              </h3>
              <div className="space-y-2">
                {captionStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => onUpdateSettings({ captionStyle: style.id })}
                    className={`w-full p-2.5 rounded-xl text-left border transition-all ${
                      settings.captionStyle === style.id
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{style.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Overlays & FX Switches */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                <span>Cinematic Overlays & FX</span>
              </h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer text-xs">
                  <span className="text-slate-200">Retro VHS Cam (REC [●] / Timecode)</span>
                  <input
                    type="checkbox"
                    checked={settings.overlayVhs}
                    onChange={(e) => onUpdateSettings({ overlayVhs: e.target.checked })}
                    className="accent-amber-400 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer text-xs">
                  <span className="text-slate-200">Sound Waveform Equalizer</span>
                  <input
                    type="checkbox"
                    checked={settings.overlayAudioWave}
                    onChange={(e) => onUpdateSettings({ overlayAudioWave: e.target.checked })}
                    className="accent-amber-400 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer text-xs">
                  <span className="text-slate-200">Warm Film Light Leak</span>
                  <input
                    type="checkbox"
                    checked={settings.overlayLightLeak}
                    onChange={(e) => onUpdateSettings({ overlayLightLeak: e.target.checked })}
                    className="accent-amber-400 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer text-xs">
                  <span className="text-slate-200">Cinematic Vignette Edge</span>
                  <input
                    type="checkbox"
                    checked={settings.overlayVignette}
                    onChange={(e) => onUpdateSettings({ overlayVignette: e.target.checked })}
                    className="accent-amber-400 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer text-xs">
                  <span className="text-slate-200">Millisecond Timecode</span>
                  <input
                    type="checkbox"
                    checked={settings.overlayTimecode}
                    onChange={(e) => onUpdateSettings({ overlayTimecode: e.target.checked })}
                    className="accent-amber-400 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
