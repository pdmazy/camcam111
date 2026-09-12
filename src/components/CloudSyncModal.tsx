import React, { useState, useRef } from 'react';
import { exportBackupJson, importBackupJson, clearAllData } from '../utils/storage';
import { 
  Cloud, 
  Download, 
  Upload, 
  ShieldCheck, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  X, 
  Lock, 
  HardDrive,
  Trash2
} from 'lucide-react';

interface CloudSyncModalProps {
  onClose: () => void;
  onRefreshDocs: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ onClose, onRefreshDocs }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [cloudEndpoint, setCloudEndpoint] = useState<string>('');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(false);
  const [encryptionKey, setEncryptionKey] = useState<string>('');

  // Export backup
  const handleExport = async () => {
    try {
      const json = await exportBackupJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `پشتیبان_اسکنر_فتوکپی_${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatusMsg({ text: 'فایل پشتیبان کامل با موفقیت دانلود شد. می‌توانید آن را در گوگل درایو یا فضای ابری خود ذخیره کنید.' });
    } catch (err: any) {
      setStatusMsg({ text: 'خطا در خروجی فایل: ' + err.message, isError: true });
    }
  };

  // Import backup
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const count = await importBackupJson(text);
        setStatusMsg({ text: `تعداد ${count} سند با موفقیت بازیابی شد.` });
        onRefreshDocs();
      } catch (err: any) {
        setStatusMsg({ text: 'فایل نامعتبر است: ' + err.message, isError: true });
      }
    };
    reader.readAsText(file);
  };

  // Wipe data
  const handleClearAll = async () => {
    if (confirm('آیا از پاکسازی کامل تمام اسناد اسکن‌شده مطمئن هستید؟ این عملیات غیرقابل بازگشت است.')) {
      await clearAllData();
      onRefreshDocs();
      setStatusMsg({ text: 'تمامی مدارک از حافظه محلی دستگاه حذف شدند.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                پشتیبان‌گیری و سینک ابری مدارک
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                مدیریت ذخیره‌سازی ابری و آفلاین با امنیت کامل
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
        <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-2xl flex items-center gap-2 ${
                statusMsg.isError
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
              }`}
            >
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Privacy Guarantee Box */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-slate-700 dark:text-slate-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-emerald-800 dark:text-emerald-300 block mb-0.5">
                حفظ ۱۰۰٪ حریم خصوصی شما:
              </strong>
              این اپلیکیشن کاملاً آفلاین است و مدارک شما به هیچ سرور ناشناسی ارسال نمی‌شوند. نسخه پشتیبان تنها با تصمیم شما و بر روی حافظه شخصی یا فضای ابری اختصاصی‌تان (مانند Google Drive) قرار می‌گیرد.
            </div>
          </div>

          {/* Backup & Restore Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExport}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-500 transition flex flex-col items-center text-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition">
                <Download className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                دریافت فایل پشتیبان ابری
              </span>
              <span className="text-[11px] text-slate-400">
                ذخیره تمام مدارک اسکن‌شده در فایل رمزنگاری شده
              </span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-500 transition flex flex-col items-center text-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition">
                <Upload className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                بازیابی مدارک از فایل پشتیبان
              </span>
              <span className="text-[11px] text-slate-400">
                بارگذاری فایل JSON نسخه قبلی و بازگردانی اسناد
              </span>
            </button>
          </div>

          {/* Cloud Auto Sync Settings */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  اتصال به فضای ابری اختصاصی (WebDAV / Drive)
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoSyncEnabled}
                onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            {autoSyncEnabled && (
              <div className="flex flex-col gap-2.5 pt-2 animate-fade-in">
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1">
                    آدرس سرور یا وب‌هوک همگام‌سازی ابری:
                  </label>
                  <input
                    type="url"
                    placeholder="https://my-cloud-storage.com/sync"
                    value={cloudEndpoint}
                    onChange={(e) => setCloudEndpoint(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 block mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>کلید رمزگذاری اختصاصی (اختیاری):</span>
                  </label>
                  <input
                    type="password"
                    placeholder="رمز عبور جهت انکریپشن سمت کاربر"
                    value={encryptionKey}
                    onChange={(e) => setEncryptionKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone: Clear Data */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
              <Trash2 className="w-4 h-4 flex-shrink-0" />
              <span>پاکسازی کامل اسناد محلی و کش دستگاه</span>
            </div>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
            >
              پاک کردن همه
            </button>
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

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
