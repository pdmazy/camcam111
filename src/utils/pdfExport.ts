import jsPDF from 'jspdf';
import { ScanDocument, ScanPage } from '../types';

export interface PdfExportOptions {
  pageSize?: 'a4' | 'letter' | 'id_card';
  orientation?: 'portrait' | 'landscape' | 'auto';
  margin?: number; // in mm
  quality?: number; // 0.6 to 1.0
  title?: string;
}

/**
 * Generates a PDF from a ScanDocument or an array of ScanPages.
 */
export async function generateDocumentPdf(
  pages: ScanPage[],
  options: PdfExportOptions = {}
): Promise<Blob> {
  const {
    pageSize = 'a4',
    margin = 5,
    quality = 0.92,
  } = options;

  if (!pages || pages.length === 0) {
    throw new Error('هیچ برگه ای برای تولید پی دی اف وجود ندارد');
  }

  // Load first image to determine aspect ratio
  const firstImg = new Image();
  await new Promise((res, rej) => {
    firstImg.onload = res;
    firstImg.onerror = rej;
    firstImg.src = pages[0].processedImage || pages[0].warpedImage || pages[0].originalImage;
  });

  const isLandscape = firstImg.width > firstImg.height;
  const orientation = options.orientation === 'auto' 
    ? (isLandscape ? 'landscape' : 'portrait')
    : (options.orientation || (isLandscape ? 'landscape' : 'portrait'));

  // Format mapping
  let format: string | [number, number] = 'a4';
  if (pageSize === 'letter') {
    format = 'letter';
  } else if (pageSize === 'id_card') {
    // Standard ISO/IEC 7810 ID-1 card: 85.6mm x 53.98mm
    format = orientation === 'landscape' ? [85.6, 53.98] : [53.98, 85.6];
  }

  const pdf = new jsPDF({
    orientation: orientation as 'portrait' | 'landscape',
    unit: 'mm',
    format: format,
    compress: true,
  });

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (i > 0) {
      pdf.addPage(format, orientation as 'portrait' | 'landscape');
    }

    const imgDataUrl = page.processedImage || page.warpedImage || page.originalImage;
    
    // Calculate page dimensions in mm
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const usableWidth = pageWidth - (margin * 2);
    const usableHeight = pageHeight - (margin * 2);

    // Get current image aspect ratio
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = imgDataUrl;
    });

    const imgAspect = img.width / img.height;
    const pageAspect = usableWidth / usableHeight;

    let drawWidth = usableWidth;
    let drawHeight = usableHeight;
    let posX = margin;
    let posY = margin;

    if (imgAspect > pageAspect) {
      // Fit to width
      drawHeight = usableWidth / imgAspect;
      posY = margin + (usableHeight - drawHeight) / 2;
    } else {
      // Fit to height
      drawWidth = usableHeight * imgAspect;
      posX = margin + (usableWidth - drawWidth) / 2;
    }

    pdf.addImage(imgDataUrl, 'JPEG', posX, posY, drawWidth, drawHeight, undefined, 'FAST');
  }

  return pdf.output('blob');
}

/**
 * Downloads a Blob as a file with a given filename.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Shares a file using the Web Share API (Android native sheet) or falls back to download.
 */
export async function shareFile(
  blob: Blob,
  filename: string,
  title: string,
  text: string
): Promise<{ shared: boolean; message: string }> {
  const file = new File([blob], filename, { type: blob.type });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: title,
        text: text,
      });
      return { shared: true, message: 'با موفقیت به اشتراک گذاشته شد' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { shared: false, message: 'اشتراک‌گذاری لغو شد' };
      }
      console.warn('Share error:', err);
    }
  }

  // Fallback: direct download
  downloadBlob(blob, filename);
  return { shared: true, message: 'فایل با موفقیت ذخیره شد (امکان اشتراک‌گذاری مستقیم مرورگر فعال نبود)' };
}
