export interface Point {
  x: number;
  y: number;
}

export interface CornerPoints {
  tl: Point; // Top-Left
  tr: Point; // Top-Right
  br: Point; // Bottom-Right
  bl: Point; // Bottom-Left
}

export type FilterType = 
  | 'photocopy_bw'     // فتوکپی باکنتراست سیاه و سفید (حذف سایه)
  | 'color_enhanced'   // اسکن رنگی واضح (تقویت رنگ و حذف پس‌زمینه)
  | 'grayscale'        // اسکن خاکستری تمیز
  | 'id_card'          // ویژه کارت ملی و مدارک هویتی
  | 'magic_color'      // تمیزسازی خودکار مدرک
  | 'original';        // رنگ اصلی بدون فیلتر

export interface ScanPage {
  id: string;
  originalImage: string; // Data URL or object URL
  corners: CornerPoints;
  warpedImage: string;   // Image after perspective correction
  processedImage: string; // Image after filter application
  filter: FilterType;
  brightness: number;    // -50 to 50
  contrast: number;      // -50 to 50
  rotation: number;      // 0, 90, 180, 270
}

export interface ScanDocument {
  id: string;
  title: string;
  category: string;
  createdAt: number;
  updatedAt: number;
  pages: ScanPage[];
  notes?: string;
}

export interface AppSettings {
  darkMode: boolean;
  autoEdgeDetect: boolean;
  defaultFilter: FilterType;
  pdfPageSize: 'a4' | 'letter' | 'id_card';
  exportQuality: number; // 0.6 to 1.0
  compression: boolean;
  cloudSyncEnabled: boolean;
  securityLock: boolean;
}
