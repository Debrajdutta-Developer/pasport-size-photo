import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Sparkles, Download, Printer, Loader2, Check, AlertCircle,
  Wand2, Image as ImageIcon, RotateCw, ArrowLeft, FileDown,
} from "lucide-react";
import jsPDF from "jspdf";
import { PRESETS, BG_COLORS, PRINT_SIZES, type Preset } from "@/lib/presets";
import {
  loadImageFromFile, detectFace, renderPassport, removeImageBackground,
  buildPrintSheet, buildStudio4R9, mmToPx, DEFAULT_ADJUSTMENTS, type Adjustments,
} from "@/lib/imaging";


export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Studio — PassportAI" },
      { name: "description", content: "Upload a photo and let AI generate a studio-grade passport photo in seconds. Free." },
      { property: "og:title", content: "Studio — PassportAI" },
      { property: "og:description", content: "Upload a photo and let AI generate a studio-grade passport photo in seconds. Free." },
      { property: "og:url", content: "https://pasport-size-photo.lovable.app/studio" },
    ],
    links: [
      { rel: "canonical", href: "https://pasport-size-photo.lovable.app/studio" },
    ],
  }),
  component: Studio,
});

type Stage = "upload" | "processing" | "edit";

const PIPELINE = [
  "Detecting face",
  "Aligning face",
  "Removing background",
  "Enhancing portrait",
  "Optimizing for print",
  "Preparing layout",
];

