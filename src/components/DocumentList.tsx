import React, { useState } from 'react';
import { ScanDocument } from '../types';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Search, 
  FileText, 
  Layers, 
  Calendar, 
  Share2, 
  Trash2, 
  ShieldCheck, 
  FileDown, 
  PlusCircle, 
  CheckCircle2 
} from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../utils/sampleDocuments';
import { generateDocumentPdf, shareFile } from '../utils/pdfExport';

interface DocumentListProps {
  documents: ScanDocument[];
  onOpenDocument: (doc: ScanDocument) => void;
  onNewScan: () => void;
  onUploadFile: () => void;
  onSampleSelect: (dataUrl: string, title: string, category: string) => void;
  onDeleteDocument: (id: string) => void;
}

const CATEGORIES = ['همه', 'مدارک شناسایی', 'اسناد اداری', 'قراردادها', 'بانکی و مالی'];

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onOpenDocument,
  onNewScan,
  onUploadFile,
  onSampleSelect,
  onDeleteDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('همه');
  const [shareLoadingId, setShareLoadingId] = useState<string | null>(null);

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'همه' || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuickShare = async (e: React.MouseEvent, doc: ScanDocument) => {
    e.stopPropagation();
    try {
      setShareLoadingId(doc.id);
      const blob = await generateDocumentPdf(doc.pages, { pageSize: 'a4' });
      await shareFile(blob, `${doc.title}_اسکن.pdf`, doc.title, 'ارسال سند فتوکپی شده');
    } catch (err) {
      console.error('Quick share error:', err);
    } finally {
      setShareLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-16 px-4">
      {/* Hero Action Banner */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        {/* Subtle decorative background curves */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/50 border border-emerald-400/30 text-emerald-200 mb-3 backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>پردازش ۱۰۰٪ آفلاین • بدون ارسال به اینترنت • امنیت حداکثری</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight">
            فتوکپی و اسکن مدارک با تشخیص خودکار لبه
          </h2>
          <p className="text-sm text-emerald-100/90 leading-relaxed mb-6">
            عکس کارت ملی، شناسنامه یا اسناد خود را با یک لمس به نسخه اسکن شده اداری با کادر صاف و فیلتر فتوکپی تبدیل کنید و خروجی PDF بگیرید.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="hero-start-scan-btn"
              onClick={onNewScan}
              className="px-5 py-3 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-sm flex items-center gap-2 shadow-lg transition active:scale-95"
            >
              <Camera className="w-5 h-5 text-emerald-700" />
              <span>شروع اسکن با دوربین</span>
            </button>

            <button
              id="hero-upload-gallery-btn"
              onClick={onUploadFile}
              className="px-4 py-3 rounded-2xl bg-emerald-900/60 hover:bg-emerald-900/90 text-white font-semibold text-sm flex items-center gap-2 border border-emerald-400/30 transition"
            >
              <Upload className="w-4 h-4 text-emerald-300" />
              <span>انتخاب از گالری</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Test Samples Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>آزمایش بدون نیاز به دوربین (تست مدارک نمونه):</span>
          </div>
          <span className="text-[11px] text-slate-400">یک لمس جهت آزمایش الگوریتم</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSampleSelect(sample.generate(), sample.name, sample.category)}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-500/50 text-right transition group"
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  {sample.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {sample.description}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 flex-shrink-0 mr-2">
                تست خودکار
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="جستجوی عنوان مدرک..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / Empty State */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center my-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 mb-1">
            {searchQuery ? 'هیچ مدرکی با این عنوان یافت نشد' : 'هنوز مدرکی اسکن نکرده‌اید'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
            برای شروع، دکمه «شروع اسکن با دوربین» را لمس کنید یا از مدارک نمونه بالا جهت تست فوری استفاده نمایید.
          </p>
          <button
            onClick={onNewScan}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>اولین اسکن را ثبت کنید</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const firstPage = doc.pages[0];
            const thumb = firstPage?.processedImage || firstPage?.warpedImage || firstPage?.originalImage;
            const dateStr = new Intl.DateTimeFormat('fa-IR', {
              dateStyle: 'medium',
            }).format(new Date(doc.updatedAt || doc.createdAt));

            return (
              <div
                key={doc.id}
                onClick={() => onOpenDocument(doc)}
                className="group bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail container */}
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={doc.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-1 group-hover:scale-102 transition duration-300"
                      />
                    ) : (
                      <FileText className="w-10 h-10 text-slate-400" />
                    )}

                    {/* Page count pill */}
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-sm">
                      <Layers className="w-3 h-3" />
                      <span>{doc.pages.length} برگه</span>
                    </div>

                    {/* Category pill */}
                    {doc.category && (
                      <div className="absolute top-2 right-2 bg-emerald-700/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-sm">
                        {doc.category}
                      </div>
                    )}
                  </div>

                  {/* Title and metadata */}
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-1 mb-1">
                    {doc.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-3">
                    <Calendar className="w-3 h-3" />
                    <span>{dateStr}</span>
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                    مشاهده و ویرایش &larr;
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleQuickShare(e, doc)}
                      disabled={shareLoadingId === doc.id}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="اشتراک‌گذاری سریع PDF"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`آیا از حذف سند «${doc.title}» مطمئن هستید؟`)) {
                          onDeleteDocument(doc.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="حذف سند"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Security & Offline Guarantee Banner */}
      <div className="bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span>
            <strong>حریم خصوصی و امنیت کامل:</strong> تمامی پردازش‌ها و اصلاح لبه‌ها مستقیماً در پردازنده دستگاه انجام شده و هیچ عکسی به اینترنت ارسال نمی‌شود.
          </span>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>مطابق قوانین بازار و مایکت (API 34)</span>
        </div>
      </div>
    </div>
  );
};
