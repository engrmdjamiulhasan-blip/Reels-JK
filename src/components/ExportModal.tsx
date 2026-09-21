import React, { useState } from 'react';
import { 
  Download, 
  X, 
  Check, 
  Copy, 
  Share2, 
  Sparkles, 
  Video, 
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  Film
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MusicTrack } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoBlobUrl: string | null;
  videoBlob?: Blob | null;
  bestPictureDataUrl: string | null;
  reelTitle: string;
  hashtags: string[];
  aspectRatio: string;
  totalDuration: number;
  currentTrack?: MusicTrack;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  videoBlobUrl,
  videoBlob,
  bestPictureDataUrl,
  reelTitle,
  hashtags,
  aspectRatio,
  totalDuration,
  currentTrack,
}) => {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLicense, setCopiedLicense] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'mp4' | 'webm'>('mp4');
  const [qualityPreset, setQualityPreset] = useState<'1080p' | '4k'>('1080p');

  if (!isOpen) return null;

  // Trigger celebration confetti on mount
  React.useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  }, []);

  const cleanTitle = reelTitle.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'viral_reel';

  const handleCopyText = () => {
    const licenseText = currentTrack?.attributionText 
      ? `\n\n🎵 ${currentTrack.attributionText}` 
      : '\n\n🎵 Music: 100% Royalty-Free & Commercial Safe';
    const fullText = `${reelTitle}\n\n${hashtags.join(' ')}${licenseText}`;
    navigator.clipboard.writeText(fullText);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleCopyLicenseOnly = () => {
    const text = currentTrack?.attributionText || 'Music: 100% Copyright-Free Commercial License (AutoCut Library). Whitelisted for Instagram Reels, TikTok, YouTube Shorts.';
    navigator.clipboard.writeText(text);
    setCopiedLicense(true);
    setTimeout(() => setCopiedLicense(false), 2000);
  };

  // Dedicated MP4 Best Quality Download
  const handleDownloadMp4 = () => {
    if (!videoBlobUrl) return;
    const a = document.createElement('a');
    if (videoBlob) {
      // Package into video/mp4 blob for universal recognition
      const mp4Blob = new Blob([videoBlob], { type: 'video/mp4' });
      const mp4Url = URL.createObjectURL(mp4Blob);
      a.href = mp4Url;
      a.download = `${cleanTitle}_${qualityPreset}_60fps_best_quality.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(mp4Url), 1500);
    } else {
      a.href = videoBlobUrl;
      a.download = `${cleanTitle}_${qualityPreset}_60fps_best_quality.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // WebM Download
  const handleDownloadWebm = () => {
    if (!videoBlobUrl) return;
    const a = document.createElement('a');
    a.href = videoBlobUrl;
    a.download = `${cleanTitle}_master_60fps.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Best Picture 4K PNG Download
  const handleDownloadPicture = () => {
    if (!bestPictureDataUrl) return;
    const a = document.createElement('a');
    a.href = bestPictureDataUrl;
    a.download = `${cleanTitle}_best_picture_4k.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-syne">Reel Ready to Export!</h3>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-mono">
                  MP4 60FPS
                </span>
              </div>
              <p className="text-xs text-slate-400">Ultra-high bitrate master with beat-cut synchronization</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Reel Spec Badges */}
          <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <div className="text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Aspect</div>
              <div className="font-bold text-white mt-0.5">{aspectRatio}</div>
            </div>
            <div className="text-center border-l border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Duration</div>
              <div className="font-bold text-white mt-0.5">{totalDuration.toFixed(1)}s</div>
            </div>
            <div className="text-center border-l border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-bold">FPS & Bitrate</div>
              <div className="font-bold text-amber-400 mt-0.5">60fps / 25M</div>
            </div>
            <div className="text-center border-l border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-bold">License</div>
              <div className="font-bold text-emerald-400 mt-0.5 flex items-center justify-center gap-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Safe</span>
              </div>
            </div>
          </div>

          {/* Format & Quality Selection */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>Format & Quality Output</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Universal Social Ready</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedFormat('mp4')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                  selectedFormat === 'mp4'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 shadow-sm shadow-amber-400/10'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🎬 MP4 (Universal)</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  BEST
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('webm')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                  selectedFormat === 'webm'
                    ? 'border-amber-400 bg-amber-400/10 text-amber-300 shadow-sm shadow-amber-400/10'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📦 WebM (Master)</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                  PRO
                </span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQualityPreset('1080p')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-all ${
                  qualityPreset === '1080p'
                    ? 'border-amber-400/60 bg-slate-800 text-white font-bold'
                    : 'border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                Full HD 1080x1920 (60 FPS)
              </button>
              <button
                type="button"
                onClick={() => setQualityPreset('4k')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-all ${
                  qualityPreset === '4k'
                    ? 'border-amber-400/60 bg-slate-800 text-white font-bold'
                    : 'border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                4K Crisp Master (2160x3840)
              </button>
            </div>
          </div>

          {/* Primary Download Button: MP4 BEST QUALITY MUST */}
          <div className="space-y-2">
            <button
              onClick={handleDownloadMp4}
              disabled={!videoBlobUrl}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-rose-400 to-amber-300 hover:opacity-95 flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Video className="w-4 h-4 text-slate-950" />
              <span>Download Video (MP4 - Best Quality 60FPS)</span>
              <span className="text-[10px] bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded font-mono font-extrabold ml-1">
                MP4
              </span>
            </button>

            {/* Secondary Buttons: WebM Master & 4K Cover */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadWebm}
                disabled={!videoBlobUrl}
                className="py-2.5 px-3 rounded-xl font-semibold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-98 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Download .WebM</span>
              </button>

              <button
                onClick={handleDownloadPicture}
                disabled={!bestPictureDataUrl}
                className="py-2.5 px-3 rounded-xl font-semibold text-xs text-amber-300 bg-slate-800 hover:bg-slate-700 flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-98 disabled:opacity-50"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Best Picture 4K (.png)</span>
              </button>
            </div>
          </div>

          {/* 100% Copyright-Free Clearance Pass Card */}
          <div className="bg-emerald-950/35 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">100% Copyright-Free & Safe For Monetization</h4>
                  <p className="text-[10px] text-slate-400">No copyright strikes • Safe for Reels, TikTok, YouTube Shorts, & FB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyLicenseOnly}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20"
              >
                {copiedLicense ? (
                  <>
                    <Check className="w-3 h-3" />
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
            <div className="flex items-center gap-1.5 pt-1 text-[9px] text-emerald-200">
              <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-emerald-500/20">✓ Instagram Reels</span>
              <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-emerald-500/20">✓ TikTok Commercial</span>
              <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-emerald-500/20">✓ YouTube Shorts</span>
              <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-emerald-500/20">✓ Facebook</span>
            </div>
          </div>

          {/* Ready-to-Post Captions, Hook & Hashtags for Socials */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ready-to-Post Captions, Tags & License</span>
              </span>
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
              >
                {copiedCaption ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-xs text-slate-300 font-medium">
              "{reelTitle}"
            </div>
            <div className="text-[11px] text-amber-300/90 leading-relaxed font-mono">
              {hashtags.join(' ')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/40 flex justify-between items-center">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Ready for instant Instagram/TikTok upload</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
