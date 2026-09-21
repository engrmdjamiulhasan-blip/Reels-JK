import { AutoCutPreset, MediaItem, MusicTrack } from '../types';

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'track-phonk-velocity',
    title: 'Neon Drift (Velocity Phonk)',
    artist: 'NightPulse',
    bpm: 135,
    genre: 'Drift Phonk / Hyper',
    energy: 'explosive',
    duration: 30,
    synthPreset: 'phonk',
    copyrightFree: true,
    licenseType: '100% Royalty-Free & Commercial Safe',
    safePlatforms: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'Facebook'],
    attributionText: 'Music by AutoCut Audio Library - 100% Copyright-Free / Safe for Monetization',
    beats: [
      0.0, 0.44, 0.88, 1.33, 1.77, 2.22, 2.66, 3.11, 3.55, 4.0,
      4.44, 4.88, 5.33, 5.77, 6.22, 6.66, 7.11, 7.55, 8.0, 8.44,
      8.88, 9.33, 9.77, 10.22, 10.66, 11.11, 11.55, 12.0, 12.44, 12.88,
      13.33, 13.77, 14.22, 14.66, 15.11, 15.55, 16.0
    ]
  },
  {
    id: 'track-brazilian-drift',
    title: 'Rio Favela 140 (Drift Phonk)',
    artist: 'SambaBass AI',
    bpm: 140,
    genre: 'Brazilian Phonk / Club',
    energy: 'explosive',
    duration: 30,
    synthPreset: 'phonk',
    copyrightFree: true,
    licenseType: 'Creative Commons 0 (No Rights Reserved)',
    safePlatforms: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'Facebook'],
    attributionText: 'Music by AutoCut Library - Free for Commercial Use with Zero Copyright Claims',
    beats: [
      0.0, 0.428, 0.857, 1.285, 1.714, 2.142, 2.571, 3.0, 3.428, 3.857,
      4.285, 4.714, 5.142, 5.571, 6.0, 6.428, 6.857, 7.285, 7.714, 8.142,
      8.571, 9.0, 9.428, 9.857, 10.285, 10.714, 11.142, 11.571, 12.0
    ]
  },
  {
    id: 'track-trap-hype',
    title: 'Viral Anthem (808 Bass Drop)',
    artist: 'Tokyo SoundLab',
    bpm: 128,
    genre: 'Trap / Viral Reel',
    energy: 'high',
    duration: 30,
    synthPreset: 'trap',
    copyrightFree: true,
    licenseType: '100% Royalty-Free & Commercial Safe',
    safePlatforms: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'Facebook'],
    attributionText: 'Music: Viral Anthem (Tokyo SoundLab) - Whitelisted for YouTube & Socials',
    beats: [
      0.0, 0.468, 0.937, 1.406, 1.875, 2.343, 2.812, 3.281, 3.75, 4.218,
      4.687, 5.156, 5.625, 6.093, 6.562, 7.031, 7.5, 7.968, 8.437, 8.906,
      9.375, 9.843, 10.312, 10.781, 11.25, 11.718, 12.187, 12.656, 13.125, 13.593
    ]
  },
  {
    id: 'track-afro-summer',
    title: 'Lagos Sunset (Afrobeat Pulse)',
    artist: 'AfroGroove AI',
    bpm: 110,
    genre: 'Afrobeats / Summer Vibe',
    energy: 'high',
    duration: 30,
    synthPreset: 'afro',
    copyrightFree: true,
    licenseType: '100% Royalty-Free & Commercial Safe',
    safePlatforms: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'Facebook'],
    attributionText: 'Music: Lagos Sunset - Copyright-Free Afrobeat / AutoCut Audio',
    beats: [
      0.0, 0.545, 1.09, 1.636, 2.181, 2.727, 3.272, 3.818, 4.363, 4.909,
      5.454, 6.0, 6.545, 7.09, 7.636, 8.181, 8.727, 9.272, 9.818, 10.363
    ]
  },
  {
    id: 'track-synthwave-glow',
    title: 'Midnight Highway 1984',
    artist: 'RetroNeon',
    bpm: 118,
    genre: 'Synthwave / Retro',
    energy: 'medium',
    duration: 30,
    synthPreset: 'synthwave',
    copyrightFree: true,
    licenseType: '100% Royalty-Free & Commercial Safe',
    safePlatforms: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'Facebook'],
    attributionText: 'Music: Midnight Highway 1984 by RetroNeon - Zero Copyright Claim',
    beats: [
      0.0, 0.508, 1.016, 1.525, 2.033, 2.542, 3.05, 3.559, 4.067, 4.576,
      5.084, 5.593, 6.101, 6.61, 7.118, 7.627, 8.135, 8.644, 9.152, 9.661,
      10.169, 10.677, 11.186, 11.694, 12.203, 12.711, 13.22, 13.728, 14.237
    ]
  },
  {
    id: 'track-lofi-chill',
    title: 'Golden Sunset Latte',
    artist: 'Aura Chill',
    bpm: 85,
    genre: 'Lo-Fi / Cozy Vlog',
    energy: 'chill',
    duration: 30,
    synthPreset: 'lofi',
    copyrightFree: true,
    licenseType: 'Creative Commons 0 (No Rights Reserved)',
    safePlatforms: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'Facebook'],
    attributionText: 'Music: Golden Sunset Latte - Free Commercial Use',
    beats: [
      0.0, 0.705, 1.411, 2.117, 2.823, 3.529, 4.235, 4.941, 5.647, 6.352,
      7.058, 7.764, 8.47, 9.176, 9.882, 10.588, 11.294, 12.0, 12.705, 13.411
    ]
  },
  {
    id: 'track-cinematic-epic',
    title: 'Ascension (Trailer Risers)',
    artist: 'Hans Pulse',
    bpm: 100,
    genre: 'Cinematic / Drone',
    energy: 'high',
    duration: 30,
    synthPreset: 'cinematic',
    copyrightFree: true,
    licenseType: '100% Royalty-Free & Commercial Safe',
    safePlatforms: ['Instagram Reels', 'TikTok', 'YouTube Shorts', 'Facebook'],
    attributionText: 'Music: Ascension by Hans Pulse - Commercial Safe',
    beats: [
      0.0, 0.6, 1.2, 1.8, 2.4, 3.0, 3.6, 4.2, 4.8, 5.4, 6.0, 6.6, 7.2, 7.8,
      8.4, 9.0, 9.6, 10.2, 10.8, 11.4, 12.0, 12.6, 13.2, 13.8, 14.4, 15.0
    ]
  }
];

