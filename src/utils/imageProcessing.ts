import { CornerPoints, FilterType, Point } from '../types';

/**
 * Loads an image from a URL or DataURL into an HTMLImageElement.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Creates an offscreen canvas with the given dimensions.
 */
export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

/**
 * Detects 4 document corners in an image using fast offline gradient heuristics.
 */
export function detectDocumentCorners(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  marginPercent = 0.08
): CornerPoints {
  const width = sourceImage.width;
  const height = sourceImage.height;

  // Fallback default corners (with margin)
  const defaultCorners: CornerPoints = {
    tl: { x: Math.round(width * marginPercent), y: Math.round(height * marginPercent) },
    tr: { x: Math.round(width * (1 - marginPercent)), y: Math.round(height * marginPercent) },
    br: { x: Math.round(width * (1 - marginPercent)), y: Math.round(height * (1 - marginPercent)) },
    bl: { x: Math.round(width * marginPercent), y: Math.round(height * (1 - marginPercent)) },
  };

  try {
    // Process on a small scale for instant execution (approx 200x200)
    const scale = 200 / Math.max(width, height);
    const sw = Math.max(20, Math.round(width * scale));
    const sh = Math.max(20, Math.round(height * scale));

    const smallCanvas = createCanvas(sw, sh);
    const ctx = smallCanvas.getContext('2d');
    if (!ctx) return defaultCorners;

    ctx.drawImage(sourceImage, 0, 0, sw, sh);
    const imgData = ctx.getImageData(0, 0, sw, sh);
    const data = imgData.data;

    // Grayscale
    const gray = new Float32Array(sw * sh);
    for (let i = 0; i < data.length; i += 4) {
      gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    // Sobel gradient magnitude
    const grad = new Float32Array(sw * sh);
    let maxGrad = 0;
    for (let y = 1; y < sh - 1; y++) {
      for (let x = 1; x < sw - 1; x++) {
        const idx = y * sw + x;
        // Horizontal gradient
        const gx =
          -gray[idx - sw - 1] + gray[idx - sw + 1] -
          2 * gray[idx - 1] + 2 * gray[idx + 1] -
          gray[idx + sw - 1] + gray[idx + sw + 1];
        // Vertical gradient
        const gy =
          -gray[idx - sw - 1] - 2 * gray[idx - sw] - gray[idx - sw + 1] +
          gray[idx + sw - 1] + 2 * gray[idx + sw] + gray[idx + sw + 1];

        const g = Math.hypot(gx, gy);
        grad[idx] = g;
        if (g > maxGrad) maxGrad = g;
      }
    }

    if (maxGrad < 30) {
      return defaultCorners;
    }

    // Threshold edge points
    const threshold = maxGrad * 0.35;
    const edgePoints: Point[] = [];
    for (let y = 2; y < sh - 2; y++) {
      for (let x = 2; x < sw - 2; x++) {
        if (grad[y * sw + x] > threshold) {
          edgePoints.push({ x, y });
        }
      }
    }

    if (edgePoints.length < 50) {
      return defaultCorners;
    }

    // Find extreme quad corners:
    // tl: min(x + y), tr: max(x - y), br: max(x + y), bl: min(x - y)
    let minSum = Infinity, maxSum = -Infinity;
    let minDiff = Infinity, maxDiff = -Infinity;

    let tlPt = { x: 0, y: 0 };
    let trPt = { x: sw, y: 0 };
    let brPt = { x: sw, y: sh };
    let blPt = { x: 0, y: sh };

    for (const pt of edgePoints) {
      const sum = pt.x + pt.y;
      const diff = pt.x - pt.y;

      if (sum < minSum) {
        minSum = sum;
        tlPt = pt;
      }
      if (sum > maxSum) {
        maxSum = sum;
        brPt = pt;
      }
      if (diff > maxDiff) {
        maxDiff = diff;
        trPt = pt;
      }
      if (diff < minDiff) {
        minDiff = diff;
        blPt = pt;
      }
    }

    // Map back to original coordinate space
    const invScale = 1 / scale;
    const detected: CornerPoints = {
      tl: { x: Math.max(0, Math.min(width, Math.round(tlPt.x * invScale))), y: Math.max(0, Math.min(height, Math.round(tlPt.y * invScale))) },
      tr: { x: Math.max(0, Math.min(width, Math.round(trPt.x * invScale))), y: Math.max(0, Math.min(height, Math.round(trPt.y * invScale))) },
      br: { x: Math.max(0, Math.min(width, Math.round(brPt.x * invScale))), y: Math.max(0, Math.min(height, Math.round(brPt.y * invScale))) },
      bl: { x: Math.max(0, Math.min(width, Math.round(blPt.x * invScale))), y: Math.max(0, Math.min(height, Math.round(blPt.y * invScale))) },
    };

    // Sanity check: Ensure the area is reasonable (not collapsed)
    const area = 0.5 * Math.abs(
      (detected.tl.x * (detected.tr.y - detected.bl.y)) +
      (detected.tr.x * (detected.br.y - detected.tl.y)) +
      (detected.br.x * (detected.bl.y - detected.tr.y)) +
      (detected.bl.x * (detected.tl.y - detected.br.y))
    );

    if (area < (width * height * 0.25)) {
      return defaultCorners;
    }

    return detected;
  } catch (err) {
    console.error('Error in edge detection:', err);
    return defaultCorners;
  }
}

/**
 * Calculates Euclidean distance between two points.
 */
export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Warps a quad region defined by 4 corners into a rectangular canvas.
 */
export function warpPerspective(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  corners: CornerPoints,
  targetWidth?: number,
  targetHeight?: number
): HTMLCanvasElement {
  const { tl, tr, br, bl } = corners;

  // Derive target dimensions if not provided
  const widthTop = distance(tl, tr);
  const widthBottom = distance(bl, br);
  const heightLeft = distance(tl, bl);
  const heightRight = distance(tr, br);

  const dstW = Math.max(100, Math.round(targetWidth || Math.max(widthTop, widthBottom)));
  const dstH = Math.max(100, Math.round(targetHeight || Math.max(heightLeft, heightRight)));

  // Cap size for optimal performance while maintaining high photocopy detail
  const maxDim = 2000;
  let finalW = dstW;
  let finalH = dstH;
  if (finalW > maxDim || finalH > maxDim) {
    const ratio = Math.min(maxDim / finalW, maxDim / finalH);
    finalW = Math.round(finalW * ratio);
    finalH = Math.round(finalH * ratio);
  }

  // Create temporary source canvas
  const srcCanvas = createCanvas(sourceImage.width, sourceImage.height);
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) return srcCanvas;
  srcCtx.drawImage(sourceImage, 0, 0);
  const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const srcPixels = srcData.data;
  const srcW = srcCanvas.width;
  const srcH = srcCanvas.height;

  // Create destination canvas
  const dstCanvas = createCanvas(finalW, finalH);
  const dstCtx = dstCanvas.getContext('2d');
  if (!dstCtx) return dstCanvas;
  const dstData = dstCtx.createImageData(finalW, finalH);
  const dstPixels = dstData.data;

  // Bilinear interpolation mapping from (x, y) in dest to (u, v) in src
  for (let dy = 0; dy < finalH; dy++) {
    const v = dy / (finalH - 1);
    const rowOffset = dy * finalW * 4;

    // Linear interpolate along left and right edges
    const leftX = tl.x + v * (bl.x - tl.x);
    const leftY = tl.y + v * (bl.y - tl.y);
    const rightX = tr.x + v * (br.x - tr.x);
    const rightY = tr.y + v * (br.y - tr.y);

    for (let dx = 0; dx < finalW; dx++) {
      const u = dx / (finalW - 1);

      // Point in source image
      const sx = leftX + u * (rightX - leftX);
      const sy = leftY + u * (rightY - leftY);

      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const x1 = Math.min(x0 + 1, srcW - 1);
      const y1 = Math.min(y0 + 1, srcH - 1);

      const fx = sx - x0;
      const fy = sy - y0;

      const dstIdx = rowOffset + dx * 4;

      if (x0 >= 0 && x1 < srcW && y0 >= 0 && y1 < srcH) {
        const i00 = (y0 * srcW + x0) * 4;
        const i10 = (y0 * srcW + x1) * 4;
        const i01 = (y1 * srcW + x0) * 4;
        const i11 = (y1 * srcW + x1) * 4;

        const w00 = (1 - fx) * (1 - fy);
        const w10 = fx * (1 - fy);
        const w01 = (1 - fx) * fy;
        const w11 = fx * fy;

        dstPixels[dstIdx] = srcPixels[i00] * w00 + srcPixels[i10] * w10 + srcPixels[i01] * w01 + srcPixels[i11] * w11;
        dstPixels[dstIdx + 1] = srcPixels[i00 + 1] * w00 + srcPixels[i10 + 1] * w10 + srcPixels[i01 + 1] * w01 + srcPixels[i11 + 1] * w11;
        dstPixels[dstIdx + 2] = srcPixels[i00 + 2] * w00 + srcPixels[i10 + 2] * w10 + srcPixels[i01 + 2] * w01 + srcPixels[i11 + 2] * w11;
        dstPixels[dstIdx + 3] = 255;
      } else {
        dstPixels[dstIdx] = 255;
        dstPixels[dstIdx + 1] = 255;
        dstPixels[dstIdx + 2] = 255;
        dstPixels[dstIdx + 3] = 255;
      }
    }
  }

  dstCtx.putImageData(dstData, 0, 0);
  return dstCanvas;
}

