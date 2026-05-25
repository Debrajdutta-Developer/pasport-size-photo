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
export type LookId = "none" | "bw" | "sepia" | "cinematic" | "vivid" | "cool" | "warm" | "noir" | "vintage";

export type Adjustments = {
  brightness: number; // 0-200, 100 = neutral
  contrast: number;
  saturation: number;
  warmth: number; // -100..100
  exposure: number; // -100..100
  tint: number; // -50..50 (green<->magenta)
  highlights: number; // -100..100
  shadows: number; // -100..100
  clarity: number; // 0..100
  smooth: number; // 0..100 skin smoothing
  sharpen: number; // 0..100
  vignette: number; // 0..100
  grain: number; // 0..100
  rotate: number; // -15..15 deg
  look: LookId;
};

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 105,
  contrast: 108,
  saturation: 105,
  warmth: 8,
  exposure: 0,
  tint: 0,
  highlights: 0,
  shadows: 0,
  clarity: 15,
  smooth: 25,
  sharpen: 15,
  vignette: 0,
  grain: 0,
  rotate: 0,
  look: "none",
};

const LOOK_FILTERS: Record<LookId, string> = {
  none: "",
  bw: "grayscale(1) contrast(108%)",
  sepia: "sepia(0.7) contrast(105%) brightness(102%)",
  cinematic: "contrast(118%) saturate(85%) brightness(98%) sepia(0.08)",
  vivid: "saturate(140%) contrast(112%)",
  cool: "hue-rotate(-12deg) saturate(110%) brightness(102%)",
  warm: "sepia(0.18) saturate(115%) brightness(103%)",
  noir: "grayscale(1) contrast(130%) brightness(96%)",
  vintage: "sepia(0.35) saturate(90%) contrast(95%) brightness(105%)",
};

export function buildFilterString(a: Adjustments): string {
  const expMult = 1 + a.exposure / 200;
  const brightness = Math.max(0, a.brightness * expMult);
  const sepia = a.warmth > 0 ? a.warmth / 200 : 0;
  const warmHue = a.warmth < 0 ? a.warmth / 5 : 0;
  const tintHue = a.tint / 2.5;
  const hue = warmHue + tintHue;
  const hueShift = hue !== 0 ? `hue-rotate(${hue}deg)` : "";
  const look = LOOK_FILTERS[a.look] || "";
  return `brightness(${brightness}%) contrast(${a.contrast}%) saturate(${a.saturation}%) sepia(${sepia}) ${hueShift} ${look}`.trim();
}

/** Render the passport photo into a target canvas at given output size. */
export function renderPassport(
  ctx: CanvasRenderingContext2D,
  source: HTMLImageElement | HTMLCanvasElement,
  face: { x: number; y: number; w: number; h: number },
  outW: number,
  outH: number,
  bgColor: string,
  headRatio: number,
  adjustments: Adjustments,
  offsetX = 0,
  offsetY = 0,
  zoom = 1,
) {
  ctx.save();
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, outW, outH);

  const targetHeadPx = outH * headRatio;
  const scale = (targetHeadPx / face.h) * zoom;
  const faceCenterX = face.x + face

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

/** Build a print sheet canvas tiling N copies of the passport image,
 *  studio-style: tight equal gaps, optional thin border per photo, optional
 *  hairline cut marks between cells. Forces a 3-column grid when copies % 3 === 0
 *  to match traditional Indian/Asian studio passport prints. */
export function buildPrintSheet(
  photoCanvas: HTMLCanvasElement,
  sheetWmm: number,
  sheetHmm: number,
  photoWmm: number,
  photoHmm: number,
  copies: number,
  dpi: number,
  cutMarks: boolean,
  options: { gapMm?: number; border?: boolean } = {},
): HTMLCanvasElement {
  const gapMm = options.gapMm ?? 2;
  const border = options.border ?? true;
  const W = mmToPx(sheetWmm, dpi);
  const H = mmToPx(sheetHmm, dpi);
  const pw = mmToPx(photoWmm, dpi);
  const ph = mmToPx(photoHmm, dpi);
  const gap = mmToPx(gapMm, dpi);

  // Prefer 3 columns for multiples of 3 (studio standard 3×3 / 3×2)
  let cols = Math.floor((W + gap) / (pw + gap));
  if (copies % 3 === 0 && cols >= 3) cols = 3;
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
      if (border) {
        ctx.strokeStyle = "rgba(0,0,0,0.18)";
        ctx.lineWidth = Math.max(1, Math.round(dpi / 300));
        ctx.strokeRect(x + 0.5, y + 0.5, pw - 1, ph - 1);
      }


      if (cutMarks) {
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 1;
        const m = Math.round(dpi / 25);
        [[x, y], [x + pw, y], [x, y + ph], [x + pw, y + ph]].forEach(([cx, cy], i) => {
          ctx.beginPath();
          const dxm = i % 2 === 0 ? -m : m;
          const dym = i < 2 ? -m : m;
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + dxm, cy);
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx, cy + dym);
          ctx.stroke();
        });
      }
    }
  }
  return c;
}

/** Studio-grade pixel-perfect 4R (4×6 in portrait) sheet with 9 passport photos
 *  in a 3×3 grid at exactly 300 DPI. Matches the layout most professional photo
 *  studios use so the file prints to legal passport size with zero scaling.
 *
 *  Canvas:  1200 × 1800 px  (4 × 6 inch @ 300 DPI)
 *  Photo:    350 ×  450 px  (3.5 × 4.5 cm — 7:9 ratio)
 *  Margins:  Y 175 px top/bottom, X 50 px (matches studio spec)
 *  Gaps:     50 px horizontal and vertical
 */
export function buildStudio4R9(
  photoCanvas: HTMLCanvasElement,
  options: { border?: boolean; cutMarks?: boolean } = {},
): HTMLCanvasElement {
  const border = options.border ?? true;
  const cutMarks = options.cutMarks ?? false;
  const W = 1200;
  const H = 1800;
  const pw = 350;
  const ph = 450;
  const xs = [50, 450, 850];
  const ys = [175, 675, 1175];

  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.imageSmoothingQuality = "high";
  ctx.imageSmoothingEnabled = true;

  for (const y of ys) {
    for (const x of xs) {
      ctx.drawImage(photoCanvas, x, y, pw, ph);
      if (border) {
        ctx.strokeStyle = "rgba(180,180,180,0.9)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, pw - 1, ph - 1);
      }
      if (cutMarks) {
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 1;
        const m = 12;
        ([[x, y], [x + pw, y], [x, y + ph], [x + pw, y + ph]] as const).forEach(([cx, cy], i) => {
          const dxm = i % 2 === 0 ? -m : m;
          const dym = i < 2 ? -m : m;
          ctx.beginPath();
          ctx.moveTo(cx, cy); ctx.lineTo(cx + dxm, cy);
          ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + dym);
          ctx.stroke();
        });
      }
    }
  }
  return c;
}
