import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, SwitchCamera, Upload, Sparkles, AlertCircle, X } from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../utils/sampleDocuments';

interface CameraViewProps {
  onCapture: (imageSrc: string) => void;
  onClose?: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCamera(false);
        setCameraError('دوربین در این مرورگر پشتیبانی نمی‌شود یا دسترسی محدود است.');
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setIsCameraActive(false);
      setCameraError('امکان دسترسی به دوربین وجود ندارد (لطفا دسترسی دوربین را تایید کرده یا از گالری فایل انتخاب کنید).');
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // Capture current video frame
  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    onCapture(dataUrl);
  };

  // Flip camera
  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        onCapture(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === 'string') {
          onCapture(ev.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="relative flex flex-col h-full max-w-4xl mx-auto bg-slate-950 text-white select-none rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm">اسکن مدارک شناسایی و اسناد</span>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Viewfinder area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black min-h-[380px]">
        {/* Live video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : 'block'}`}
        />

        {/* Framing Guides Overlay on Live Video */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 sm:p-12">
            <div className="relative w-full max-w-md aspect-[3/2] border-2 border-dashed border-emerald-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
              {/* Corner markers */}
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />

              <div className="absolute inset-x-0 bottom-3 text-center">
                <span className="text-xs bg-slate-900/80 text-emerald-300 px-3 py-1 rounded-full backdrop-blur-sm border border-emerald-500/30">
                  مدرک را داخل کادر قرار دهید
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Fallback & Upload Prompt when camera is inactive or denied */}
        {(!isCameraActive || cameraError) && (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto z-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
              <Camera className="w-8 h-8" />
            </div>

            <h3 className="font-bold text-base text-slate-100 mb-1">
              انتخاب عکس سند یا استفاده از دوربین
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              می‌توانید مستقیماً تصویری را از گالری انتخاب نمایید یا از نمونه مدارک آماده برای تست برنامه استفاده کنید.
            </p>

            {cameraError && (
              <div className="w-full mb-4 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2 text-right">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>{cameraError}</span>
              </div>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition mb-3"
            >
              <Upload className="w-4 h-4" />
              <span>انتخاب عکس از گالری یا فایل‌ها</span>
            </button>
          </div>
        )}

        {/* Drag & Drop Visual Indicator */}
        {isDragging && (
          <div className="absolute inset-0 bg-emerald-950/80 border-4 border-dashed border-emerald-400 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
            <Upload className="w-12 h-12 text-emerald-400 animate-bounce mb-2" />
            <span className="text-sm font-bold text-white">تصویر را اینجا رها کنید</span>
          </div>
        )}
      </div>

      {/* Sample Documents Quick Testing Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>آزمایش سریع با مدارک نمونه شبیه‌سازی‌شده:</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onCapture(sample.generate())}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-right transition group"
            >
              <div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition">
                  {sample.name}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">
                  {sample.description}
                </div>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full flex-shrink-0">
                تست فوری
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Camera Controls Bar */}
      <div className="bg-slate-950 border-t border-slate-800 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          {/* Gallery upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex flex-col items-center gap-1"
            title="انتخاب از گالری"
          >
            <Upload className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-medium">گالری</span>
          </button>

          {/* Shutter Button */}
          {isCameraActive ? (
            <button
              id="shutter-capture-btn"
              onClick={handleSnap}
              className="w-16 h-16 rounded-full border-4 border-emerald-500 bg-white hover:bg-slate-100 flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95 transition"
              title="عکس گرفتن"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                <Camera className="w-6 h-6" />
              </div>
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <Camera className="w-4 h-4" />
              <span>تلاش مجدد دوربین</span>
            </button>
          )}

          {/* Flip camera */}
          <button
            onClick={handleSwitchCamera}
            disabled={!isCameraActive}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex flex-col items-center gap-1 disabled:opacity-40"
            title="تغییر دوربین جلو/عقب"
          >
            <SwitchCamera className="w-5 h-5 text-blue-400" />
            <span className="text-[10px] font-medium">چرخش</span>
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};
