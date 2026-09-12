import React, { useState } from 'react';
import { 
  Smartphone, 
  CheckCircle2, 
  Terminal, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  GitBranch, 
  Package 
} from 'lucide-react';

interface AndroidReleaseModalProps {
  onClose: () => void;
}

export const AndroidReleaseModal: React.FC<AndroidReleaseModalProps> = ({ onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const gitHubWorkflowSnippet = `name: Build Android APK (API 34)

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: gradle

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
        with:
          cmdline-tools-version: 11076708
          api-levels: 34
          build-tools: 34.0.0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies & Build Web Assets
        run: |
          npm install
          npm run build

      - name: Sync Capacitor Android
        run: |
          npx cap sync android

      - name: Build Debug & Release APK
        run: |
          cd android
          chmod +x ./gradlew
          ./gradlew assembleDebug
          ./gradlew assembleRelease --stacktrace

      - name: Upload APK Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: Photocopy-Scanner-APK-API34
          path: |
            android/app/build/outputs/apk/debug/app-debug.apk
            android/app/build/outputs/apk/release/app-release-unsigned.apk`;

  const buildCommands = `npm install
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                استاندارد انتشار بازار و مایکت (API Level 34)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                پیکربندی گیت‌هاب اکشن جهت تولید خودکار و فوری فایل نصبی APK
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

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto text-xs leading-relaxed">
          {/* Compliance Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>سازگار با قوانین بازار و مایکت ۱۴۰۳</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <li>هدف‌گذاری رسمی <strong>targetSdkVersion = 34</strong> (اندروید ۱۴)</li>
                <li>کامپایل با <strong>compileSdkVersion = 34</strong></li>
                <li>پشتیبانی از ۹۹٪ گوشی‌ها: <strong>minSdkVersion = 22</strong></li>
                <li>پشتیبانی راست‌چین کامل (RTL) و حالت دارک مود</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-400 mb-1">
                <Package className="w-4 h-4" />
                <span>مجوزهای استاندارد (Scoped Storage)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <li>مجوز دوربین با ویژگی fallback سخت‌افزاری</li>
                <li>مجوز <code>READ_MEDIA_IMAGES</code> ویژه اندروید ۱۳ و ۱۴</li>
                <li>عدم استفاده از دسترسی‌های خطرناک رد صلاحیت بازار</li>
                <li>شناسه بسته: <code>ir.scanner.photocopy.app</code></li>
              </ul>
            </div>
          </div>

          {/* GitHub Actions Overview */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                <GitBranch className="w-4 h-4 text-emerald-500" />
                <span>ورک‌فلو گیت‌هاب اکشن (.github/workflows/build-apk.yml)</span>
              </div>
              <button
                onClick={() => copyToClipboard(gitHubWorkflowSnippet, 'github')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-medium flex items-center gap-1.5 hover:border-emerald-500 transition"
              >
                {copiedSection === 'github' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>کپی ورک‌فلو</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              این فایل در مخزن پروژه تعبیه شده است. کافیست پروژه را در گیت‌هاب قرار دهید؛ گیت‌هاب اکشن به صورت کامپایل خودکار و بدون نیاز به اندروید استودیو، فایل نصبی APK را با خروجی آماده دانلود تحویل می‌دهد:
            </p>
            <pre className="bg-slate-950 text-slate-300 p-3 rounded-xl font-mono text-[10px] overflow-x-auto max-h-40 border border-slate-800 dir-ltr text-left">
              {gitHubWorkflowSnippet}
            </pre>
          </div>

          {/* Manual Local Build Commands */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                <Terminal className="w-4 h-4 text-amber-500" />
                <span>دستورات بیلد محلی اندروید (اختیاری)</span>
              </div>
              <button
                onClick={() => copyToClipboard(buildCommands, 'cmd')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-medium flex items-center gap-1.5 hover:border-emerald-500 transition"
              >
                {copiedSection === 'cmd' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>کپی دستورات</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 text-emerald-400 p-3 rounded-xl font-mono text-[11px] border border-slate-800 dir-ltr text-left">
              {buildCommands}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs transition"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};