function Studio() {
  const [stage, setStage] = useState<Stage>("upload");
  const [pipelineStep, setPipelineStep] = useState(0);
  const [bgProgress, setBgProgress] = useState(0);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [cutoutCanvas, setCutoutCanvas] = useState<HTMLCanvasElement | null>(null);
  const [face, setFace] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [bgColor, setBgColor] = useState(BG_COLORS[0].color);
  const [keepBackground, setKeepBackground] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [printOpen, setPrintOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const runPipeline = useCallback(async (file: File, skipBg: boolean) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    setStage("processing");
    setPipelineStep(0);
    setBgProgress(0);
    try {
      const img = await loadImageFromFile(file);
      if (img.naturalWidth < 400 || img.naturalHeight < 400) {
        setError("Image is too small. Please use at least 600×600px for best results.");
      }
      setPipelineStep(1);
      const f = await detectFace(img);
      setPipelineStep(2);
      let cutout: HTMLCanvasElement;
      if (skipBg) {
        // Skip heavy model — wrap source image as canvas (fast path)
        const c = document.createElement("canvas");
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        c.getContext("2d")!.drawImage(img, 0, 0);
        cutout = c;
        setBgProgress(1);
      } else {
        cutout = await removeImageBackground(img, (p) => setBgProgress(p));
      }
      setPipelineStep(3);
      await tick();
      setPipelineStep(4);
      await tick();
      setPipelineStep(5);
      await tick();
      setSourceImg(img);
      setCutoutCanvas(cutout);
      setFace(f);
      setKeepBackground(skipBg);
      setStage("edit");
    } catch (e) {
      console.error(e);
      setError("Something went wrong while processing. Try another image.");
      setStage("upload");
    }
  }, []);

  const handleUpload = useCallback((file: File) => runPipeline(file, false), [runPipeline]);
  const handleUploadKeepBg = useCallback((file: File) => runPipeline(file, true), [runPipeline]);

  // Live preview render
  useEffect(() => {
    if (stage !== "edit" || !cutoutCanvas || !face) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const ratio = preset.width / preset.height;
    const previewH = 600;
    const previewW = Math.round(previewH * ratio);
    canvas.width = previewW;
    canvas.height = previewH;
    const headRatio = (preset.headMin + preset.headMax) / 2 / preset.height;
    const source = keepBackground && sourceImg ? sourceImg : cutoutCanvas;
    renderPassport(
      ctx, source, face, previewW, previewH, bgColor, headRatio, adjustments,
      offset.x, offset.y, zoom,
    );
  }, [stage, cutoutCanvas, sourceImg, keepBackground, face, preset, bgColor, adjustments, zoom, offset]);

  const renderHiRes = useCallback((): HTMLCanvasElement | null => {
    if (!cutoutCanvas || !face) return null;
    const w = mmToPx(preset.width, preset.dpi);
    const h = mmToPx(preset.height, preset.dpi);
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const headRatio = (preset.headMin + preset.headMax) / 2 / preset.height;
    const source = keepBackground && sourceImg ? sourceImg : cutoutCanvas;
    renderPassport(c.getContext("2d")!, source, face, w, h, bgColor, headRatio, adjustments, offset.x * (w / 600), offset.y * (w / 600), zoom);
    return c;
  }, [cutoutCanvas, sourceImg, keepBackground, face, preset, bgColor, adjustments, zoom, offset]);

  const downloadCanvas = (canvas: HTMLCanvasElement, name: string, type: "png" | "jpg") => {
    const mime = type === "png" ? "image/png" : "image/jpeg";
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${name}.${type}`;
      a.click();
      URL.revokeObjectURL(url);
    }, mime, 0.95);
  };

  const exportPhoto = (type: "png" | "jpg") => {
    const c = renderHiRes();
    if (c) downloadCanvas(c, `passport-${preset.id}`, type);
  };

  const exportPdf = (sheet: HTMLCanvasElement, sheetWmm: number, sheetHmm: number) => {
    const pdf = new jsPDF({ unit: "mm", format: [sheetWmm, sheetHmm], orientation: sheetWmm > sheetHmm ? "landscape" : "portrait" });
    pdf.addImage(sheet.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, sheetWmm, sheetHmm);
    pdf.save(`passport-sheet-${preset.id}.pdf`);
  };

  const validations = useMemo(() => {
    const warns: string[] = [];
    if (!sourceImg) return warns;
    if (sourceImg.naturalWidth < 800) warns.push("Image resolution is low — print quality may suffer.");
    if (face && face.h < sourceImg.naturalHeight * 0.2) warns.push("Face appears small — consider a closer photo.");
    if (face && face.h > sourceImg.naturalHeight * 0.7) warns.push("Face fills most of the frame — try stepping back.");
    return warns;
  }, [sourceImg, face]);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 -z-10 grid-bg" />
      <div className="glow-orb -z-10 h-[420px] w-[420px] -top-32 -left-20" style={{ background: "var(--indigo)" }} />
      <div className="glow-orb -z-10 h-[520px] w-[520px] -bottom-40 -right-20" style={{ background: "var(--violet)" }} />

      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          Passport<span className="text-gradient-primary">AI</span>
        </a>
        {stage === "edit" && (
          <button onClick={() => setStage("upload")} className="btn-ghost-glow text-sm">
            <ArrowLeft className="h-4 w-4" /> New photo
          </button>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20">
        <AnimatePresence mode="wait">
          {stage === "upload" && (
            <UploadView key="upload" onUpload={handleUpload} onUploadKeepBg={handleUploadKeepBg} error={error} />
          )}
          {stage === "processing" && (
            <ProcessingView key="processing" step={pipelineStep} bgProgress={bgProgress} skipBg={keepBackground} />
          )}
          {stage === "edit" && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid gap-6 lg:grid-cols-[1fr_360px]"
            >
              {/* Canvas */}
              <div className="rounded-3xl glass p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold">{preset.flag} {preset.name}</h2>
                    <p className="text-xs text-muted-foreground">{preset.width}×{preset.height} mm · {preset.dpi} DPI</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => exportPhoto("png")} className="btn-ghost-glow text-sm"><Download className="h-4 w-4" /> PNG</button>
                    <button onClick={() => exportPhoto("jpg")} className="btn-ghost-glow text-sm"><Download className="h-4 w-4" /> JPG</button>
                    <button onClick={() => setPrintOpen(true)} className="btn-hero text-sm" style={{ padding: "0.5rem 1.1rem" }}><Printer className="h-4 w-4" /> Print sheet</button>
                  </div>
                </div>
                <div className="relative mx-auto flex justify-center rounded-2xl bg-black/40 p-6">
                  <div className="relative">
                    <canvas ref={canvasRef} className="max-h-[70vh] rounded-xl shadow-[var(--shadow-elegant)]" />
                    {showGuides && (
                      <div className="pointer-events-none absolute inset-0 rounded-xl">
                        {/* Frame */}
                        <div className="absolute inset-0 rounded-xl border border-[var(--violet)]/40" />
                        {/* Head height band (preset compliant) */}
                        <div
                          className="absolute inset-x-[10%] border-y border-dashed border-[var(--violet)]/60"
                          style={{
                            top: `${(1 - preset.headMax / preset.height) * 50 + 5}%`,
                            height: `${(preset.headMax / preset.height) * 100 - 8}%`,
                          }}
                        />
                        {/* Face oval guide */}
                        <div
                          className="absolute left-1/2 -translate-x-1/2 rounded-[50%] border-2 border-[var(--violet)]/70 animate-pulse-glow"
                          style={{
                            top: "13%",
                            width: "44%",
                            height: `${((preset.headMin + preset.headMax) / 2 / preset.height) * 100}%`,
                          }}
                        />
                        {/* Center crosshair */}
                        <div className="absolute left-1/2 top-0 h-full w-px bg-[var(--violet)]/20" />
                        <div className="absolute left-0 top-1/2 h-px w-full bg-[var(--violet)]/20" />
                        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] text-[var(--violet)]">FACE GUIDE</span>
                        <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] text-emerald-400">● LIVE</span>
                      </div>
                    )}
                  </div>
                </div>
                {validations.length > 0 && (
                  <div className="mt-4 space-y-1">
                    {validations.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg bg-[var(--destructive)]/10 px-3 py-2 text-xs text-[var(--destructive)]">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {w}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Controls */}
              <aside className="space-y-4">
                <Panel title="Country / Document">
                  <div className="grid grid-cols-2 gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setPreset(p); setBgColor(p.bg); }}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-all ${
                          preset.id === p.id ? "border-[var(--violet)] bg-[var(--violet)]/10" : "border-border bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                      >
                        <span className="text-base">{p.flag}</span>
                        <span className="truncate">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </Panel>

                <Panel title="Background">
                  <label className="mb-3 flex items-center justify-between rounded-lg border border-border bg-white/[0.02] px-3 py-2 text-xs">
                    <span>Keep original background</span>
                    <input type="checkbox" checked={keepBackground} onChange={(e) => setKeepBackground(e.target.checked)} />
                  </label>
                  <div className={`grid grid-cols-6 gap-2 transition-opacity ${keepBackground ? "opacity-30 pointer-events-none" : ""}`}>
                    {BG_COLORS.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setBgColor(b.color)}
                        title={b.name}
                        className={`aspect-square rounded-lg border-2 transition-all ${
                          bgColor === b.color ? "border-[var(--violet)] scale-110" : "border-white/10"
                        }`}
                        style={{ background: b.color }}
                      />
                    ))}
                  </div>
                  <label className="mt-3 flex items-center justify-between rounded-lg px-1 text-xs text-muted-foreground">
                    <span>Show live face guides</span>
                    <input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} />
                  </label>
                </Panel>

                <Panel title="Enhance">
                  <div className="mb-3 grid grid-cols-4 gap-1">
                    {(["Natural", "Studio", "Pro", "Ultra"] as const).map((m, i) => (
                      <button
                        key={m}
                        onClick={() => setAdjustments(presetModes[i])}
                        className="rounded-lg border border-border bg-white/[0.02] px-2 py-1.5 text-[11px] hover:bg-white/[0.05]"
                      >{m}</button>
                    ))}
                  </div>
                  <Slider label="Brightness" value={adjustments.brightness} min={50} max={150} onChange={(v) => setAdjustments({ ...adjustments, brightness: v })} />
                  <Slider label="Contrast" value={adjustments.contrast} min={50} max={150} onChange={(v) => setAdjustments({ ...adjustments, contrast: v })} />
                  <Slider label="Saturation" value={adjustments.saturation} min={0} max={200} onChange={(v) => setAdjustments({ ...adjustments, saturation: v })} />
                  <Slider label="Warmth" value={adjustments.warmth} min={-50} max={100} onChange={(v) => setAdjustments({ ...adjustments, warmth: v })} />
                  <Slider label="Skin smooth" value={adjustments.smooth} min={0} max={100} onChange={(v) => setAdjustments({ ...adjustments, smooth: v })} />
                  <Slider label="Sharpen" value={adjustments.sharpen} min={0} max={100} onChange={(v) => setAdjustments({ ...adjustments, sharpen: v })} />
                  <Slider label="Vignette" value={adjustments.vignette} min={0} max={100} onChange={(v) => setAdjustments({ ...adjustments, vignette: v })} />
                </Panel>

                <Panel title="Position">
                  <Slider label="Zoom" value={Math.round(zoom * 100)} min={70} max={150} onChange={(v) => setZoom(v / 100)} />
                  <Slider label="Horizontal" value={offset.x} min={-100} max={100} onChange={(v) => setOffset({ ...offset, x: v })} />
                  <Slider label="Vertical" value={offset.y} min={-100} max={100} onChange={(v) => setOffset({ ...offset, y: v })} />
                  <button
                    onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); setAdjustments(DEFAULT_ADJUSTMENTS); }}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-1.5 text-xs hover:bg-white/[0.05]"
                  >
                    <RotateCw className="h-3 w-3" /> Reset
                  </button>
                </Panel>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {printOpen && (
          <PrintModal
            onClose={() => setPrintOpen(false)}
            preset={preset}
            getPhoto={renderHiRes}
            onExport={(sheet, w, h, type) => {
              if (type === "pdf") exportPdf(sheet, w, h);
              else downloadCanvas(sheet, `passport-sheet-${preset.id}`, type);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const presetModes: Adjustments[] = [
  { brightness: 100, contrast: 100, saturation: 100, warmth: 0, smooth: 0, sharpen: 0, vignette: 0 },
  { brightness: 105, contrast: 108, saturation: 105, warmth: 8, smooth: 25, sharpen: 15, vignette: 0 },
  { brightness: 108, contrast: 115, saturation: 110, warmth: 12, smooth: 40, sharpen: 30, vignette: 8 },
  { brightness: 110, contrast: 120, saturation: 115, warmth: 15, smooth: 55, sharpen: 45, vignette: 15 },
];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl glass p-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-[var(--violet)]">{value}</span>
      </div>
      <input
        type="range"
        min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--primary)]"
      />
    </div>
  );
}

function UploadView({ onUpload, onUploadKeepBg, error }: { onUpload: (f: File) => void; onUploadKeepBg: (f: File) => void; error: string | null }) {
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<"ai" | "keep">("ai");
  const submit = (f: File) => (mode === "ai" ? onUpload(f) : onUploadKeepBg(f));
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="mx-auto max-w-2xl py-10 text-center"
    >
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--violet)]">Studio</p>
      <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
        Upload a photo.<br /><span className="text-gradient-primary">We do the rest.</span>
      </h1>
      <p className="mt-4 text-muted-foreground">Any selfie or portrait. JPG, PNG, HEIC. Processed in your browser — your photo never leaves your device.</p>

      <div className="mx-auto mt-6 inline-flex rounded-full border border-border bg-white/[0.03] p-1 text-xs">
        <button
          onClick={() => setMode("ai")}
          className={`rounded-full px-4 py-1.5 transition-all ${mode === "ai" ? "bg-[var(--gradient-primary)] text-white shadow-[var(--shadow-glow)]" : "text-muted-foreground"}`}
        >✨ AI remove background</button>
        <button
          onClick={() => setMode("keep")}
          className={`rounded-full px-4 py-1.5 transition-all ${mode === "keep" ? "bg-[var(--gradient-primary)] text-white shadow-[var(--shadow-glow)]" : "text-muted-foreground"}`}
        >⚡ Keep original · instant</button>
      </div>

      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) submit(f);
        }}
        className={`mt-6 block cursor-pointer rounded-3xl border-2 border-dashed p-12 transition-all ${
          dragging ? "border-[var(--violet)] bg-[var(--violet)]/10" : "border-border bg-white/[0.02] hover:bg-white/[0.05]"
        }`}
      >
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && submit(e.target.files[0])} />
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)]">
          <Upload className="h-7 w-7 text-white" />
        </div>
        <div className="mt-5 font-display text-lg font-medium">Drop your photo here</div>
        <div className="mt-1 text-sm text-muted-foreground">
          {mode === "ai" ? "AI will remove the background (~8s)" : "Skip AI — ready in under a second"}
        </div>
      </label>

      {error && (
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--destructive)]/15 px-4 py-2 text-sm text-[var(--destructive)]">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { i: ImageIcon, t: "Any photo works", d: "Selfie, scan, or studio shot" },
          { i: Wand2, t: "Auto retouch", d: "Lighting, skin, sharpness" },
          { i: FileDown, t: "Print or download", d: "4R sheets, PNG, JPG, PDF" },
        ].map((x) => (
          <div key={x.t} className="rounded-2xl glass p-4 text-left">
            <x.i className="h-4 w-4 text-[var(--violet)]" />
            <div className="mt-2 text-sm font-medium">{x.t}</div>
            <div className="text-xs text-muted-foreground">{x.d}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ProcessingView({ step, bgProgress, skipBg }: { step: number; bgProgress: number; skipBg: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="mx-auto flex max-w-xl flex-col items-center py-20 text-center"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulse-glow rounded-full bg-[var(--violet)] blur-2xl" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 rounded-full border-2 border-dashed border-[var(--violet)]/40"
        />
        <div className="relative grid h-24 w-24 place-items-center rounded-full bg-[var(--gradient-primary)] shadow-[var(--shadow-glow)]">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
      </div>
      <h2 className="font-display text-3xl font-semibold">
        {skipBg ? "Optimizing your photo…" : "AI is working…"}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {skipBg ? "Ready in a moment." : "Removing background — usually 5–10 seconds."}
      </p>

      <div className="mt-8 w-full space-y-3 rounded-2xl glass p-5 text-left">
        {PIPELINE.map((label, i) => {
          const done = i < step;
          const active = i === step;
          const isBgStep = i === 2;
          return (
            <div key={label}>
              <div className="flex items-center gap-3">
                <div className={`grid h-6 w-6 place-items-center rounded-full transition-all ${
                  done ? "bg-[var(--violet)]" : active ? "bg-[var(--violet)]/30" : "bg-white/5"
                }`}>
                  {done ? <Check className="h-3 w-3 text-white" /> : active ? <Loader2 className="h-3 w-3 animate-spin text-[var(--violet)]" /> : null}
                </div>
                <span className={`text-sm ${done || active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                {active && isBgStep && !skipBg && (
                  <span className="ml-auto font-mono text-[10px] text-[var(--violet)]">{Math.round(bgProgress * 100)}%</span>
                )}
              </div>
              {active && isBgStep && !skipBg && (
                <div className="ml-9 mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full bg-[var(--gradient-primary)]"
                    style={{ width: `${bgProgress * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function PrintModal({
  onClose, preset, getPhoto, onExport,
}: {
  onClose: () => void;
  preset: Preset;
  getPhoto: () => HTMLCanvasElement | null;
  onExport: (sheet: HTMLCanvasElement, w: number, h: number, type: "png" | "jpg" | "pdf") => void;
}) {
  const [copies, setCopies] = useState(9);
  const [sheetId, setSheetId] = useState("4r");
  const [cutMarks, setCutMarks] = useState(false);
  const [border, setBorder] = useState(true);
  const [gapMm, setGapMm] = useState(2);
  const [studioMode, setStudioMode] = useState(true);
  const sheet = PRINT_SIZES.find((s) => s.id === sheetId)!;
  const previewRef = useRef<HTMLCanvasElement>(null);
  const isStudio = studioMode && copies === 9;

  useEffect(() => {
    const photo = getPhoto();
    if (!photo) return;
    const sheetCanvas = isStudio
      ? buildStudio4R9(photo, { border, cutMarks })
      : buildPrintSheet(photo, sheet.w, sheet.h, preset.width, preset.height, copies, 150, cutMarks, { gapMm, border });
    const c = previewRef.current!;
    c.width = sheetCanvas.width;
    c.height = sheetCanvas.height;
    c.getContext("2d")!.drawImage(sheetCanvas, 0, 0);
  }, [copies, sheetId, cutMarks, border, gapMm, preset, getPhoto, sheet, isStudio]);

  const handleExport = (type: "png" | "jpg" | "pdf") => {
    const photo = getPhoto();
    if (!photo) return;
    if (isStudio) {
      const sheetCanvas = buildStudio4R9(photo, { border, cutMarks });
      // 1200×1800 px @ 300 DPI = 101.6×152.4 mm (4×6 in portrait)
      onExport(sheetCanvas, 101.6, 152.4, type);
      return;
    }
    const sheetCanvas = buildPrintSheet(photo, sheet.w, sheet.h, preset.width, preset.height, copies, preset.dpi, cutMarks, { gapMm, border });
    onExport(sheetCanvas, sheet.w, sheet.h, type);
  };


  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl glass p-6"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          <div className="flex items-center justify-center rounded-2xl bg-white p-4">
            <canvas ref={previewRef} className="max-h-[60vh] max-w-full" />
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Print Sheet</h2>

            <label className="flex items-start gap-3 rounded-2xl border border-[var(--violet)]/40 bg-[var(--violet)]/10 p-3 text-xs">
              <input
                type="checkbox" checked={studioMode}
                onChange={(e) => { setStudioMode(e.target.checked); if (e.target.checked) setCopies(9); }}
                className="mt-0.5"
              />
              <div>
                <div className="font-medium text-foreground">Studio 3×3 · pixel-perfect</div>
                <div className="text-muted-foreground">4×6 in @ 300 DPI · 9 photos at 3.5×4.5 cm. Prints to legal size in Photoshop with zero scaling.</div>
              </div>
            </label>

            <div className={isStudio ? "pointer-events-none opacity-40" : ""}>
            <Panel title="Sheet size">

              <div className="space-y-1">
                {PRINT_SIZES.map((s) => (
                  <button
                    key={s.id} onClick={() => setSheetId(s.id)}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                      sheetId === s.id ? "bg-[var(--violet)]/15 text-foreground" : "text-muted-foreground hover:bg-white/[0.05]"
                    }`}
                  >{s.name}</button>
                ))}
              </div>
            </Panel>
            <Panel title="Layout">
              <div className="grid grid-cols-4 gap-2">
                {[4, 6, 8, 9, 12, 16].map((n) => (
                  <button
                    key={n} onClick={() => setCopies(n)}
                    className={`rounded-lg border px-2 py-1.5 text-sm ${
                      copies === n ? "border-[var(--violet)] bg-[var(--violet)]/10" : "border-border"
                    }`}
                  >{n}</button>
                ))}
              </div>
              <div className="mt-3">
                <Slider label="Gap (mm)" value={gapMm} min={0} max={8} onChange={setGapMm} />
              </div>
            </Panel>
            </div>
            <Panel title="Marks">
              <label className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Thin border per photo</span>
                <input type="checkbox" checked={border} onChange={(e) => setBorder(e.target.checked)} />
              </label>
              <label className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Corner cut marks</span>
                <input type="checkbox" checked={cutMarks} onChange={(e) => setCutMarks(e.target.checked)} />
              </label>
            </Panel>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleExport("png")} className="btn-ghost-glow text-xs" style={{ padding: "0.5rem" }}>PNG</button>
              <button onClick={() => handleExport("jpg")} className="btn-ghost-glow text-xs" style={{ padding: "0.5rem" }}>JPG</button>
              <button onClick={() => handleExport("pdf")} className="btn-hero text-xs" style={{ padding: "0.5rem" }}>PDF</button>
            </div>
            <button onClick={onClose} className="w-full text-xs text-muted-foreground hover:text-foreground">Close</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function tick() { return new Promise((r) => setTimeout(r, 250)); }
