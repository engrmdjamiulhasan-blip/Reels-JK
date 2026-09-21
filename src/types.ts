export type AspectRatio = '9:16' | '1:1' | '16:9';

export type TransitionType = 
  | 'fade' 
  | 'zoom_in' 
  | 'zoom_out' 
  | 'flash' 
  | 'glitch' 
  | 'slide_left' 
  | 'beat_shake'
  | 'dip_to_black';

export type ColorFilterType = 
  | 'none' 
  | 'cyberpunk' 
  | 'vibrant' 
  | 'monochrome' 
  | 'vintage_warm' 
  | 'cinematic_teal' 
  | 'kodak_gold' 
  | 'noir_contrast';

export type CaptionStyleType = 
  | 'yellow_highlight' 
  | 'karaoke_neon' 
  | 'bold_impact' 
  | 'minimal_clean';

export interface ScriptLine {
  id: string;
  time: number;       // timestamp in seconds
  duration: number;   // display duration in seconds
  text: string;
  highlightWord?: string;
}

export interface OverlaySticker {
  id: string;
  text: string;
  emoji?: string;
  position: 'top' | 'center' | 'bottom';
  animation: 'pulse' | 'bounce' | 'none';
  color?: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  name: string;
  url: string;
  thumbnail?: string;
  duration: number;   // duration in seconds in reel
  startTime: number;  // timeline position
  transition: TransitionType;
  filter: ColorFilterType;
  fit: 'cover' | 'contain';
  kenBurns: {
    startScale: number;
    endScale: number;
    panX: number; // -1 to 1
    panY: number; // -1 to 1
  };
  caption?: string;
  isBestShot?: boolean;
  score?: number; // AI aesthetic quality rating (0-100)
  tags?: string[];
  // Photo & Video Tuning adjustments
  brightness?: number; // 0.6 to 1.4 (default 1.0)
  contrast?: number;   // 0.6 to 1.5 (default 1.0)
  saturation?: number; // 0.0 to 2.0 (default 1.0)
  warmth?: number;     // -0.3 to 0.3 (default 0)
  speed?: number;      // 0.5 to 2.0 (default 1.0)
  speedCurve?: 'linear' | 'velocity_ramp';
  // Trim range settings
  trimStart?: number;  // trim in point in seconds
  trimEnd?: number;    // trim out point in seconds
  maxDuration?: number; // original source media duration in seconds
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  genre: string;
  energy: 'chill' | 'medium' | 'high' | 'explosive';
  duration: number;
  beats: number[]; // beat timestamps in seconds
  synthPreset: 'synthwave' | 'phonk' | 'lofi' | 'trap' | 'club' | 'cinematic' | 'afro' | 'edm';
  customUrl?: string;
  copyrightFree?: boolean;
  licenseType?: string;
  safePlatforms?: string[];
  attributionText?: string;
}

export interface ReelSettings {
  title: string;
  aspectRatio: AspectRatio;
  bpm: number;
  musicTrackId: string;
  musicVolume: number;
  voiceoverVolume: number;
  captionStyle: CaptionStyleType;
  overlayVhs: boolean;
  overlayVignette: boolean;
  overlayLightLeak: boolean;
  overlayAudioWave: boolean;
  overlayTimecode: boolean;
  overlayWatermark: boolean;
  enableTransitionSfx?: boolean;
  enableSfx?: boolean;
  sfxVolume?: number;
  voiceoverAudioUrl?: string;
  voiceoverUrl?: string;
  voiceoverBlob?: Blob;
  customMusicUrl?: string;
  customMusicName?: string;
  activeSticker?: OverlaySticker | null;
}

export interface AutoCutPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  targetBpm: number;
  shotPacing: 'ultra_fast' | 'dynamic_velocity' | 'cinematic_flow' | 'aesthetic_chill';
  musicTrackId: string;
  defaultFilter: ColorFilterType;
  defaultTransition: TransitionType;
  captionStyle: CaptionStyleType;
  colorGrading: string;
}

export interface AiAutoCutResult {
  title: string;
  summary: string;
  recommendedTrackId: string;
  vibe: string;
  viralScore: number;
  recommendedPreset: string;
  scriptLines: ScriptLine[];
  clipsConfig: Array<{
    id: string;
    duration: number;
    transition: TransitionType;
    filter: ColorFilterType;
    caption: string;
    isBestShot: boolean;
  }>;
  hashtags: string[];
}
