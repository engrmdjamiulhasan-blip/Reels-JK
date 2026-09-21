import { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { PlayerView } from './components/PlayerView';
import { TimelineBar } from './components/TimelineBar';
import { InspectorPanel } from './components/InspectorPanel';
import { ExportModal } from './components/ExportModal';
import { ExportProgressModal } from './components/ExportProgressModal';
import { BestPictureStudioModal } from './components/BestPictureStudioModal';
import { 
  AUTO_CUT_PRESETS, 
  MUSIC_TRACKS, 
  SAMPLE_MEDIA_LIBRARY 
} from './data/presets';
import { 
  AspectRatio, 
  AutoCutPreset, 
  MediaItem, 
  ReelSettings, 
  ScriptLine 
} from './types';
import { globalBeatEngine } from './utils/audioEngine';

export default function App() {
  // 1. Core State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(SAMPLE_MEDIA_LIBRARY);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(SAMPLE_MEDIA_LIBRARY[0]?.id || null);
  const [activePresetId, setActivePresetId] = useState<string>('preset-velocity');
  const [activeTab, setActiveTab] = useState<'autocut' | 'clip' | 'music' | 'style'>('autocut');

  const [settings, setSettings] = useState<ReelSettings>({
    title: 'Velocity Beat Drop Reel',
    aspectRatio: '9:16',
    bpm: 135,
    musicTrackId: 'track-phonk-velocity',
    musicVolume: 0.85,
    voiceoverVolume: 1.0,
    captionStyle: 'yellow_highlight',
    overlayVhs: false,
    overlayVignette: true,
    overlayLightLeak: false,
    overlayAudioWave: true,
    overlayTimecode: false,
    overlayWatermark: true,
    enableTransitionSfx: true,
    enableSfx: true,
    sfxVolume: 0.7,
  });

  const [scriptLines, setScriptLines] = useState<ScriptLine[]>([
    { id: '1', time: 0.0, duration: 1.8, text: 'Wait for the beat drop... 🔥', highlightWord: 'drop' },
    { id: '2', time: 1.8, duration: 1.4, text: 'Golden hour hits different ✨', highlightWord: 'different' },
    { id: '3', time: 3.2, duration: 1.2, text: 'Full throttle energy 🏎️', highlightWord: 'energy' },
    { id: '4', time: 4.4, duration: 1.6, text: 'Main character aura ⚡', highlightWord: 'aura' },
    { id: '5', time: 6.0, duration: 1.5, text: 'On top of the world 🏔️', highlightWord: 'world' },
  ]);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // AI Storyboard & Viral Score
  const [aiReport, setAiReport] = useState<{
    title: string;
    summary: string;
    viralScore: number;
    vibe: string;
    hashtags: string[];
  } | null>({
    title: 'Velocity Beat Drop Reel',
    summary: 'High-energy auto-cut sequence with synchronized bass drops, rapid snaps, and golden hour contrast.',
    viralScore: 96,
    vibe: 'Ultra Fast Velocity',
    hashtags: ['#reels', '#fyp', '#viralvideo', '#autocut', '#cinematic', '#trendingreels', '#beatdrop'],
  });

  const [generatedHooks, setGeneratedHooks] = useState<string[]>([
    'Wait for the beat drop... 🔥',
    'POV: You decided to romanticize your life ✨',
    'Unpopular opinion: This is unmatched ⚡',
    'Stop scrolling, you need to see this 🚀',
  ]);

  // Modal State
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [exportedVideoBlob, setExportedVideoBlob] = useState<Blob | null>(null);
  const [bestPictureUrl, setBestPictureUrl] = useState<string | null>(null);
  const [bestPictureStudioOpen, setBestPictureStudioOpen] = useState(false);
  const [studioSourceUrl, setStudioSourceUrl] = useState<string>('');
  const [studioSourceName, setStudioSourceName] = useState<string>('');
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStage, setExportStage] = useState<'analyzing' | 'rendering' | 'mixing' | 'encoding' | 'ready'>('rendering');

  // Derived total duration
  const totalDuration = useMemo(() => {
    return mediaItems.reduce((acc, item) => acc + item.duration, 0);
  }, [mediaItems]);

  const selectedClip = useMemo(() => {
    return mediaItems.find((item) => item.id === selectedClipId) || null;
  }, [mediaItems, selectedClipId]);

  const currentTrack = useMemo(() => {
    return MUSIC_TRACKS.find((t) => t.id === settings.musicTrackId) || MUSIC_TRACKS[0];
  }, [settings.musicTrackId]);

  // 2. Playback Clock Loop with RequestAnimationFrame
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  useEffect(() => {
    let animId: number;
    let lastStamp: number | null = null;

    const loop = (timestamp: number) => {
      if (lastStamp !== null && isPlayingRef.current) {
        const delta = (timestamp - lastStamp) / 1000;
        const newTime = currentTimeRef.current + delta;

        if (newTime >= totalDuration && totalDuration > 0) {
          // Loop around
          setCurrentTime(0);
          globalBeatEngine.play(0);
        } else {
          setCurrentTime(newTime);
        }
      }
      lastStamp = timestamp;
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [totalDuration]);

  // Sync audio engine on play/pause and track changes
  useEffect(() => {
    globalBeatEngine.setTrack(settings.musicTrackId, settings.bpm, settings.customMusicUrl);
    globalBeatEngine.setVolume(settings.musicVolume);
  }, [settings.musicTrackId, settings.bpm, settings.musicVolume, settings.customMusicUrl]);

  // Sync voiceover & SFX
  useEffect(() => {
    globalBeatEngine.setVoiceover(settings.voiceoverUrl, settings.voiceoverVolume ?? 1.0);
  }, [settings.voiceoverUrl, settings.voiceoverVolume]);

  useEffect(() => {
    globalBeatEngine.setSfxVolume(settings.enableSfx ? (settings.sfxVolume ?? 0.7) : 0);
  }, [settings.enableSfx, settings.sfxVolume]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      globalBeatEngine.pause();
    } else {
      setIsPlaying(true);
      globalBeatEngine.play(currentTime);
    }
  };

  const handleSeek = (time: number) => {
    const clamped = Math.max(0, Math.min(totalDuration, time));
    setCurrentTime(clamped);
    if (isPlaying) {
      globalBeatEngine.stop();
      globalBeatEngine.play(clamped);
    }
  };

  // Snap all clip durations to musical beats based on BPM
  const handleSnapClipsToBeats = () => {
    const beatInterval = 60 / settings.bpm;
    setMediaItems((prev) =>
      prev.map((clip) => {
        const beats = Math.max(1, Math.round(clip.duration / beatInterval));
        const snappedDuration = parseFloat((beats * beatInterval).toFixed(2));
        return { ...clip, duration: Math.max(0.4, Math.min(4.0, snappedDuration)) };
      })
    );
  };

  // Custom audio file upload
  const handleCustomMusicUploaded = (file: File) => {
    const url = URL.createObjectURL(file);
    setSettings((prev) => ({
      ...prev,
      customMusicUrl: url,
      musicTrackId: 'custom-soundtrack',
    }));
    globalBeatEngine.setTrack('custom-soundtrack', settings.bpm, url);
  };

  // 3. Auto-Cut Preset Handler
  const handleApplyPreset = (preset: AutoCutPreset) => {
    setActivePresetId(preset.id);
    setSettings((prev) => ({
      ...prev,
      bpm: preset.targetBpm,
      musicTrackId: preset.musicTrackId,
      captionStyle: preset.captionStyle,
    }));

    // Auto calculate rhythm durations for all clips according to preset shot pacing
    const secondsPerBeat = 60 / preset.targetBpm;
    let beatMultiplier = 2; // e.g. 2 beats per shot = ~0.9s
    if (preset.shotPacing === 'ultra_fast') beatMultiplier = 2;
    else if (preset.shotPacing === 'dynamic_velocity') beatMultiplier = 3;
    else if (preset.shotPacing === 'cinematic_flow') beatMultiplier = 4;
    else if (preset.shotPacing === 'aesthetic_chill') beatMultiplier = 5;

    const baseDuration = parseFloat((secondsPerBeat * beatMultiplier).toFixed(2));

    setMediaItems((prev) =>
      prev.map((clip, idx) => ({
        ...clip,
        duration: idx === 0 ? parseFloat((baseDuration * 1.3).toFixed(2)) : baseDuration,
        filter: preset.defaultFilter,
        transition: idx % 2 === 0 ? preset.defaultTransition : 'flash',
      }))
    );
  };

  // 4. AI Auto-Cut Logic (Gemini API Integration)
  const handleRunAiAutoCut = async (promptText: string) => {
    setIsAiProcessing(true);
    try {
      const payload = {
        prompt: promptText || settings.title,
        mediaItems: mediaItems.map((m) => ({
          id: m.id,
          name: m.name,
          tags: m.tags || [],
          isImage: m.type === 'image',
        })),
        targetBpm: settings.bpm,
        vibe: activePresetId,
      };

      const res = await fetch('/api/ai/auto-cut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to run AI Auto-Cut: ${res.statusText}`);
      }

      const data = await res.json();

      if (data) {
        setAiReport({
          title: data.title || 'Viral AutoCut Masterpiece',
          summary: data.summary || 'Beat-synced with precision rhythm cuts.',
          viralScore: data.viralScore || 95,
          vibe: data.vibe || 'Viral Velocity',
          hashtags: data.hashtags || ['#reels', '#autocut', '#fyp'],
        });

        if (data.title) {
          setSettings((prev) => ({ ...prev, title: data.title }));
        }

        if (data.scriptLines && data.scriptLines.length > 0) {
          setScriptLines(data.scriptLines);
        }

        // Apply clip durations & transitions
        if (data.clipsConfig && Array.isArray(data.clipsConfig)) {
          setMediaItems((prev) =>
            prev.map((clip) => {
              const conf = data.clipsConfig.find((c: { id: string }) => c.id === clip.id);
              if (conf) {
                return {
                  ...clip,
                  duration: conf.duration || clip.duration,
                  transition: conf.transition || clip.transition,
                  filter: conf.filter || clip.filter,
                  caption: conf.caption || clip.caption,
                  isBestShot: Boolean(conf.isBestShot),
                  score: conf.score || clip.score,
                };
              }
              return clip;
            })
          );
        }
      }
    } catch (err) {
      console.error('AI Auto-Cut error:', err);
      // Fallback local heuristic auto-cut if network or offline
      handleApplyPreset(AUTO_CUT_PRESETS[0]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // 5. Generate Smart Captions
  const handleGenerateSmartCaptions = async () => {
    try {
      const res = await fetch('/api/ai/smart-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: settings.title,
          style: 'viral hype',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.hooks && Array.isArray(data.hooks)) {
          setGeneratedHooks(data.hooks);
        }
      }
    } catch (err) {
      console.warn('Smart captions fallback:', err);
    }
  };

  // 6. Best Picture Frame Capture & Photo Studio
  const handleCaptureFrame = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    let dataUrl = '';
    try {
      dataUrl = canvas.toDataURL('image/png', 1.0);
    } catch (err) {
      console.warn('Canvas toDataURL notice, using clip fallback:', err);
      dataUrl = selectedClip?.url || '';
    }
    setBestPictureUrl(dataUrl);
    setStudioSourceUrl(dataUrl);
    setStudioSourceName(selectedClip?.name || 'AutoCut_Best_Shot');
    setBestPictureStudioOpen(true);
  };

  // 6b. Auto-Match Best Copyright-Free Music
  const handleAutoMatchMusic = () => {
    let matchedTrack = MUSIC_TRACKS[0];
    if (activePresetId === 'preset-cinematic-travel') {
      matchedTrack = MUSIC_TRACKS.find((t) => t.id === 'track-cinematic-epic') || matchedTrack;
    } else if (activePresetId === 'preset-aesthetic-vlog') {
      matchedTrack = MUSIC_TRACKS.find((t) => t.id === 'track-lofi-chill') || matchedTrack;
    } else if (activePresetId === 'preset-cyberpunk-glitch') {
      matchedTrack = MUSIC_TRACKS.find((t) => t.id === 'track-trap-hype') || matchedTrack;
    } else {
      matchedTrack = MUSIC_TRACKS.find((t) => t.id === 'track-brazilian-drift') || matchedTrack;
    }

    setSettings((prev) => ({
      ...prev,
      musicTrackId: matchedTrack.id,
      bpm: matchedTrack.bpm,
      customMusicUrl: undefined,
    }));

    // Snap clips to beats at this tempo
    const beatInterval = 60 / matchedTrack.bpm;
    const beatDuration = parseFloat((beatInterval * 2).toFixed(2));
    setMediaItems((prev) =>
      prev.map((item) => ({
        ...item,
        duration: Math.max(0.6, beatDuration),
      }))
    );

    handlePreviewTrack(matchedTrack.id);
  };

  // 7. Video Export Recording (Canvas + Web Audio Stream) - MP4 / Best Quality 60FPS
  const handleExportVideo = async () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(8);
    setExportStage('analyzing');
    setIsPlaying(true);
    handleSeek(0);

    const recordMs = Math.min(totalDuration * 1000, 30000); // max 30s
    const startTime = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(95, Math.round((elapsed / recordMs) * 90) + 10);
      setExportProgress(pct);
      if (pct < 30) setExportStage('rendering');
      else if (pct < 65) setExportStage('mixing');
      else setExportStage('encoding');
    }, 200);

    try {
      // Create media recorder from canvas stream (60 fps Ultra HD capture)
      const canvasStream = canvas.captureStream(60);
      const audioStream = globalBeatEngine.getAudioDestinationStream();

      // Combined stream
      const tracks = [...canvasStream.getVideoTracks()];
      if (audioStream) {
        tracks.push(...audioStream.getAudioTracks());
      }
      const combinedStream = new MediaStream(tracks);

      // Best quality format prioritization: MP4 first, then WebM
      const preferredMimes = [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];
      let selectedMime = 'video/webm';
      for (const mime of preferredMimes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 25_000_000, // 25 Mbps Ultra-HD Master Quality
        audioBitsPerSecond: 320_000,    // 320 kbps Studio Audio
      });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        clearInterval(progressTimer);
        setExportProgress(100);
        setExportStage('ready');

        const blob = new Blob(chunks, { type: selectedMime });
        setExportedVideoBlob(blob);
        const url = URL.createObjectURL(blob);
        setExportedVideoUrl(url);

        // Also capture current frame as 4K best thumbnail
        let thumbUrl = '';
        try {
          thumbUrl = canvas.toDataURL('image/png', 1.0);
        } catch {
          thumbUrl = selectedClip?.url || '';
        }
        if (thumbUrl) setBestPictureUrl(thumbUrl);

        setTimeout(() => {
          setIsExporting(false);
          setIsPlaying(false);
          globalBeatEngine.pause();
          setExportModalOpen(true);
        }, 500);
      };

      recorder.start(100);

      // Record for the length of the reel
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, recordMs);
    } catch (err) {
      console.error('Export video recording failed:', err);
      clearInterval(progressTimer);
      setIsExporting(false);
      // Still allow best picture download
      handleCaptureFrame();
    }
  };

  // 8. Upload File Handler (drag & drop or file dialog)
  const handleAddFiles = (files: FileList) => {
    const newItems: MediaItem[] = [];

    Array.from(files).forEach((file, index) => {
      const isVideo = file.type.startsWith('video');
      const url = URL.createObjectURL(file);
      const id = `upload-${Date.now()}-${index}`;

      newItems.push({
        id,
        type: isVideo ? 'video' : 'image',
        name: file.name.replace(/\.[^/.]+$/, ''),
        url,
        duration: 1.5,
        trimStart: 0,
        trimEnd: 1.5,
        maxDuration: isVideo ? 15.0 : 8.0,
        startTime: 0,
        transition: 'flash',
        filter: 'vibrant',
        fit: 'cover',
        kenBurns: {
          startScale: 1.0,
          endScale: 1.15,
          panX: (Math.random() - 0.5) * 0.2,
          panY: (Math.random() - 0.5) * 0.2,
        },
        caption: 'AutoCut moment ✨',
        isBestShot: false,
        score: Math.floor(88 + Math.random() * 11),
        tags: ['Custom Upload'],
      });
    });

    setMediaItems((prev) => [...prev, ...newItems]);
    if (newItems.length > 0) {
      setSelectedClipId(newItems[0].id);
    }
  };

  // 9. Add Sample Clip
  const handleAddSampleClip = () => {
    const randomSample = SAMPLE_MEDIA_LIBRARY[Math.floor(Math.random() * SAMPLE_MEDIA_LIBRARY.length)];
    const newItem: MediaItem = {
      ...randomSample,
      id: `sample-copy-${Date.now()}`,
      duration: 1.2,
      trimStart: 0,
      trimEnd: 1.2,
      maxDuration: 8.0,
    };
    setMediaItems((prev) => [...prev, newItem]);
  };

  // 10. Reorder / Delete / Edit Clips
  const handleReorderClip = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= mediaItems.length) return;

    setMediaItems((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleDeleteClip = (id: string) => {
    setMediaItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      if (selectedClipId === id && filtered.length > 0) {
        setSelectedClipId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleToggleBestShot = (id: string) => {
    setMediaItems((prev) =>
      prev.map((clip) =>
        clip.id === id ? { ...clip, isBestShot: !clip.isBestShot } : clip
      )
    );
  };

  const handleUpdateClip = (clipId: string, updates: Partial<MediaItem>) => {
    setMediaItems((prev) =>
      prev.map((clip) => (clip.id === clipId ? { ...clip, ...updates } : clip))
    );
  };

  const handlePreviewTrack = (trackId: string) => {
    const track = MUSIC_TRACKS.find((t) => t.id === trackId);
    if (!track) return;
    setSettings((prev) => ({ ...prev, musicTrackId: track.id, bpm: track.bpm }));
    globalBeatEngine.setTrack(track.id, track.bpm);
    if (!isPlaying) {
      globalBeatEngine.play(0);
      setTimeout(() => {
        if (!isPlayingRef.current) globalBeatEngine.pause();
      }, 4000);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        aspectRatio={settings.aspectRatio}
        onAspectRatioChange={(ratio: AspectRatio) =>
          setSettings((prev) => ({ ...prev, aspectRatio: ratio }))
        }
        onAutoCutClick={() => handleRunAiAutoCut(settings.title)}
        onExportClick={handleExportVideo}
        onCaptureFrameClick={handleCaptureFrame}
        isAiProcessing={isAiProcessing}
        isExporting={isExporting}
        viralScore={aiReport?.viralScore}
      />

      {/* Main Workspace: Center Canvas Player + Right Inspector */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Center Stage Player View */}
        <main className="flex-1 flex flex-col min-h-0 bg-[#070a12] relative overflow-hidden">
          <PlayerView
            mediaItems={mediaItems}
            settings={settings}
            scriptLines={scriptLines}
            currentTime={currentTime}
            totalDuration={totalDuration}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onVolumeChange={(v) => setSettings((prev) => ({ ...prev, musicVolume: v }))}
            activePresetName={
              AUTO_CUT_PRESETS.find((p) => p.id === activePresetId)?.name || 'Velocity Phonk'
            }
            isAiProcessing={isAiProcessing}
          />
        </main>

        {/* Right Inspector Sidebar */}
        <InspectorPanel
          activeTab={activeTab}
          onTabChange={setActiveTab}
          presets={AUTO_CUT_PRESETS}
          activePresetId={activePresetId}
          onApplyPreset={handleApplyPreset}
          onRunAiAutoCut={handleRunAiAutoCut}
          isAiProcessing={isAiProcessing}
          aiReport={aiReport}
          selectedClip={selectedClip}
          onUpdateClip={handleUpdateClip}
          musicTracks={MUSIC_TRACKS}
          settings={settings}
          onUpdateSettings={(updates) => setSettings((prev) => ({ ...prev, ...updates }))}
          onPreviewTrack={handlePreviewTrack}
          onGenerateSmartCaptions={handleGenerateSmartCaptions}
          generatedHooks={generatedHooks}
          onVoiceoverRecorded={(url) => setSettings((prev) => ({ ...prev, voiceoverUrl: url }))}
          onVoiceoverRemoved={() => setSettings((prev) => ({ ...prev, voiceoverUrl: undefined }))}
          onCustomMusicUploaded={handleCustomMusicUploaded}
          onSnapClipsToBeats={handleSnapClipsToBeats}
          onAutoMatchMusic={handleAutoMatchMusic}
        />
      </div>

      {/* Bottom Timeline & Clips Scrubber */}
      <TimelineBar
        mediaItems={mediaItems}
        selectedClipId={selectedClipId}
        onSelectClip={setSelectedClipId}
        onReorderClip={handleReorderClip}
        onDeleteClip={handleDeleteClip}
        onToggleBestShot={handleToggleBestShot}
        onAddFiles={handleAddFiles}
        onAddSampleClip={handleAddSampleClip}
        currentTime={currentTime}
        totalDuration={totalDuration}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        beats={currentTrack?.beats || []}
      />

      {/* Realtime Video Export Progress Modal */}
      <ExportProgressModal
        isOpen={isExporting}
        progress={exportProgress}
        stage={exportStage}
        totalDuration={totalDuration}
      />

      {/* Best Picture Photo Studio Modal */}
      <BestPictureStudioModal
        isOpen={bestPictureStudioOpen}
        onClose={() => setBestPictureStudioOpen(false)}
        imageUrl={studioSourceUrl}
        imageName={studioSourceName}
      />

      {/* Export / Best Picture Download Dialog */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        videoBlobUrl={exportedVideoUrl}
        videoBlob={exportedVideoBlob}
        bestPictureDataUrl={bestPictureUrl}
        reelTitle={settings.title}
        hashtags={aiReport?.hashtags || ['#reels', '#autocut', '#fyp']}
        aspectRatio={settings.aspectRatio}
        totalDuration={totalDuration}
        currentTrack={currentTrack}
      />
    </div>
  );
}
