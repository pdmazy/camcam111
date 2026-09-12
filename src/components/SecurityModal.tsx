import React from 'react';
import { ShieldCheck, Lock, EyeOff, WifiOff, Database, Check, X } from 'lucide-react';

interface SecurityModalProps {
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                امنیت و حفظ کامل حریم خصوصی
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                طراحی شده با معماری پردازش محلی ۱۰۰٪ آفلاین
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 text-xs leading-relaxed">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-slate-200 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-800 dark:text-emerald-300 block mb-1 text-sm">
                هیچ تصویری از دستگاه شما خارج نمی‌شود
              </strong>
              مدارک هویتی نظیر کارت ملی، شناسنامه، قراردادها و اسناد بانکی حاوی محرمانه‌ترین اطلاعات شما هستند. تمام الگوریتم‌های تشخیص لبه، تبدیل به فتوکپی و تولید PDF تماماً روی پردازنده گوشی اجرا می‌گردند.
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <WifiOff className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block">
                  عدم نیاز به اینترنت و بدون هوش مصنوعی ابری
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  بر خلاف سایر برنامه‌ها، برای اسکن و فتوکپی نیازی به اینترنت، مصرف حجم دیتا یا اشتراک ماهیانه ندارید.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <Database className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block">
                  ذخیره‌سازی ایزوله در IndexedDB
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  پایگاه داده اسناد در محیط ایزوله سندباکس اپلیکیشن نگهداری می‌شود و هیچ برنامه دیگری به فایل‌های موقت دسترسی ندارد.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <EyeOff className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 block">
                  عدم وجود تبلیغات و ردیاب‌های تجاری
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  این نسخه فاقد هرگونه کتابخانه رهگیری، تبلیغات مزاحم یا دسترسی به مخاطبین و موقعیت مکانی است.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs transition"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