export const AUTO_CUT_PRESETS: AutoCutPreset[] = [
  {
    id: 'preset-velocity',
    name: 'Velocity Beat Drop',
    badge: '🔥 VIRAL',
    description: 'Ultra-fast rhythmic cuts synced to drum kicks with flash and zoom snaps.',
    targetBpm: 135,
    shotPacing: 'ultra_fast',
    musicTrackId: 'track-phonk-velocity',
    defaultFilter: 'vibrant',
    defaultTransition: 'beat_shake',
    captionStyle: 'yellow_highlight',
    colorGrading: 'Saturated high-contrast punch'
  },
  {
    id: 'preset-cinematic-travel',
    name: 'Cinematic Film Roll',
    badge: '🎬 4K FILM',
    description: 'Smooth Ken Burns pan-zooms with warm teal & gold cinematic grading.',
    targetBpm: 100,
    shotPacing: 'cinematic_flow',
    musicTrackId: 'track-cinematic-epic',
    defaultFilter: 'cinematic_teal',
    defaultTransition: 'fade',
    captionStyle: 'minimal_clean',
    colorGrading: 'Hollywood block-buster teal-orange split'
  },
  {
    id: 'preset-cyberpunk-glitch',
    name: 'Cyber Tokyo Glitch',
    badge: '⚡ TRENDING',
    description: 'Neon highlights, chromatic aberration bursts, and rapid cut glitches.',
    targetBpm: 128,
    shotPacing: 'dynamic_velocity',
    musicTrackId: 'track-trap-hype',
    defaultFilter: 'cyberpunk',
    defaultTransition: 'glitch',
    captionStyle: 'karaoke_neon',
    colorGrading: 'Neon violet with cyan high-lights'
  },
  {
    id: 'preset-aesthetic-vlog',
    name: 'Aesthetic Warm Diary',
    badge: '☕ COZY',
    description: 'Gentle golden hour pacing, soft film dust, and aesthetic typewriter text.',
    targetBpm: 85,
    shotPacing: 'aesthetic_chill',
    musicTrackId: 'track-lofi-chill',
    defaultFilter: 'kodak_gold',
    defaultTransition: 'fade',
    captionStyle: 'bold_impact',
    colorGrading: 'Kodak Portra 400 warm pastel tones'
  }
];

