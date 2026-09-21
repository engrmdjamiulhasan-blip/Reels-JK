import { MediaItem, OverlaySticker, ReelSettings, ScriptLine } from '../types';

export class CanvasReelRenderer {
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private videoCache: Map<string, HTMLVideoElement> = new Map();

  public preloadMedia(items: MediaItem[]) {
    items.forEach((item) => {
      if (item.type === 'image') {
        if (!this.imageCache.has(item.url)) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = item.url;
          this.imageCache.set(item.url, img);
        }
      } else if (item.type === 'video') {
        if (!this.videoCache.has(item.url)) {
          const vid = document.createElement('video');
          vid.crossOrigin = 'anonymous';
          vid.src = item.url;
          vid.muted = true;
          vid.playsInline = true;
          vid.preload = 'auto';
          this.videoCache.set(item.url, vid);
        }
      }
    });
  }

  private lastPlayedTransitionIndex: number = -1;

  public renderFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentTime: number,
    mediaItems: MediaItem[],
    settings: ReelSettings,
    scriptLines: ScriptLine[],
    bassEnergy: number,
    waveformData: Uint8Array,
    isPlaying: boolean = false
  ) {
    // 1. Clear canvas with deep dark background
    ctx.fillStyle = '#05070d';
    ctx.fillRect(0, 0, width, height);

    if (mediaItems.length === 0) {
      this.drawEmptyState(ctx, width, height);
      return;
    }

    // 2. Find current active clip and next clip
    let accumulatedTime = 0;
    let currentClip: MediaItem | null = null;
    let nextClip: MediaItem | null = null;
    let clipStartTime = 0;
    let currentClipIndex = 0;

    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i];
      const clipEnd = accumulatedTime + item.duration;
      if (currentTime >= accumulatedTime && currentTime < clipEnd) {
        currentClip = item;
        nextClip = mediaItems[(i + 1) % mediaItems.length];
        clipStartTime = accumulatedTime;
        currentClipIndex = i;
        break;
      }
      accumulatedTime = clipEnd;
    }

    if (!currentClip) {
      currentClipIndex = mediaItems.length - 1;
      currentClip = mediaItems[currentClipIndex];
      clipStartTime = accumulatedTime - currentClip.duration;
    }

    const clipDuration = Math.max(0.05, currentClip?.duration || 0.1);
    const clipElapsed = Math.max(0, currentTime - clipStartTime);
    const clipProgress = Math.min(1, Math.max(0, clipElapsed / clipDuration));

    // Pause non-active videos to conserve performance
    this.videoCache.forEach((vid, url) => {
      if (url !== currentClip?.url && !vid.paused) {
        vid.pause();
      }
    });

    // 3. Draw active media with Ken Burns pan/zoom, tuning adjustments, and transitions
    ctx.save();
    this.drawClipWithEffects(ctx, width, height, currentClip, clipProgress, clipElapsed, bassEnergy, isPlaying);
    ctx.restore();

    // 4. Check for transition into next clip (last 0.35 seconds of clip)
    const transitionDuration = 0.35;
    const timeRemaining = currentClip.duration - clipElapsed;
    if (timeRemaining < transitionDuration && nextClip) {
      const transitionProgress = 1 - (timeRemaining / transitionDuration);
      this.drawTransition(ctx, width, height, currentClip.transition, transitionProgress, nextClip, bassEnergy);

      // Trigger transition SFX if enabled and entering transition
      if (settings.enableTransitionSfx && this.lastPlayedTransitionIndex !== currentClipIndex && transitionProgress < 0.3) {
        this.lastPlayedTransitionIndex = currentClipIndex;
      }
    } else if (timeRemaining >= transitionDuration) {
      this.lastPlayedTransitionIndex = -1;
    }

    // 5. Apply filmic color grade / LUT overlay
    this.applyColorFilter(ctx, width, height, currentClip.filter);

    // Warmth tint adjustment if set
    if (currentClip.warmth && currentClip.warmth !== 0) {
      ctx.save();
      if (currentClip.warmth > 0) {
        ctx.fillStyle = `rgba(251, 146, 60, ${Math.min(0.3, currentClip.warmth)})`;
        ctx.globalCompositeOperation = 'color-dodge';
      } else {
        ctx.fillStyle = `rgba(56, 189, 248, ${Math.min(0.3, Math.abs(currentClip.warmth))})`;
        ctx.globalCompositeOperation = 'soft-light';
      }
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 6. Draw Vignette & Retro Cam Overlays if enabled
    if (settings.overlayVignette) {
      this.drawVignette(ctx, width, height);
    }

    if (settings.overlayLightLeak) {
      this.drawLightLeak(ctx, width, height, currentTime);
    }

    if (settings.overlayVhs) {
      this.drawVhsOverlay(ctx, width, height, currentTime);
    }

    if (settings.overlayAudioWave) {
      this.drawAudioWaveVisualizer(ctx, width, height, waveformData, bassEnergy);
    }

    if (settings.overlayTimecode) {
      this.drawTimecode(ctx, width, height, currentTime);
    }

    // 7. Draw Captions / Subtitles with viral animations
    this.drawCaptions(ctx, width, height, currentTime, scriptLines, currentClip, settings.captionStyle, bassEnergy);

    // 8. Draw Overlay Sticker / Graphic Badge if active
    if (settings.activeSticker) {
      this.drawSticker(ctx, width, height, settings.activeSticker, currentTime, bassEnergy);
    }

    // 9. Draw Watermark / AI Badge
    if (settings.overlayWatermark) {
      this.drawWatermark(ctx, width, height);
    }
  }

  private drawClipWithEffects(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    clip: MediaItem,
    progress: number,
    clipElapsed: number,
    bassEnergy: number,
    isPlaying: boolean = false
  ) {
    const img = this.imageCache.get(clip.url);
    const vid = this.videoCache.get(clip.url);
    const source = img || vid;

    // Handle video frame sync & playback state
    if (vid) {
      if (vid.readyState >= 1) {
        const trimOffset = typeof clip.trimStart === 'number' && Number.isFinite(clip.trimStart) ? clip.trimStart : 0;
        const vidDur = Number.isFinite(vid.duration) && vid.duration > 0 ? vid.duration : 1;
        const validClipElapsed = Number.isFinite(clipElapsed) ? Math.max(0, clipElapsed) : 0;
        const rawTargetTime = (trimOffset + validClipElapsed) % vidDur;
        const targetTime = Number.isFinite(rawTargetTime) ? Math.max(0, rawTargetTime) : 0;

        if (Number.isFinite(vid.currentTime) && Math.abs(vid.currentTime - targetTime) > 0.25) {
          try {
            vid.currentTime = targetTime;
          } catch {
            // Safe fallback if element is not seekable at this frame
          }
        }
        if (isPlaying && vid.paused) {
          vid.play().catch(() => {});
        } else if (!isPlaying && !vid.paused) {
          vid.pause();
        }
      }
    }

    // Bass beat shake
    const beatShakeX = (Math.random() - 0.5) * 14 * (Number.isFinite(bassEnergy) ? bassEnergy : 0);
    const beatShakeY = (Math.random() - 0.5) * 14 * (Number.isFinite(bassEnergy) ? bassEnergy : 0);

    ctx.translate(beatShakeX, beatShakeY);

    if (source && (source instanceof HTMLImageElement ? source.complete : source.readyState >= 2)) {
      const rawW = (source instanceof HTMLImageElement) ? source.naturalWidth : source.videoWidth;
      const rawH = (source instanceof HTMLImageElement) ? source.naturalHeight : source.videoHeight;
      const sourceW = Number.isFinite(rawW) && rawW > 0 ? rawW : 0;
      const sourceH = Number.isFinite(rawH) && rawH > 0 ? rawH : 0;

      if (sourceW > 0 && sourceH > 0) {
        // Ken Burns motion interpolation with speed factor
        const speedFactor = clip.speed || 1.0;
        const effectiveProgress = Math.min(1, Math.max(0, progress * speedFactor));

        const kb = clip.kenBurns || { startScale: 1.0, endScale: 1.15, panX: 0, panY: 0 };
        const currentScale = kb.startScale + (kb.endScale - kb.startScale) * effectiveProgress;
        const currentPanX = (kb.panX * width * 0.1) * effectiveProgress;
        const currentPanY = (kb.panY * height * 0.1) * effectiveProgress;

        const baseScale = Math.max(width / sourceW, height / sourceH);
        const renderW = sourceW * baseScale * currentScale;
        const renderH = sourceH * baseScale * currentScale;

        const drawX = (width - renderW) / 2 + currentPanX;
        const drawY = (height - renderH) / 2 + currentPanY;

        // Apply per-clip brightness, contrast, and saturation tuning
        const b = clip.brightness ?? 1.0;
        const c = clip.contrast ?? 1.0;
        const s = clip.saturation ?? 1.0;
        if (b !== 1.0 || c !== 1.0 || s !== 1.0) {
          ctx.filter = `brightness(${b}) contrast(${c}) saturate(${s})`;
        }

        ctx.drawImage(source, drawX, drawY, renderW, renderH);
        ctx.filter = 'none';
      } else {
        this.drawClipPlaceholder(ctx, width, height, clip.name);
      }
    } else {
      this.drawClipPlaceholder(ctx, width, height, clip.name);
    }
  }

  private drawClipPlaceholder(ctx: CanvasRenderingContext2D, width: number, height: number, name?: string) {
    // Elegant placeholder with gradient while media loads
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 24px "Plus Jakarta Sans"';
    ctx.textAlign = 'center';
    ctx.fillText(name || 'Loading clip...', width / 2, height / 2);
  }

  private drawTransition(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    transition: string,
    progress: number,
    _nextClip: MediaItem,
    _bassEnergy: number
  ) {
    ctx.save();
    switch (transition) {
      case 'flash': {
        // Bright white flash that dissipates
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(progress * Math.PI) * 0.95})`;
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case 'zoom_in': {
        ctx.fillStyle = `rgba(0, 0, 0, ${progress * 0.5})`;
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case 'glitch': {
        // Chromatic split bands
        const bands = 6;
        for (let i = 0; i < bands; i++) {
          const y = (i / bands) * height;
          const bandH = height / bands;
          const shift = (Math.random() - 0.5) * 40 * progress;
          ctx.fillStyle = (i % 2 === 0) ? `rgba(236, 72, 153, 0.25)` : `rgba(6, 182, 212, 0.25)`;
          ctx.fillRect(shift, y, width, bandH);
        }
        break;
      }
      case 'beat_shake': {
        ctx.fillStyle = `rgba(245, 158, 11, ${Math.sin(progress * Math.PI) * 0.4})`;
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case 'dip_to_black': {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.sin(progress * Math.PI)})`;
        ctx.fillRect(0, 0, width, height);
        break;
      }
      default: {
        // Crossfade
        ctx.fillStyle = `rgba(15, 23, 42, ${progress * 0.4})`;
        ctx.fillRect(0, 0, width, height);
      }
    }
    ctx.restore();
  }

  private applyColorFilter(ctx: CanvasRenderingContext2D, width: number, height: number, filter: string) {
    ctx.save();
    switch (filter) {
      case 'cyberpunk': {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, 'rgba(168, 85, 247, 0.15)'); // Purple
        grad.addColorStop(1, 'rgba(6, 182, 212, 0.15)');  // Cyan
        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case 'vibrant': {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
        ctx.globalCompositeOperation = 'color-dodge';
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case 'cinematic_teal': {
        const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.8);
        grad.addColorStop(0, 'rgba(251, 146, 60, 0.12)'); // warm orange center
        grad.addColorStop(1, 'rgba(13, 148, 136, 0.22)'); // deep teal edge
        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case 'kodak_gold': {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
        ctx.globalCompositeOperation = 'soft-light';
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case 'vintage_warm': {
        ctx.fillStyle = 'rgba(180, 83, 9, 0.18)';
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case 'monochrome': {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.globalCompositeOperation = 'saturation';
        ctx.fillRect(0, 0, width, height);
        break;
      }
      case 'noir_contrast': {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.globalCompositeOperation = 'color-burn';
        ctx.fillRect(0, 0, width, height);
        break;
      }
      default:
        break;
    }
    ctx.restore();
  }

  private drawVignette(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    const radial = ctx.createRadialGradient(
      width / 2, height / 2, Math.min(width, height) * 0.35,
      width / 2, height / 2, Math.max(width, height) * 0.72
    );
    radial.addColorStop(0, 'rgba(0, 0, 0, 0)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0.68)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  private drawLightLeak(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
    ctx.save();
    const pulse = (Math.sin(time * 2.5) + 1) * 0.5;
    const leakGrad = ctx.createRadialGradient(
      width * 0.9, height * 0.1, 10,
      width * 0.8, height * 0.2, width * 0.7
    );
    leakGrad.addColorStop(0, `rgba(255, 115, 0, ${0.35 * pulse})`);
    leakGrad.addColorStop(0.5, `rgba(255, 0, 128, ${0.18 * pulse})`);
    leakGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = leakGrad;
    ctx.globalCompositeOperation = 'screen';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  private drawVhsOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
    ctx.save();
    // Subtle horizontal scan lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y, width, 1.5);
    }

    // VHS REC & Play indicators
    ctx.font = '700 18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffffff';

    // Blinking red dot
    const blink = Math.floor(time * 2) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(36, 42, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillText('REC', 52, 47);

    ctx.textAlign = 'right';
    ctx.fillText('SP 0:00', width - 36, 47);

    // VHS noise glitch band occasionally
    if (Math.random() < 0.08) {
      const noiseY = Math.random() * height;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, noiseY, width, 6);
    }

    ctx.restore();
  }

  private drawAudioWaveVisualizer(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    waveformData: Uint8Array,
    _bassEnergy: number
  ) {
    ctx.save();
    const barCount = 24;
    const barWidth = 6;
    const barGap = 4;
    const totalW = barCount * (barWidth + barGap);
    const startX = (width - totalW) / 2;
    const bottomY = height - 120;

    for (let i = 0; i < barCount; i++) {
      const val = waveformData[i % waveformData.length] || 10;
      const barH = Math.max(6, (val / 255) * 55);
      const x = startX + i * (barWidth + barGap);

      // Color from emerald/cyan to amber
      const grad = ctx.createLinearGradient(0, bottomY - barH, 0, bottomY);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(1, '#6366f1');

      ctx.fillStyle = grad;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, bottomY - barH, barWidth, barH, [3, 3, 0, 0]);
      } else {
        ctx.rect(x, bottomY - barH, barWidth, barH);
      }
      ctx.fill();
    }
    ctx.restore();
  }

  private drawTimecode(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
    ctx.save();
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const frames = Math.floor((time % 1) * 30);
    const text = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;

    ctx.font = '600 15px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.textAlign = 'center';
    ctx.fillText(text, width / 2, height - 50);
    ctx.restore();
  }

  private drawCaptions(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentTime: number,
    scriptLines: ScriptLine[],
    currentClip: MediaItem,
    style: string,
    bassEnergy: number
  ) {
    // Find matching script line or clip caption
    let activeText = currentClip.caption || '';
    let highlightWord = '';

    for (const line of scriptLines) {
      if (currentTime >= line.time && currentTime <= line.time + line.duration) {
        activeText = line.text;
        highlightWord = line.highlightWord || '';
        break;
      }
    }

    if (!activeText) return;

    ctx.save();
    const centerY = height * 0.76;

    // Bass bounce scale
    const bounce = 1 + bassEnergy * 0.08;
    ctx.translate(width / 2, centerY);
    ctx.scale(bounce, bounce);

    if (style === 'yellow_highlight') {
      // Viral CapCut / TikTok Yellow Box Highlight Style
      ctx.font = '900 32px "Syne", "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const words = activeText.split(' ');
      const totalWidth = ctx.measureText(activeText).width;
      let curX = -totalWidth / 2;

      words.forEach((word) => {
        const wordW = ctx.measureText(word + ' ').width;
        const isHighlight = highlightWord ? word.toLowerCase().includes(highlightWord.toLowerCase()) : (word.length > 5);

        if (isHighlight) {
          ctx.fillStyle = '#facc15'; // Amber yellow
          ctx.fillRect(curX - 4, -20, wordW + 2, 40);
          ctx.fillStyle = '#000000';
        } else {
          // Shadow and stroke
          ctx.lineWidth = 6;
          ctx.strokeStyle = '#000000';
          ctx.strokeText(word, curX + wordW / 2, 0);
          ctx.fillStyle = '#ffffff';
        }
        ctx.fillText(word, curX + wordW / 2, 0);
        curX += wordW;
      });
    } else if (style === 'karaoke_neon') {
      // Neon glowing Karaoke style
      ctx.font = '800 30px "Syne", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#22d3ee';
      ctx.fillText(activeText, 0, 0);

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(activeText, 0, 0);
    } else if (style === 'bold_impact') {
      // Bold white all-caps with thick black border
      ctx.font = '900 34px "Syne", impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.lineWidth = 8;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(activeText.toUpperCase(), 0, 0);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(activeText.toUpperCase(), 0, 0);
    } else {
      // Minimal clean style
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Translucent pill background
      const textMetrics = ctx.measureText(activeText);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.roundRect(-textMetrics.width / 2 - 16, -18, textMetrics.width + 32, 36, 18);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.fillText(activeText, 0, 0);
    }

    ctx.restore();
  }

  private drawSticker(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    sticker: OverlaySticker,
    currentTime: number,
    bassEnergy: number
  ) {
    ctx.save();
    let posY = height * 0.16;
    if (sticker.position === 'center') posY = height * 0.48;
    if (sticker.position === 'bottom') posY = height * 0.82;

    let scale = 1.0;
    if (sticker.animation === 'pulse') {
      scale = 1.0 + Math.sin(currentTime * 8) * 0.05 + bassEnergy * 0.08;
    } else if (sticker.animation === 'bounce') {
      scale = 1.0 + Math.abs(Math.sin(currentTime * 10)) * 0.08;
    }

    ctx.translate(width / 2, posY);
    ctx.scale(scale, scale);

    const displayText = sticker.emoji ? `${sticker.emoji} ${sticker.text}` : sticker.text;
    ctx.font = '900 24px "Syne", "Plus Jakarta Sans", sans-serif';
    const textWidth = ctx.measureText(displayText).width;
    const padX = 24;
    const padY = 12;

    // Glowing badge background
    ctx.shadowColor = sticker.color || '#f59e0b';
    ctx.shadowBlur = 20;

    const bgGrad = ctx.createLinearGradient(-textWidth / 2, 0, textWidth / 2, 0);
    bgGrad.addColorStop(0, sticker.color || '#f59e0b');
    bgGrad.addColorStop(1, '#ef4444');
    ctx.fillStyle = bgGrad;

    ctx.beginPath();
    ctx.roundRect(-textWidth / 2 - padX, -padY - 14, textWidth + padX * 2, padY * 2 + 28, 24);
    ctx.fill();

    // Border
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text with crisp contrast
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(displayText, 0, 0);

    ctx.restore();
  }

  private drawWatermark(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.textAlign = 'right';
    ctx.fillText('⚡ AutoCut AI', width - 24, height - 24);
    ctx.restore();
  }

  private drawEmptyState(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#64748b';
    ctx.font = '600 18px "Plus Jakarta Sans"';
    ctx.textAlign = 'center';
    ctx.fillText('Drop photos & videos to Auto-Cut', width / 2, height / 2);
  }
}

export const globalCanvasRenderer = new CanvasReelRenderer();
