import React, { useState } from 'react';
import { Camera, X, Download, Sparkles, Check, Wand2, Sliders } from 'lucide-react';

interface BestPictureStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  pictureDataUrl?: string | null;
  imageUrl?: string | null;
  reelTitle?: string;
  imageName?: string;
}

export const BestPictureStudioModal: React.FC<BestPictureStudioModalProps> = ({
  isOpen,
  onClose,
  pictureDataUrl,
  imageUrl,
  reelTitle,
  imageName,
}) => {
  const [frameStyle, setFrameStyle] = useState<'cinema' | 'polaroid' | 'clean'>('cinema');
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedBadge, setEnhancedBadge] = useState(false);

  const activePicture = pictureDataUrl || imageUrl;
  const activeTitle = reelTitle || imageName || 'AutoCut Best Picture';

  if (!isOpen || !activePicture) return null;

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activePicture;
    img.onload = () => {
      const padding = frameStyle === 'polaroid' ? 60 : frameStyle === 'cinema' ? 40 : 0;
      const bottomExtra = frameStyle === 'polaroid' ? 140 : 0;

      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2 + bottomExtra;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      if (frameStyle === 'polaroid') {
        ctx.fillStyle = '#fdfbf7';
      } else if (frameStyle === 'cinema') {
        ctx.fillStyle = '#05070d';
      } else {
        ctx.fillStyle = '#000000';
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw photo
      ctx.drawImage(img, padding, padding, img.width, img.height);

      // Draw timestamp / title text
      if (frameStyle === 'polaroid') {
        ctx.fillStyle = '#1e293b';
        ctx.font = '700 36px "Syne", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(activeTitle, canvas.width / 2, canvas.height - 70);

        if (showTimestamp) {
          ctx.fillStyle = '#64748b';
          ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(currentDateStr, canvas.width / 2, canvas.height - 30);
        }
      } else if (frameStyle === 'cinema' && showTimestamp) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${currentDateStr} • AutoCut AI`, canvas.width - padding - 20, canvas.height - padding - 20);
      }

      const dlUrl = canvas.toDataURL('image/png', 1.0);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = `${activeTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_portrait.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
  };

  const handleAiAutoEnhance = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      setIsEnhancing(false);
      setEnhancedBadge(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-syne">Best Picture 4K Studio</h3>
              <p className="text-[11px] text-slate-400">High-resolution frame ready for Instagram feed or wallpaper</p>
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
        <div className="p-5 space-y-4">
          {/* Picture Preview */}
          <div className="relative max-h-[380px] flex items-center justify-center bg-black/80 rounded-xl overflow-hidden border border-slate-800 p-2">
            <div
              className={`transition-all duration-200 shadow-2xl overflow-hidden ${
                frameStyle === 'polaroid'
                  ? 'bg-[#fdfbf7] p-3 pb-10 text-slate-900 rounded-sm'
                  : frameStyle === 'cinema'
                  ? 'bg-slate-950 p-2.5 rounded-xl border border-slate-800'
                  : 'rounded-lg'
              }`}
            >
              <img
                src={activePicture}
                alt="Captured Best Shot"
                className={`max-h-[290px] object-contain mx-auto ${enhancedBadge ? 'brightness-105 contrast-110 saturate-120' : ''}`}
              />
              {frameStyle === 'polaroid' && (
                <div className="text-center mt-2">
                  <div className="text-xs font-bold font-syne text-slate-900 truncate max-w-[200px] mx-auto">
                    {activeTitle}
                  </div>
                  {showTimestamp && (
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {currentDateStr}
                    </div>
                  )}
                </div>
              )}
            </div>

            {enhancedBadge && (
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold shadow-md shadow-amber-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>AI Auto-Enhanced</span>
              </div>
            )}
          </div>

          {/* Frame Style Options */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFrameStyle('cinema')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                frameStyle === 'cinema'
                  ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              🎬 Cinema Frame
            </button>

            <button
              onClick={() => setFrameStyle('polaroid')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                frameStyle === 'polaroid'
                  ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              📷 35mm Polaroid
            </button>

            <button
              onClick={() => setFrameStyle('clean')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                frameStyle === 'clean'
                  ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              ✨ Pure Borderless
            </button>
          </div>

          {/* Quick AI Enhance & Timestamp switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <button
              onClick={handleAiAutoEnhance}
              disabled={isEnhancing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-300 hover:text-white font-medium transition-all"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
              <span>{isEnhancing ? 'Enhancing...' : '1-Click AI Auto-Enhance'}</span>
            </button>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <span>Date Stamp</span>
              <input
                type="checkbox"
                checked={showTimestamp}
                onChange={(e) => setShowTimestamp(e.target.checked)}
                className="accent-amber-400 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>

          {/* Action Download */}
          <button
            onClick={handleDownload}
            className="w-full py-3 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-rose-400 hover:opacity-95 shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Ultra-HD Picture (.png)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
