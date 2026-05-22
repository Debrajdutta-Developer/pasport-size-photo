// Image processing helpers — all client-side, no API keys.
// Note: @imgly/background-removal is imported lazily inside removeImageBackground
// to keep it out of the SSR bundle (it touches window/Worker at load).

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
    img.src = url;
  });
  return img;
}

export async function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  const img = new Image();
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
    img.src = url;
  });
  return img;
}

/** Detect face bounding box using the browser FaceDetector when available,
 *  otherwise fall back to a centered heuristic crop. Returns box in image px. */
export async function detectFace(img: HTMLImageElement): Promise<{ x: number; y: number; w: number; h: number }> {
  // @ts-ignore — experimental Chrome API
  if (typeof window !== "undefined" && "FaceDetector" in window) {
    try {
      // @ts-ignore
      const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      const faces = await detector.detect(img);
      if (faces && faces[0]) {
        const b = faces[0].boundingBox;
        return { x: b.x, y: b.y, w: b.width, h: b.height };
      }
    } catch {}
  }
  // Fallback: assume face in upper-center, ~40% of image height
  const h = img.naturalHeight * 0.4;
  const w = h * 0.78;
  return {
    x: (img.naturalWidth - w) / 2,
    y: img.naturalHeight * 0.12,
    w,
    h,
  };
}

/** Compose final passport photo: crops to preset ratio, places face at the
 *  correct vertical position, applies background and adjustments. */
export type Adjustments = {
  brightness: number; // 0-200, 100 = neutral
  contrast: number;
  saturation: number;
  warmth: number; // -100..100
  smooth: number; // 0..100 skin smoothing
  sharpen: number; // 0..100
  vignette: number; // 0..100
};

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 105,
  contrast: 108,
  saturation: 105,
  warmth: 8,
  smooth: 25,
  sharpen: 15,
  vignette: 0,
};

export function buildFilterString(a: Adjustments): string {
  const sepia = a.warmth > 0 ? a.warmth / 200 : 0;
  const hueShift = a.warmth < 0 ? `hue-rotate(${a.warmth / 5}deg)` : "";
  return `brightness(${a.brightness}%) contrast(${a.contrast}%) saturate(${a.saturation}%) sepia(${sepia}) ${hueShift}`.trim();
}

/** Render the passport photo into a target canvas at given output size. */
export function renderPassport(
  ctx: CanvasRenderingContext2D,
  source: HTMLImageElement | HTMLCanvasElement,
  face: { x: number; y: number; w: number; h: number },
  outW: number,
  outH: number,
  bgColor: string,
  headRatio: number, // head height / total height
  adjustments: Adjustments,
  offsetX = 0,
  offsetY = 0,
  zoom = 1,
) {
  ctx.save();
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, outW, outH);

  // Target face height in output px
  const targetHeadPx = outH * headRatio;
  const scale = (targetHeadPx / face.h) * zoom;

  const faceCenterX = face.x + face.w / 2;
  // Place face center horizontally centered; head top around 12% from top
  const headTopY = face.y;
  const targetHeadTop = outH * 0.13;

  const dx = outW / 2 - faceCenterX * scale + offsetX;
  const dy = targetHeadTop - headTopY * scale + offsetY;

  ctx.filter = buildFilterString(adjustments);
  ctx.imageSmoothingQuality = "high";
  const sw =
    "naturalWidth" in source ? source.naturalWidth : (source as HTMLCanvasElement).width;
  const sh =
    "naturalHeight" in source ? source.naturalHeight : (source as HTMLCanvasElement).height;
  ctx.drawImage(source as CanvasImageSource, dx, dy, sw * scale, sh * scale);
  ctx.filter = "none";

  // Skin smoothing approximation: subtle blur layer with low opacity
  if (adjustments.smooth > 0) {
    ctx.save();
    ctx.globalAlpha = adjustments.smooth / 300;
    ctx.filter = `blur(${adjustments.smooth / 25}px)`;
    ctx.drawImage(source as CanvasImageSource, dx, dy, sw * scale, sh * scale);
    ctx.restore();
  }

  // Sharpen approx: high-contrast overlay
  if (adjustments.sharpen > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = adjustments.sharpen / 400;
    ctx.drawImage(source as CanvasImageSource, dx, dy, sw * scale, sh * scale);
    ctx.restore();
  }

  // Vignette
  if (adjustments.vignette > 0) {
    const grad = ctx.createRadialGradient(outW / 2, outH / 2, outH * 0.3, outW / 2, outH / 2, outH * 0.7);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, `rgba(0,0,0,${adjustments.vignette / 200})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, outW, outH);
  }

  ctx.restore();
}

/** Remove background using @imgly/background-removal (browser-side).
 *  Uses the higher-quality isnet model and keeps PNG output for crisp edges
 *  around hair and fingers. Reports progress so the UI feels responsive. */
export async function removeImageBackground(
  src: HTMLImageElement | Blob,
  onProgress?: (p: number) => void,
): Promise<HTMLCanvasElement> {
  const { removeBackground } = await import("@imgly/background-removal");
  const input = src instanceof Blob ? src : await imageToBlob(src);
  const blob = await removeBackground(input, {
    model: "isnet",
    output: { format: "image/png", quality: 1 },
    progress: (_key: string, current: number, total: number) => {
      if (onProgress && total) onProgress(current / total);
    },
  } as any);
  const img = await loadImageFromBlob(blob);
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  c.getContext("2d")!.drawImage(img, 0, 0);
  return c;
}

export async function imageToBlob(img: HTMLImageElement): Promise<Blob> {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  c.getContext("2d")!.drawImage(img, 0, 0);
  return new Promise((res) => c.toBlob((b) => res(b!), "image/png"));
}

export function mmToPx(mm: number, dpi: number) {
  return Math.round((mm / 25.4) * dpi);
}

/** Build a print sheet canvas tiling N copies of the passport image. */
export function buildPrintSheet(
  photoCanvas: HTMLCanvasElement,
  sheetWmm: number,
  sheetHmm: number,
  photoWmm: number,
  photoHmm: number,
  copies: number,
  dpi: number,
  cutMarks: boolean,
): HTMLCanvasElement {
  const W = mmToPx(sheetWmm, dpi);
  const H = mmToPx(sheetHmm, dpi);
  const pw = mmToPx(photoWmm, dpi);
  const ph = mmToPx(photoHmm, dpi);
  const gap = mmToPx(3, dpi);

  const cols = Math.floor((W + gap) / (pw + gap));
  const rows = Math.ceil(copies / cols);
  const totalW = cols * pw + (cols - 1) * gap;
  const totalH = rows * ph + (rows - 1) * gap;
  const offX = (W - totalW) / 2;
  const offY = (H - totalH) / 2;

  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.imageSmoothingQuality = "high";

  let n = 0;
  for (let r = 0; r < rows && n < copies; r++) {
    for (let col = 0; col < cols && n < copies; col++, n++) {
      const x = offX + col * (pw + gap);
      const y = offY + r * (ph + gap);
      ctx.drawImage(photoCanvas, x, y, pw, ph);
      if (cutMarks) {
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 1;
        const m = 12;
        // corner crops
        [[x, y], [x + pw, y], [x, y + ph], [x + pw, y + ph]].forEach(([cx, cy], i) => {
          ctx.beginPath();
          const dx = i % 2 === 0 ? -m : m;
          const dy = i < 2 ? -m : m;
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + dx, cy);
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx, cy + dy);
          ctx.stroke();
        });
      }
    }
  }
  return c;
}
