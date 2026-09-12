import { createCanvas } from './imageProcessing';

export interface SampleDoc {
  id: string;
  name: string;
  description: string;
  category: string;
  generate: () => string; // returns dataUrl
}

/**
 * Creates a sample Iranian National ID Card (کارت ملی هوشمند) rendered at a realistic angle on a textured background.
 */
function createSampleNationalIdCard(): string {
  const W = 1000;
  const H = 700;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Realistic wooden/office desk background with slight grain
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, W, H);
  
  // Subtle desk wood lines
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  for (let i = 0; i < H; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(W, i + 5);
    ctx.stroke();
  }

  // 2. Draw card with slight angle and perspective
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-0.06); // ~3.5 degrees tilt
  
  const cardW = 600;
  const cardH = 380;
  const x = -cardW / 2;
  const y = -cardH / 2;

  // Realistic shadow under card
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 12;
  ctx.shadowOffsetY = 16;

  // Card Body (Smart ID card rounded rect)
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 16);
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Card background pattern / guilloche simulation
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let r = 20; r < cardW; r += 25) {
    ctx.beginPath();
    ctx.arc(x + cardW / 2, y + cardH / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Top header bar (Emerald & Gold)
  ctx.fillStyle = '#065f46';
  ctx.fillRect(x + 20, y + 20, cardW - 40, 42);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Vazirmatn, Tahoma, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('جمهوری اسلامی ایران - کارت هوشمند ملی (نمونه)', x + cardW / 2, y + 47);

  // Microchip symbol
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.roundRect(x + 50, y + 80, 70, 55, 6);
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Chip contacts
  ctx.beginPath();
  ctx.moveTo(x + 50, y + 107);
  ctx.lineTo(x + 120, y + 107);
  ctx.moveTo(x + 85, y + 80);
  ctx.lineTo(x + 85, y + 135);
  ctx.stroke();

  // ID Photo box (avatar silhouette)
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(x + cardW - 170, y + 85, 130, 165, 8);
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Avatar inside
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.arc(x + cardW - 105, y + 140, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + cardW - 105, y + 235, 55, Math.PI, 0);
  ctx.fill();

  // Personal Info in Persian
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px Vazirmatn, Tahoma, sans-serif';
  ctx.fillText('نام: علی', x + cardW - 200, y + 105);
  ctx.fillText('نام خانوادگی: محمدی راد', x + cardW - 200, y + 135);
  ctx.fillText('نام پدر: حسین', x + cardW - 200, y + 165);
  ctx.fillText('تاریخ تولد: ۱۳۶۸/۰۴/۱۵', x + cardW - 200, y + 195);
  
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 18px Courier, monospace';
  ctx.fillText('شماره ملی: ۰۰۸-۱۲۳۴۵۶-۷', x + cardW - 200, y + 235);
  ctx.font = '14px Vazirmatn, Tahoma, sans-serif';
  ctx.fillText('اعتبار: ۱۴۰۸/۰۴/۱۵', x + cardW - 200, y + 265);

  // Security Seal / Hologram stamp
  ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
  ctx.beginPath();
  ctx.arc(x + 130, y + 230, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 12px Vazirmatn, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('تایید ثبت احوال', x + 130, y + 235);

  // Machine Readable Zone (MRZ) bottom bar
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(x + 20, y + cardH - 65, cardW - 40, 45);
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('I<IRN0081234567<<<<<<<<<<<<<<<', x + 35, y + cardH - 42);
  ctx.fillText('6804157M2804153IRN<<<<<<<<<<<8', x + 35, y + cardH - 25);

  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Creates a sample official A4 contract/certificate with Persian typography, official header, stamp, and signature.
 */
function createSampleContractDocument(): string {
  const W = 900;
  const H = 1200;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Surface background (wood desk)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(0.04); // slight tilt

  const docW = 660;
  const docH = 960;
  const x = -docW / 2;
  const y = -docH / 2;

  // Realistic paper shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 15;

  // Paper (slightly aged off-white)
  ctx.fillStyle = '#faf8f5';
  ctx.fillRect(x, y, docW, docH);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Header border
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 25, y + 25, docW - 50, docH - 50);
  ctx.strokeRect(x + 29, y + 29, docW - 58, docH - 58);

  // Document Title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#18181b';
  ctx.font = 'bold 22px Vazirmatn, Tahoma, sans-serif';
  ctx.fillText('بسمه تعالی', x + docW / 2, y + 65);
  ctx.font = 'bold 20px Vazirmatn, Tahoma, sans-serif';
  ctx.fillText('گواهی رسمی اشتغال به کار و تعهدنامه', x + docW / 2, y + 105);

  // Metadata top left
  ctx.textAlign = 'left';
  ctx.font = '13px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#52525b';
  ctx.fillText('شماره نامه: ۱۴۰۳/۱۸۷۲', x + 50, y + 70);
  ctx.fillText('تاریخ صدور: ۱۴۰۳/۰۶/۲۰', x + 50, y + 95);
  ctx.fillText('پیوست: ندارد', x + 50, y + 120);

  // Body text in Persian
  ctx.textAlign = 'right';
  ctx.fillStyle = '#27272a';
  ctx.font = '16px Vazirmatn, Tahoma, sans-serif';
  const bodyY = y + 180;
  const lineSpacing = 38;

  ctx.fillText('بدین‌وسیله گواهی می‌شود که جناب آقای مهندس احمد رضایی با کد ملی ۰۴۵۲۳۸۹۱۷۴', x + docW - 50, bodyY);
  ctx.fillText('از تاریخ ۱۳۹۹/۰۱/۱۵ به عنوان کارشناس ارشد فناوری اطلاعات در این شرکت مشغول', x + docW - 50, bodyY + lineSpacing);
  ctx.fillText('به همکاری بوده و کلیه ضوابط قانونی و شغلی مربوطه را به نحو احسن ایفا نموده‌اند.', x + docW - 50, bodyY + lineSpacing * 2);
  ctx.fillText('این مدرک بنا به تقاضای نامبرده جهت ارائه به مبادی اداری و قانونی صادر گردیده و', x + docW - 50, bodyY + lineSpacing * 3);
  ctx.fillText('ارائه تصویر یا رونوشت فتوکپی آن با مهر و امضای معتبر رسمی دارای اعتبار کامل می‌باشد.', x + docW - 50, bodyY + lineSpacing * 4);

  // Official Red Stamp (مهر رسمی با رنگ قرمز شفاف)
  ctx.save();
  ctx.translate(x + 160, y + docH - 180);
  ctx.rotate(-0.15);
  
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 80, 50, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#dc2626';
  ctx.textAlign = 'center';
  ctx.font = 'bold 14px Vazirmatn, sans-serif';
  ctx.fillText('شرکت داده‌پردازی ایرانیان', 0, -10);
  ctx.font = '12px Vazirmatn, sans-serif';
  ctx.fillText('ثبت شده به شماره ۹۴۸۲۱', 0, 12);
  ctx.fillText('دبیرخانه مرکزی', 0, 30);
  ctx.restore();

  // Blue Pen Signature (امضای دستی با خودکار آبی)
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const sigX = x + docW - 190;
  const sigY = y + docH - 170;
  ctx.moveTo(sigX, sigY);
  ctx.bezierCurveTo(sigX + 30, sigY - 40, sigX + 60, sigY + 20, sigX + 90, sigY - 30);
  ctx.bezierCurveTo(sigX + 110, sigY - 60, sigX + 70, sigY + 10, sigX + 130, sigY);
  ctx.bezierCurveTo(sigX + 40, sigY + 30, sigX + 80, sigY - 10, sigX + 140, sigY + 20);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px Vazirmatn, sans-serif';
  ctx.fillText('مدیر عامل و رئیس هیئت مدیره', sigX + 60, sigY + 60);

  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.95);
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'sample_id_card',
    name: 'کارت ملی هوشمند (نمونه)',
    description: 'شبیه‌سازی کارت ملی جهت تست فیلتر ویژه کارت هویتی و برش دقیق لبه‌ها',
    category: 'مدارک شناسایی',
    generate: createSampleNationalIdCard,
  },
  {
    id: 'sample_contract',
    name: 'نامه و گواهی رسمی اداری (نمونه)',
    description: 'شبیه‌سازی سند رسمی اداری با مهر قرمز و امضای خودکار جهت تست فتوکپی سیاه و سفید',
    category: 'اسناد اداری',
    generate: createSampleContractDocument,
  },
];