export const SAMPLE_MEDIA_LIBRARY: MediaItem[] = [
  {
    id: 'sample-1',
    type: 'image',
    name: 'Tokyo Neon Street Crossing',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1080&auto=format&fit=crop&q=80',
    duration: 1.8,
    trimStart: 0,
    trimEnd: 1.8,
    maxDuration: 8.0,
    startTime: 0,
    transition: 'flash',
    filter: 'cyberpunk',
    fit: 'cover',
    kenBurns: { startScale: 1.0, endScale: 1.2, panX: 0.1, panY: -0.1 },
    caption: 'Neon lights hit different 🌃',
    isBestShot: true,
    score: 98,
    tags: ['Tokyo', 'Neon', 'Night', 'City', 'Cyberpunk']
  },
  {
    id: 'sample-2',
    type: 'image',
    name: 'Golden Sunset Ocean Horizon',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
    duration: 1.4,
    trimStart: 0,
    trimEnd: 1.4,
    maxDuration: 8.0,
    startTime: 1.8,
    transition: 'zoom_in',
    filter: 'kodak_gold',
    fit: 'cover',
    kenBurns: { startScale: 1.15, endScale: 1.0, panX: -0.05, panY: 0.05 },
    caption: 'Chasing the golden hour ✨',
    isBestShot: true,
    score: 95,
    tags: ['Sunset', 'Ocean', 'Golden Hour', 'Travel', 'Beach']
  },
  {
    id: 'sample-3',
    type: 'image',
    name: 'Supercar Velocity Motion',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1080&auto=format&fit=crop&q=80',
    duration: 1.2,
    trimStart: 0,
    trimEnd: 1.2,
    maxDuration: 8.0,
    startTime: 3.2,
    transition: 'beat_shake',
    filter: 'vibrant',
    fit: 'cover',
    kenBurns: { startScale: 1.05, endScale: 1.25, panX: 0.15, panY: 0 },
    caption: 'Full throttle energy 🏎️💨',
    isBestShot: false,
    score: 91,
    tags: ['Supercar', 'Speed', 'Luxury', 'Hype']
  },
  {
    id: 'sample-4',
    type: 'image',
    name: 'Urban Cyber Fashion Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&auto=format&fit=crop&q=80',
    duration: 1.6,
    trimStart: 0,
    trimEnd: 1.6,
    maxDuration: 8.0,
    startTime: 4.4,
    transition: 'glitch',
    filter: 'cinematic_teal',
    fit: 'cover',
    kenBurns: { startScale: 1.2, endScale: 1.05, panX: 0, panY: -0.1 },
    caption: 'Pure main character vibe ⚡',
    isBestShot: true,
    score: 97,
    tags: ['Portrait', 'Fashion', 'Streetwear', 'Style']
  },
  {
    id: 'sample-5',
    type: 'image',
    name: 'Mountain Peak Sunrise',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&auto=format&fit=crop&q=80',
    duration: 1.5,
    trimStart: 0,
    trimEnd: 1.5,
    maxDuration: 8.0,
    startTime: 6.0,
    transition: 'zoom_out',
    filter: 'vibrant',
    fit: 'cover',
    kenBurns: { startScale: 1.0, endScale: 1.18, panX: -0.1, panY: 0.1 },
    caption: 'On top of the world 🏔️',
    isBestShot: false,
    score: 93,
    tags: ['Mountains', 'Adventure', 'Nature', 'Sunrise']
  },
  {
    id: 'sample-6',
    type: 'image',
    name: 'Retro Cafe Aesthetic Pour',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&auto=format&fit=crop&q=80',
    duration: 1.3,
    trimStart: 0,
    trimEnd: 1.3,
    maxDuration: 8.0,
    startTime: 7.5,
    transition: 'flash',
    filter: 'vintage_warm',
    fit: 'cover',
    kenBurns: { startScale: 1.1, endScale: 1.0, panX: 0.05, panY: -0.05 },
    caption: 'Life moves fast, enjoy every drop ☕',
    isBestShot: false,
    score: 89,
    tags: ['Coffee', 'Cafe', 'Lo-Fi', 'Morning']
  }
];
