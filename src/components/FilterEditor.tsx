import React, { useState, useEffect, useRef } from 'react';
import { CornerPoints, FilterType } from '../types';
import { warpPerspective, applyFilter, rotateCanvas, loadImage, createCanvas } from '../utils/imageProcessing';
import { 
  FileText, 
  Palette, 
  Printer, 
  CreditCard, 
  Sparkles, 
  Image as ImageIcon, 
  SunMedium, 
  Contrast, 
  RotateCw, 
  ArrowRight, 
  Check, 
  Eye, 
  SlidersHorizontal 
} from 'lucide-react';

interface FilterEditorProps {
  imageSrc: string;
  corners: CornerPoints;
  initialFilter?: FilterType;
  onSave: (processedDataUrl: string, warpedDataUrl: string, filter: FilterType, brightness: number, contrast: number, rotation: number) => void;
  onBackToCrop: () => void;
}

const FILTERS: { type: FilterType; label: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
  {
    type: 'photocopy_bw',
    label: 'فتوکپی سیاه و سفید',
    desc: 'کنتراست بالا، حذف کامل سایه و پس‌زمینه تمیز مانند دستگاه کپی',
    icon: Printer,
  },
  {
    type: 'color_enhanced',
    label: 'اسکن رنگی اسناد',
    desc: 'سفیدسازی کاغذ همراه با حفظ رنگ اصلی مهر، امضا و عکس',
    icon: Palette,
  },
  {
    type: 'grayscale',
    label: 'اسکن خاکستری',
    desc: 'حالت استاندارد خاکستری با تفکیک واضح فونت‌ها و نوشته‌ها',
    icon: FileText,
  },
  {
    type: 'id_card',
    label: 'کارت ملی و شناسنامه',
    desc: 'تنظیم تخصصی جهت وضوح کد ملی، پرتره و الگوهای امنیتی کارت',
    icon: CreditCard,
  },
  {
    type: 'magic_color',
    label: 'تمیزکاری جادویی',
    desc: 'تعدیل خودکار نور و محو کردن تیرگی‌های ناخواسته محیط',
    icon: Sparkles,
  },
  {
    type: 'original',
    label: 'رنگ اصلی',
    desc: 'حفظ رنگ اولیه مدرک بدون اعمال فیلتر',
    icon: ImageIcon,
  },
];

export const FilterEditor: React.FC<FilterEditorProps> = ({
  imageSrc,
  corners,
  initialFilter = 'photocopy_bw',
  onSave,
  onBackToCrop,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter);
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [isComparingOriginal, setIsComparingOriginal] = useState<boolean>(false);
  const [showSliders, setShowSliders] = useState<boolean>(false);

  // Cached canvases
  const warpedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [warpedUrl, setWarpedUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(true);

  // 1. Warp perspective initially or when rotation changes
  useEffect(() => {
    let isMounted = true;
    setIsProcessing(true);

    loadImage(imageSrc).then((img) => {
      if (!isMounted) return;
      let warped = warpPerspective(img, corners);
      if (rotation !== 0) {
        warped = rotateCanvas(warped, rotation);
      }
      warpedCanvasRef.current = warped;
      const wUrl = warped.toDataURL('image/jpeg', 0.95);
      setWarpedUrl(wUrl);

      // Apply initial filter
      const filtered = applyFilter(warped, activeFilter, brightness, contrast);
      setPreviewUrl(filtered.toDataURL('image/jpeg', 0.95));
      setIsProcessing(false);
    });

    return () => {
      isMounted = false;
    };
  }, [imageSrc, corners, rotation]);

  // 2. Re-apply filter when settings change
  useEffect(() => {
    if (!warpedCanvasRef.current) return;
    const filtered = applyFilter(warpedCanvasRef.current, activeFilter, brightness, contrast);
    setPreviewUrl(filtered.toDataURL('image/jpeg', 0.95));
  }, [activeFilter, brightness, contrast]);

  // Rotate handler
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSave = () => {
    if (!previewUrl || !warpedUrl) return;
    onSave(previewUrl, warpedUrl, activeFilter, brightness, contrast, rotation);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-slate-900 text-white select-none">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <button
          onClick={onBackToCrop}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>ویرایش لبه‌ها</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Compare toggle */}
          <button
            onMouseDown={() => setIsComparingOriginal(true)}
            onMouseUp={() => setIsComparingOriginal(false)}
            onTouchStart={() => setIsComparingOriginal(true)}
            onTouchEnd={() => setIsComparingOriginal(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              isComparingOriginal ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="نگه‌دارید تا تصویر اصلی قبل از فیلتر را ببینید"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">مقایسه با اصل</span>
          </button>

          {/* Sliders toggle */}
          <button
            onClick={() => setShowSliders(!showSliders)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              showSliders ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>تنظیم دستی</span>
          </button>

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="چرخش ۹۰ درجه"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>تایید و ذخیره</span>
        </button>
      </div>

      {/* Main Preview Screen */}
      <div className="relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-slate-950/60 min-h-[350px]">
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">در حال پردازش و اصلاح پرسپکتیو...</span>
          </div>
        ) : (
          <div className="relative max-h-[55vh] max-w-full flex items-center justify-center">
            <img
              src={isComparingOriginal ? warpedUrl : previewUrl}
              alt="پیش‌نمایش فتوکپی"
              referrerPolicy="no-referrer"
              className="max-h-[55vh] max-w-full w-auto object-contain rounded-lg shadow-2xl border border-slate-700/50"
            />
            {isComparingOriginal && (
              <div className="absolute top-3 left-3 bg-amber-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md backdrop-blur-sm">
                تصویر اولیه
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Fine-Tuning Sliders (collapsible) */}
      {showSliders && (
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
          {/* Brightness */}
          <div className="flex items-center gap-3 w-full sm:w-64">
            <SunMedium className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="w-16 text-slate-400">روشنایی:</span>
            <input
              type="range"
              min="-40"
              max="40"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <span className="w-8 text-left font-mono text-slate-400">{brightness}</span>
          </div>

          {/* Contrast */}
          <div className="flex items-center gap-3 w-full sm:w-64">
            <Contrast className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="w-16 text-slate-400">کنتراست:</span>
            <input
              type="range"
              min="-40"
              max="40"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <span className="w-8 text-left font-mono text-slate-400">{contrast}</span>
          </div>

          <button
            onClick={() => {
              setBrightness(0);
              setContrast(0);
            }}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 underline transition"
          >
            بازنشانی
          </button>
        </div>
      )}

      {/* Filter Presets Grid */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4">
        <div className="text-xs font-semibold text-slate-400 mb-2.5 px-1">
          حالت فیلتر فتوکپی و اسکن:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {FILTERS.map((item) => {
            const Icon = item.icon;
            const isSelected = activeFilter === item.type;
            return (
              <button
                key={item.type}
                id={`filter-btn-${item.type}`}
                onClick={() => setActiveFilter(item.type)}
                className={`p-2.5 rounded-xl text-right transition flex flex-col gap-1 border relative overflow-hidden ${
                  isSelected
                    ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/30 text-white'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-emerald-400' : ''}`}>
                    {item.label}
                  </span>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                </div>
                <span className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mt-0.5">
                  {item.desc}
                </span>
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