/**
 * Applies document/photocopy processing filters.
 */
export function applyFilter(
  sourceCanvas: HTMLCanvasElement,
  filter: FilterType,
  brightness = 0,
  contrast = 0
): HTMLCanvasElement {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const outputCanvas = createCanvas(width, height);
  const ctx = outputCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  ctx.drawImage(sourceCanvas, 0, 0);
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;
  const len = d.length;

  // Factor for contrast: -50 to 50
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const bShift = brightness * 1.5;

  if (filter === 'original') {
    if (brightness !== 0 || contrast !== 0) {
      for (let i = 0; i < len; i += 4) {
        d[i] = Math.min(255, Math.max(0, contrastFactor * (d[i] - 128) + 128 + bShift));
        d[i + 1] = Math.min(255, Math.max(0, contrastFactor * (d[i + 1] - 128) + 128 + bShift));
        d[i + 2] = Math.min(255, Math.max(0, contrastFactor * (d[i + 2] - 128) + 128 + bShift));
      }
      ctx.putImageData(imgData, 0, 0);
    }
    return outputCanvas;
  }

  if (filter === 'photocopy_bw') {
    // High-contrast clean photocopy with shadow removal
    // Calculate mean luminance for adaptive cutoff
    let totalLum = 0;
    for (let i = 0; i < len; i += 4) {
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      totalLum += lum;
    }
    const avgLum = totalLum / (len / 4);
    // Dynamic threshold based on average luminance + user adjustments
    const threshold = Math.min(210, Math.max(85, avgLum * 0.85 + bShift));

    for (let i = 0; i < len; i += 4) {
      let lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      
      // Fine thresholding: Dark pixels become crisp deep black, paper becomes crisp clean white
      if (lum < threshold) {
        // Deepen text and lines
        const factor = lum / threshold;
        const val = Math.max(0, Math.round(factor * factor * 50));
        d[i] = val;
        d[i + 1] = val;
        d[i + 2] = val;
      } else {
        // Background paper whitening
        d[i] = 255;
        d[i + 1] = 255;
        d[i + 2] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return outputCanvas;
  }

  if (filter === 'grayscale') {
    // Smooth document grayscale with contrast stretch
    for (let i = 0; i < len; i += 4) {
      let gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      
      // Auto brighten paper
      gray = gray > 180 ? Math.min(255, gray * 1.15) : gray * 0.95;
      
      // User adjustments
      gray = contrastFactor * (gray - 128) + 128 + bShift;
      gray = Math.min(255, Math.max(0, gray));

      d[i] = gray;
      d[i + 1] = gray;
      d[i + 2] = gray;
    }
    ctx.putImageData(imgData, 0, 0);
    return outputCanvas;
  }

  if (filter === 'color_enhanced') {
    // Scanned color document: crisp white paper background, preserved colored stamps, signatures, photos
    for (let i = 0; i < len; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];

      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Flatten off-white paper to clean white
      if (lum > 175) {
        const boost = (lum - 175) / 80;
        r = Math.min(255, r + boost * 55);
        g = Math.min(255, g + boost * 55);
        b = Math.min(255, b + boost * 55);
      } else if (lum < 90) {
        // Deepen dark text
        r = Math.max(0, r * 0.8);
        g = Math.max(0, g * 0.8);
        b = Math.max(0, b * 0.8);
      }

      // Slightly increase saturation for stamps and photos
      const avg = (r + g + b) / 3;
      r = avg + 1.25 * (r - avg);
      g = avg + 1.25 * (g - avg);
      b = avg + 1.25 * (b - avg);

      // Contrast & brightness
      r = contrastFactor * (r - 128) + 128 + bShift;
      g = contrastFactor * (g - 128) + 128 + bShift;
      b = contrastFactor * (b - 128) + 128 + bShift;

      d[i] = Math.min(255, Math.max(0, r));
      d[i + 1] = Math.min(255, Math.max(0, g));
      d[i + 2] = Math.min(255, Math.max(0, b));
    }
    ctx.putImageData(imgData, 0, 0);
    return outputCanvas;
  }

  if (filter === 'id_card') {
    // Specifically calibrated for ID cards (کارت ملی، شناسنامه، گواهینامه)
    // Enhances micro-printing, portrait photo, security pattern
    for (let i = 0; i < len; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];

      // S-curve contrast
      r = r < 128 ? (r * r) / 128 : 255 - ((255 - r) * (255 - r)) / 128;
      g = g < 128 ? (g * g) / 128 : 255 - ((255 - g) * (255 - g)) / 128;
      b = b < 128 ? (b * b) / 128 : 255 - ((255 - b) * (255 - b)) / 128;

      // Adjustments
      r = contrastFactor * (r - 128) + 128 + bShift + 5;
      g = contrastFactor * (g - 128) + 128 + bShift + 5;
      b = contrastFactor * (b - 128) + 128 + bShift + 5;

      d[i] = Math.min(255, Math.max(0, r));
      d[i + 1] = Math.min(255, Math.max(0, g));
      d[i + 2] = Math.min(255, Math.max(0, b));
    }
    ctx.putImageData(imgData, 0, 0);
    return outputCanvas;
  }

  if (filter === 'magic_color') {
    // Magic color: automatic levels, vibrance and illumination evening
    let minR = 255, maxR = 0;
    let minG = 255, maxG = 0;
    let minB = 255, maxB = 0;

    for (let i = 0; i < len; i += 16) {
      if (d[i] < minR) minR = d[i];
      if (d[i] > maxR) maxR = d[i];
      if (d[i + 1] < minG) minG = d[i + 1];
      if (d[i + 1] > maxG) maxG = d[i + 1];
      if (d[i + 2] < minB) minB = d[i + 2];
      if (d[i + 2] > maxB) maxB = d[i + 2];
    }

    const rangeR = Math.max(1, maxR - minR);
    const rangeG = Math.max(1, maxG - minG);
    const rangeB = Math.max(1, maxB - minB);

    for (let i = 0; i < len; i += 4) {
      let r = ((d[i] - minR) / rangeR) * 255;
      let g = ((d[i + 1] - minG) / rangeG) * 255;
      let b = ((d[i + 2] - minB) / rangeB) * 255;

      r = contrastFactor * (r - 128) + 128 + bShift;
      g = contrastFactor * (g - 128) + 128 + bShift;
      b = contrastFactor * (b - 128) + 128 + bShift;

      d[i] = Math.min(255, Math.max(0, r));
      d[i + 1] = Math.min(255, Math.max(0, g));
      d[i + 2] = Math.min(255, Math.max(0, b));
    }
    ctx.putImageData(imgData, 0, 0);
    return outputCanvas;
  }

  ctx.putImageData(imgData, 0, 0);
  return outputCanvas;
}

/**
 * Rotates a canvas by 90, 180, or 270 degrees.
 */
export function rotateCanvas(sourceCanvas: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
  const normDeg = ((degrees % 360) + 360) % 360;
  if (normDeg === 0) return sourceCanvas;

  const w = sourceCanvas.width;
  const h = sourceCanvas.height;

  const is90or270 = normDeg === 90 || normDeg === 270;
  const targetW = is90or270 ? h : w;
  const targetH = is90or270 ? w : h;

  const output = createCanvas(targetW, targetH);
  const ctx = output.getContext('2d');
  if (!ctx) return sourceCanvas;

  ctx.translate(targetW / 2, targetH / 2);
  ctx.rotate((normDeg * Math.PI) / 180);
  ctx.drawImage(sourceCanvas, -w / 2, -h / 2);

  return output;
}
