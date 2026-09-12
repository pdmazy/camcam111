import React from 'react';
import { 
  Sun, 
  Moon, 
  Cloud, 
  Smartphone, 
  ShieldCheck, 
  FolderLock
} from 'lucide-react';
import appIconImg from '../assets/images/scanner_app_icon_1789252062280.jpg';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSync: () => void;
  onOpenAndroidInfo: () => void;
  onOpenSecurity: () => void;
  activeDocCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenSync,
  onOpenAndroidInfo,
  onOpenSecurity,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* App Title & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md ring-1 ring-emerald-500/20 bg-emerald-700 flex-shrink-0">
            <img 
              src={appIconImg} 
              alt="آیکون فتوکپی هوشمند" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                فتوکپی و اسکنر هوشمند
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                API 34 • آفلاین
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تبدیل تصاویر مدارک به نسخه فتوکپی رسمی با تشخیص لبه
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cloud Sync Button */}
          <button
            id="header-cloud-sync-btn"
            onClick={onOpenSync}
            title="پشتیبان‌گیری و سینک ابری"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition flex items-center gap-1.5 text-xs font-medium"
          >
            <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">سینک ابری</span>
          </button>

          {/* Android API 34 & GitHub Action Info */}
          <button
            id="header-android-info-btn"
            onClick={onOpenAndroidInfo}
            title="مشخصات انتشار در بازار، مایکت و گیت‌هاب اکشن"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition flex items-center gap-1.5 text-xs font-medium"
          >
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline">نسخه اندروید (بازار/مایکت)</span>
          </button>

          {/* Privacy & Security Modal */}
          <button
            id="header-privacy-btn"
            onClick={onOpenSecurity}
            title="امنیت داده‌ها و حریم خصوصی آفلاین"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            id="header-theme-toggle-btn"
            onClick={onToggleDarkMode}
            title={darkMode ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
