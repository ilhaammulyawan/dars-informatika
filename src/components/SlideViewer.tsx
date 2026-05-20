import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, LayoutGrid, X } from "lucide-react";

interface Slide {
  title: string;
  html: string;
}

function parseSlides(html: string): Slide[] {
  if (!html) return [];
  // Split by <hr> (any attributes/whitespace)
  const chunks = html.split(/<hr\b[^>]*\/?>/gi).map((c) => c.trim()).filter(Boolean);
  return chunks.map((chunk, idx) => {
    let title = `Slide ${idx + 1}`;
    if (typeof window !== "undefined") {
      const div = document.createElement("div");
      div.innerHTML = chunk;
      const heading = div.querySelector("h1, h2, h3");
      if (heading?.textContent) title = heading.textContent.trim();
    } else {
      const m = chunk.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
      if (m) title = m[1].replace(/<[^>]+>/g, "").trim() || title;
    }
    return { title, html: chunk };
  });
}

export function SlideViewer({ content }: { content: string }) {
  const slides = useMemo(() => parseSlides(content), [content]);
  const [current, setCurrent] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const go = (i: number) => setCurrent(Math.max(0, Math.min(slides.length - 1, i)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showGrid) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        go(current + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(current - 1);
      } else if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen?.();
      } else if (e.key.toLowerCase() === "g") {
        setShowGrid((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, slides.length, isFullscreen, showGrid]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  if (slides.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        Konten belum tersedia. Tambahkan konten dan gunakan garis pemisah (—) untuk membuat slide.
      </div>
    );
  }

  const slide = slides[current];

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border border-border bg-card shadow-sm overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-0" : ""
      }`}
    >
      {/* Top nav strip */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card/95 backdrop-blur px-2 py-1.5 overflow-x-auto scrollbar-thin">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              i === current
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            title={s.title}
          >
            <span className="mr-1 opacity-70">{i + 1}.</span>
            <span className="max-w-[140px] truncate inline-block align-middle">{s.title}</span>
          </button>
        ))}
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <button
            onClick={() => setShowGrid(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Lihat semua slide (G)"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Layar penuh"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Slide body */}
      <div className={`relative ${isFullscreen ? "h-[calc(100vh-49px)] overflow-y-auto" : "min-h-[60vh]"}`}>
        <article
          key={current}
          className="material-content animate-in fade-in slide-in-from-bottom-2 duration-300 px-6 py-8 sm:px-10 sm:py-12 max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: slide.html }}
        />
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-3">
        <button
          onClick={() => go(current - 1)}
          disabled={current === 0}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" /> Sebelumnya
        </button>
        <div className="text-xs font-medium text-muted-foreground tabular-nums">
          {current + 1} / {slides.length}
        </div>
        <button
          onClick={() => go(current + 1)}
          disabled={current === slides.length - 1}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Berikutnya <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Grid overview */}
      {showGrid && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Semua Slide ({slides.length})</h3>
            <button onClick={() => setShowGrid(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {slides.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { go(i); setShowGrid(false); }}
                  className={`group relative aspect-video overflow-hidden rounded-xl border-2 bg-card text-left transition-all hover:shadow-md ${
                    i === current ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="absolute left-2 top-2 z-10 rounded-md bg-foreground/80 px-1.5 py-0.5 text-[10px] font-bold text-background">
                    {i + 1}
                  </div>
                  <div
                    className="material-content pointer-events-none absolute inset-0 origin-top-left scale-[0.35] p-4"
                    style={{ width: "285%", height: "285%" }}
                    dangerouslySetInnerHTML={{ __html: s.html }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/90 to-transparent p-2 pt-6">
                    <div className="truncate text-xs font-medium text-foreground">{s.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
