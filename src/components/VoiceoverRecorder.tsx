import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Volume2, AlertCircle } from 'lucide-react';

interface VoiceoverRecorderProps {
  voiceoverUrl?: string;
  voiceoverVolume: number;
  onVoiceoverRecorded: (audioUrl: string, blob: Blob) => void;
  onVoiceoverRemoved: () => void;
  onVolumeChange: (vol: number) => void;
}

export const VoiceoverRecorder: React.FC<VoiceoverRecorderProps> = ({
  voiceoverUrl,
  voiceoverVolume,
  onVoiceoverRecorded,
  onVoiceoverRemoved,
  onVolumeChange,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const startCountdownAndRecord = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start 3-second countdown
      setCountdown(3);
      let count = 3;
      const countInterval = window.setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(countInterval);
          setCountdown(null);
          beginRecording(stream);
        }
      }, 800);
    } catch (err) {
      console.error('Mic access error:', err);
      setErrorMsg('Microphone access denied or not supported in this frame. Check browser permissions.');
    }
  };

  const beginRecording = (stream: MediaStream) => {
    try {
      // Audio level analyser
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length / 255;
        setAudioLevel(avg);
        animFrameRef.current = requestAnimationFrame(checkLevel);
      };
      animFrameRef.current = requestAnimationFrame(checkLevel);

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm') && MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        onVoiceoverRecorded(audioUrl, audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setAudioLevel(0);
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Recording initialization error:', err);
      setErrorMsg('Failed to start recording audio stream.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const togglePlayPreview = () => {
    if (!voiceoverUrl) return;

    if (isPlayingPreview) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setIsPlayingPreview(false);
    } else {
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(voiceoverUrl);
        previewAudioRef.current.onended = () => setIsPlayingPreview(false);
      } else {
        previewAudioRef.current.src = voiceoverUrl;
      }
      previewAudioRef.current.volume = voiceoverVolume;
      previewAudioRef.current.play().catch(() => {});
      setIsPlayingPreview(true);
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-rose-400" />
          <span>Voiceover Microphone Recorder</span>
        </span>
        {isRecording && (
          <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400 font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            REC {recordSeconds}s
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-start gap-1.5 p-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-[11px] text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="py-4 text-center">
          <div className="text-3xl font-extrabold text-amber-400 animate-ping font-syne">
            {countdown}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Get ready to speak...</div>
        </div>
      )}

      {/* Controls & State */}
      {countdown === null && (
        <>
          {!isRecording && !voiceoverUrl && (
            <button
              onClick={startCountdownAndRecord}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-950/50 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>Record Voiceover</span>
            </button>
          )}

          {isRecording && (
            <div className="space-y-2">
              {/* Live VU Meter */}
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${Math.min(100, audioLevel * 180)}%` }}
                  className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-75"
                />
              </div>

              <button
                onClick={stopRecording}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 flex items-center justify-center gap-2 border border-slate-700"
              >
                <Square className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>Stop & Save Voiceover</span>
              </button>
            </div>
          )}

          {/* Voiceover preview player if recorded */}
          {voiceoverUrl && !isRecording && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <button
                  onClick={togglePlayPreview}
                  className="flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-amber-200"
                >
                  {isPlayingPreview ? (
                    <Pause className="w-4 h-4 fill-amber-300" />
                  ) : (
                    <Play className="w-4 h-4 fill-amber-300" />
                  )}
                  <span>{isPlayingPreview ? 'Pause Preview' : 'Listen to Voiceover'}</span>
                </button>

                <button
                  onClick={onVoiceoverRemoved}
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete voiceover"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Volume Balance Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-amber-400" />
                    <span>Voiceover Volume</span>
                  </span>
                  <span className="font-mono text-slate-200 font-bold">
                    {Math.round(voiceoverVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={voiceoverVolume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
