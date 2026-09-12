import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CornerPoints, Point } from '../types';
import { detectDocumentCorners, rotateCanvas, createCanvas } from '../utils/imageProcessing';
import { RotateCw, Sparkles, Maximize2, Check, X, Move } from 'lucide-react';

interface CropEditorProps {
  imageSrc: string;
  initialCorners?: CornerPoints;
  onConfirm: (corners: CornerPoints, rotatedImageSrc: string) => void;
  onCancel: () => void;
}

type CornerKey = 'tl' | 'tr' | 'br' | 'bl';

export const CropEditor: React.FC<CropEditorProps> = ({
  imageSrc,
  initialCorners,
  onConfirm,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imgNaturalSize, setImgNaturalSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [displaySize, setDisplaySize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(imageSrc);
  
  const [corners, setCorners] = useState<CornerPoints>({
    tl: { x: 0, y: 0 },
    tr: { x: 0, y: 0 },
    br: { x: 0, y: 0 },
    bl: { x: 0, y: 0 },
  });

  const [activeCorner, setActiveCorner] = useState<CornerKey | null>(null);
  const [loupePoint, setLoupePoint] = useState<Point | null>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize corners when image loads or changes
  const initCorners = useCallback((img: HTMLImageElement) => {
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setImgNaturalSize({ w: nw, h: nh });

    if (initialCorners) {
      setCorners(initialCorners);
    } else {
      // Run automatic edge detection
      const detected = detectDocumentCorners(img);
      setCorners(detected);
    }
  }, [initialCorners]);

  // Update display dimensions on window resize
  const updateDisplaySize = useCallback(() => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      setDisplaySize({ w: rect.width, h: rect.height });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateDisplaySize);
    return () => window.removeEventListener('resize', updateDisplaySize);
  }, [updateDisplaySize]);

  // Transform coordinates between natural image space and display space
  const naturalToDisplay = (pt: Point): Point => {
    if (!imgNaturalSize.w || !displaySize.w) return { x: 0, y: 0 };
    const scaleX = displaySize.w / imgNaturalSize.w;
    const scaleY = displaySize.h / imgNaturalSize.h;
    return {
      x: pt.x * scaleX,
      y: pt.y * scaleY,
    };
  };

  const displayToNatural = (pt: Point): Point => {
    if (!displaySize.w || !imgNaturalSize.w) return { x: 0, y: 0 };
    const scaleX = imgNaturalSize.w / displaySize.w;
    const scaleY = imgNaturalSize.h / displaySize.h;
    return {
      x: Math.max(0, Math.min(imgNaturalSize.w, Math.round(pt.x * scaleX))),
      y: Math.max(0, Math.min(imgNaturalSize.h, Math.round(pt.y * scaleY))),
    };
  };

  // Magnifier Loupe rendering
  useEffect(() => {
    if (!activeCorner || !loupePoint || !imageRef.current || !loupeCanvasRef.current) return;
    const canvas = loupeCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const zoom = 2.5;
    const loupeSize = canvas.width; // e.g. 110px
    const half = loupeSize / 2;

    ctx.clearRect(0, 0, loupeSize, loupeSize);

    // Source coordinates on natural image
    const sx = loupePoint.x - (half / zoom);
    const sy = loupePoint.y - (half / zoom);
    const sWidth = loupeSize / zoom;
    const sHeight = loupeSize / zoom;

    ctx.drawImage(imageRef.current, sx, sy, sWidth, sHeight, 0, 0, loupeSize, loupeSize);

    // Draw crosshair
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(half, 0);
    ctx.lineTo(half, loupeSize);
    ctx.moveTo(0, half);
    ctx.lineTo(loupeSize, half);
    ctx.stroke();

    // Border ring
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(half, half, half - 2, 0, Math.PI * 2);
    ctx.stroke();
  }, [activeCorner, loupePoint]);

  // Pointer drag events for corner manipulation
  const handlePointerDown = (cornerKey: CornerKey, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setActiveCorner(cornerKey);
    setLoupePoint(corners[cornerKey]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeCorner || !containerRef.current) return;
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const naturalPt = displayToNatural({ x: clientX, y: clientY });
    setCorners((prev) => ({
      ...prev,
      [activeCorner]: naturalPt,
    }));
    setLoupePoint(naturalPt);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeCorner) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setActiveCorner(null);
      setLoupePoint(null);
    }
  };

  // Re-run edge detection
  const handleAutoDetect = () => {
    if (!imageRef.current) return;
    const detected = detectDocumentCorners(imageRef.current);
    setCorners(detected);
  };

  // Reset to full bounds
  const handleResetFull = () => {
    if (!imgNaturalSize.w) return;
    const margin = Math.round(imgNaturalSize.w * 0.02);
    setCorners({
      tl: { x: margin, y: margin },
      tr: { x: imgNaturalSize.w - margin, y: margin },
      br: { x: imgNaturalSize.w - margin, y: imgNaturalSize.h - margin },
      bl: { x: margin, y: imgNaturalSize.h - margin },
    });
  };

  // Rotate 90 degrees
  const handleRotate = () => {
    if (!imageRef.current) return;
    const canvas = createCanvas(imageRef.current.naturalWidth, imageRef.current.naturalHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(imageRef.current, 0, 0);

    const rotated = rotateCanvas(canvas, 90);
    const newSrc = rotated.toDataURL('image/jpeg', 0.95);
    setCurrentImageSrc(newSrc);
  };

  // Convert corners to display coordinates for SVG
  const dTl = naturalToDisplay(corners.tl);
  const dTr = naturalToDisplay(corners.tr);
  const dBr = naturalToDisplay(corners.br);
  const dBl = naturalToDisplay(corners.bl);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-slate-900 text-white select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Move className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm">تنظیم لبه‌ها و برش سند</span>
        </div>
        <div className="text-xs text-slate-400">
          نقاط چهارگوشه را روی لبه‌های مدرک تنظیم کنید
        </div>
      </div>

      {/* Main Image Area with Overlay */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden bg-slate-950/60 min-h-[380px]">
        <div 
          ref={containerRef} 
          className="relative inline-block touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Base Image */}
          <img
            ref={imageRef}
            src={currentImageSrc}
            alt="برش سند"
            referrerPolicy="no-referrer"
            className="max-h-[60vh] max-w-full w-auto object-contain rounded-lg shadow-2xl block mx-auto"
            onLoad={(e) => {
              initCorners(e.currentTarget);
              updateDisplaySize();
            }}
          />

          {/* SVG Overlay for Polygons & Mask */}
          {displaySize.w > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${displaySize.w} ${displaySize.h}`}
            >
              {/* Outer darkened mask with cutout for document */}
              <defs>
                <mask id="doc-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <polygon
                    points={`${dTl.x},${dTl.y} ${dTr.x},${dTr.y} ${dBr.x},${dBr.y} ${dBl.x},${dBl.y}`}
                    fill="black"
                  />
                </mask>
              </defs>

              <rect
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.6)"
                mask="url(#doc-mask)"
              />

              {/* Document Quad Border */}
              <polygon
                points={`${dTl.x},${dTl.y} ${dTr.x},${dTr.y} ${dBr.x},${dBr.y} ${dBl.x},${dBl.y}`}
                fill="rgba(16, 185, 129, 0.12)"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />

              {/* Guidelines diagonals */}
              <line x1={dTl.x} y1={dTl.y} x2={dBr.x} y2={dBr.y} stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1" strokeDasharray="2 2" />
              <line x1={dTr.x} y1={dTr.y} x2={dBl.x} y2={dBl.y} stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1" strokeDasharray="2 2" />
            </svg>
          )}

          {/* Interactive 4 Corner Handles */}
          {displaySize.w > 0 && (
            <>
              {(
                [
                  { key: 'tl', pt: dTl, label: 'بالا چپ' },
                  { key: 'tr', pt: dTr, label: 'بالا راست' },
                  { key: 'br', pt: dBr, label: 'پایین راست' },
                  { key: 'bl', pt: dBl, label: 'پایین چپ' },
                ] as const
              ).map(({ key, pt, label }) => (
                <div
                  key={key}
                  id={`corner-handle-${key}`}
                  onPointerDown={(e) => handlePointerDown(key, e)}
                  style={{
                    transform: `translate(${pt.x}px, ${pt.y}px) translate(-50%, -50%)`,
                  }}
                  className="absolute z-20 cursor-grab active:cursor-grabbing touch-none p-3 -m-3 flex items-center justify-center group"
                >
                  <div className={`w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-transform ${
                    activeCorner === key ? 'scale-125 bg-emerald-400 ring-4 ring-emerald-500/40' : 'bg-emerald-600 group-hover:scale-110'
                  }`}>
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Magnifier Loupe Floating Display */}
          {activeCorner && (
            <div className="absolute top-2 left-2 z-30 pointer-events-none rounded-full overflow-hidden border-2 border-white shadow-2xl bg-black">
              <canvas
                ref={loupeCanvasRef}
                width={120}
                height={120}
                className="w-28 h-28 block"
              />
            </div>
          )}
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4">
        <div className="max-w-xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Auxiliary Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="crop-auto-detect-btn"
              onClick={handleAutoDetect}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="تشخیص خودکار لبه‌های کاغذ و مدرک"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>تشخیص خودکار</span>
            </button>

            <button
              id="crop-reset-full-btn"
              onClick={handleResetFull}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="گسترش کادر به کل تصویر"
            >
              <Maximize2 className="w-4 h-4 text-blue-400" />
              <span>تمام کادر</span>
            </button>

            <button
              id="crop-rotate-btn"
              onClick={handleRotate}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="چرخش تصویر ۹۰ درجه"
            >
              <RotateCw className="w-4 h-4 text-teal-400" />
              <span>چرخش</span>
            </button>
          </div>

          {/* Confirmation & Cancel */}
          <div className="flex items-center gap-2">
            <button
              id="crop-cancel-btn"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <X className="w-4 h-4" />
              <span>انصراف</span>
            </button>

            <button
              id="crop-confirm-btn"
              onClick={() => onConfirm(corners, currentImageSrc)}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition"
            >
              <Check className="w-4 h-4" />
              <span>تایید و اعمال فیلتر</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
