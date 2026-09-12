import React, { useState } from 'react';
import { ScanDocument, ScanPage } from '../types';
import { generateDocumentPdf, shareFile, downloadBlob } from '../utils/pdfExport';
import { 
  FileDown, 
  Share2, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  Eye, 
  Check, 
  Layers, 
  Calendar, 
  Copy,
  Printer
} from 'lucide-react';

interface DocumentViewerProps {
  document: ScanDocument;
  onBack: () => void;
  onUpdateDocument: (updatedDoc: ScanDocument) => void;
  onAddPage: () => void;
  onEditPage: (pageIndex: number) => void;
  onDeleteDocument: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onBack,
  onUpdateDocument,
  onAddPage,
  onEditPage,
  onDeleteDocument,
}) => {
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [docTitle, setDocTitle] = useState<string>(document.title);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'id_card'>('a4');
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const activePage: ScanPage | undefined = document.pages[activePageIndex] || document.pages[0];

  const handleSaveTitle = () => {
    if (!docTitle.trim()) return;
    onUpdateDocument({
      ...document,
      title: docTitle.trim(),
      updatedAt: Date.now(),
    });
    setIsEditingTitle(false);
  };

  // PDF Export
  const handleExportPdf = async (action: 'download' | 'share') => {
    if (!document.pages || document.pages.length === 0) return;
    try {
      setIsExportingPdf(true);
      setShareStatus('در حال تولید فایل PDF با کیفیت بالا...');

      const blob = await generateDocumentPdf(document.pages, {
        pageSize: pageSize,
        margin: pageSize === 'id_card' ? 0 : 5,
        title: document.title,
      });

      const cleanFilename = `${document.title.replace(/\s+/g, '_')}_اسکن.pdf`;

      if (action === 'share') {
        const res = await shareFile(
          blob, 
          cleanFilename, 
          document.title, 
          'فایل اسکن شده مدارک با کیفیت فتوکپی رسمی'
        );
        setShareStatus(res.message);
      } else {
        downloadBlob(blob, cleanFilename);
        setShareStatus('فایل PDF با موفقیت دانلود شد');
      }
    } catch (err: any) {
      console.error('PDF error:', err);
      setShareStatus('خطا در صدور پی دی اف: ' + err.message);
    } finally {
      setIsExportingPdf(false);
      setTimeout(() => setShareStatus(null), 4000);
    }
  };

  // Image Export (single page)
  const handleExportImage = () => {
    if (!activePage) return;
    const link = document.createElement('a');
    link.href = activePage.processedImage || activePage.warpedImage;
    link.download = `${document.title}_صفحه_${activePageIndex + 1}.jpg`;
    link.click();
  };

  // Delete page
  const handleDeletePage = (index: number) => {
    if (document.pages.length <= 1) {
      if (confirm('این سند فقط یک برگه دارد. آیا مایلید کل سند حذف شود؟')) {
        onDeleteDocument();
      }
      return;
    }
    const updatedPages = document.pages.filter((_, i) => i !== index);
    onUpdateDocument({
      ...document,
      pages: updatedPages,
      updatedAt: Date.now(),
    });
    setActivePageIndex(Math.max(0, index - 1));
  };

  const formattedDate = new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(document.updatedAt || document.createdAt));

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowRight className="w-4 h-4" />
          <span>لیست مدارک</span>
        </button>

        {/* Title display & inline edit */}
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="px-2 py-1 text-xs font-bold rounded-lg border border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 rounded-lg bg-emerald-600 text-white"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => setIsEditingTitle(true)}>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 transition">
                {document.title}
              </h2>
              <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-emerald-500" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onDeleteDocument}
            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            title="حذف کل سند"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document Information & Sharing Notification Banner */}
      <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>{document.pages.length} برگه</span>
          </span>
        </div>

        {shareStatus && (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
            {shareStatus}
          </span>
        )}
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 flex flex-col sm:flex-row p-3 sm:p-4 gap-4 overflow-hidden">
        {/* Active Page Large View */}
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-200/60 dark:bg-slate-950/60 rounded-xl p-3 border border-slate-300 dark:border-slate-800 overflow-hidden min-h-[320px]">
          {activePage ? (
            <div className="relative max-h-[50vh] max-w-full flex items-center justify-center">
              <img
                src={activePage.processedImage || activePage.warpedImage}
                alt={`صفحه ${activePageIndex + 1}`}
                referrerPolicy="no-referrer"
                className="max-h-[50vh] max-w-full w-auto object-contain rounded-lg shadow-xl border border-slate-300 dark:border-slate-700 bg-white"
              />
              <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                صفحه {activePageIndex + 1} از {document.pages.length}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">هیچ برگه‌ای موجود نیست</div>
          )}

          {/* Quick actions for active page */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => onEditPage(activePageIndex)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:border-emerald-500 transition flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
              <span>ویرایش فیلتر و کادر</span>
            </button>

            <button
              onClick={handleExportImage}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:border-emerald-500 transition flex items-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-500" />
              <span>دانلود عکس (JPG)</span>
            </button>

            <button
              onClick={() => handleDeletePage(activePageIndex)}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="حذف این برگه"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Thumbnail Carousel / Page list sidebar */}
        <div className="w-full sm:w-48 flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-48 sm:max-h-[55vh] p-1 flex-shrink-0">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden sm:block mb-1">
            برگه‌های مدرک:
          </div>

          {document.pages.map((p, idx) => (
            <div
              key={p.id || idx}
              onClick={() => setActivePageIndex(idx)}
              className={`cursor-pointer rounded-xl p-1.5 border transition flex-shrink-0 flex items-center sm:flex-row gap-2 ${
                activePageIndex === idx
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <img
                src={p.processedImage || p.warpedImage}
                alt={`بندانگشتی برگه ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-12 h-16 sm:w-14 sm:h-18 object-cover rounded-md bg-white border border-slate-200 dark:border-slate-700"
              />
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  برگه {idx + 1}
                </span>
                <span className="text-[10px] text-slate-400">
                  {idx === 0 ? 'روی مدرک' : idx === 1 ? 'پشت مدرک' : 'پیوست'}
                </span>
              </div>
            </div>
          ))}

          {/* Add Page Button */}
          <button
            onClick={onAddPage}
            className="flex sm:flex-row items-center justify-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-emerald-500/50 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 transition text-xs font-bold flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن برگه</span>
          </button>
        </div>
      </div>

      {/* Bottom Export & Sharing Bar */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Page size options */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 w-full sm:w-auto justify-center sm:justify-start">
            <Printer className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>قالب کاغذ:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as any)}
              className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium cursor-pointer"
            >
              <option value="a4">A4 (استاندارد اداری و فتوکپی)</option>
              <option value="letter">Letter</option>
              <option value="id_card">کارت شناسایی (ID-1)</option>
            </select>
          </div>

          {/* Main Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleExportPdf('download')}
              disabled={isExportingPdf}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 transition"
            >
              <FileDown className="w-4 h-4 text-blue-500" />
              <span>دانلود PDF</span>
            </button>

            <button
              onClick={() => handleExportPdf('share')}
              disabled={isExportingPdf}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition"
            >
              <Share2 className="w-4 h-4" />
              <span>اشتراک‌گذاری در پیام‌رسان‌ها</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
