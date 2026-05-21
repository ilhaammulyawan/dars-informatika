import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Search,
  Sun,
  Moon,
  CheckCircle2,
  Circle,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface Lesson {
  index: number; // global slide index
  title: string;
  html: string;
  level: 1 | 2 | 3; // heading level used
}

interface Section {
  title: string;
  lessons: Lesson[]; // first lesson is the section cover when present
  startIndex: number;
}

function parseChunks(html: string): { title: string; html: string; level: 1 | 2 | 3 }[] {
  if (!html) return [];
  const chunks = html.split(/<hr\b[^>]*\/?>/gi).map((c) => c.trim()).filter(Boolean);
  return chunks.map((chunk, idx) => {
    let title = `Slide ${idx + 1}`;
    let level: 1 | 2 | 3 = 3;
    if (typeof window !== "undefined") {
      const div = document.createElement("div");
      div.innerHTML = chunk;
      const h = div.querySelector("h1, h2, h3");
      if (h?.textContent) {
        title = h.textContent.trim() || title;
        const tag = h.tagName.toLowerCase();
        level = tag === "h1" ? 1 : tag === "h2" ? 2 : 3;
      }
    }
    return { title, html: chunk, level };
  });
}

function buildSections(chunks: ReturnType<typeof parseChunks>): Section[] {
  const sections: Section[] = [];
  chunks.forEach((c, i) => {
    if (c.level === 1 || sections.length === 0) {
      sections.push({
        title: c.level === 1 ? c.title : "Materi",
        lessons: [{ index: i, title: c.title, html: c.html, level: c.level }],
        startIndex: i,
      });
    } else {
      sections[sections.length - 1].lessons.push({
        index: i,
        title: c.title,
        html: c.html,
        level: c.level,
      });
    }
  });
  return sections;
}

export function CourseViewer({ content, storageKey }: { content: string; storageKey: string }) {
  const chunks = useMemo(() => parseChunks(content), [content]);
  const sections = useMemo(() => buildSections(chunks), [chunks]);
  const [current, setCurrent] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Load progress
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`course-progress:${storageKey}`);
      if (raw) setCompleted(new Set(JSON.parse(raw) as number[]));
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Mark current as completed
  useEffect(() => {
    setCompleted((prev) => {
      if (prev.has(current)) return prev;
      const next = new Set(prev);
      next.add(current);
      try {
        localStorage.setItem(`course-progress:${storageKey}`, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }, [current, storageKey]);

  const go = (i: number) => setCurrent(Math.max(0, Math.min(chunks.length - 1, i)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        go(current + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, chunks.length]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  if (chunks.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        Konten belum tersedia. Tambahkan konten dan gunakan garis pemisah (—) untuk membuat materi.
      </div>
    );
  }

  // Section numbering helpers
  const findSectionFor = (idx: number) => {
    for (let s = 0; s < sections.length; s++) {
      if (sections[s].lessons.some((l) => l.index === idx)) return s;
    }
    return 0;
  };
  const labelFor = (sIdx: number, lIdx: number) => `${sIdx + 1}.${lIdx}`;
  const sectionLabel = (sIdx: number) => `${sIdx + 1}.0`;

  const currentSection = findSectionFor(current);
  const totalLessons = chunks.length;
  const completedCount = completed.size;

  // Filtered sections for search
  const q = search.trim().toLowerCase();
  const filtered = q
    ? sections
        .map((s) => ({
          ...s,
          lessons: s.lessons.filter((l) => l.title.toLowerCase().includes(q)),
        }))
        .filter((s) => s.lessons.length > 0 || s.title.toLowerCase().includes(q))
    : sections;

  const slide = chunks[current];

  return (
    <div
      ref={containerRef}
      className={`${dark ? "course-dark" : ""} rounded-2xl border border-border bg-card overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-0" : ""
      }`}
    >
      <style>{`
        .course-dark { background: #0f172a; color: #e2e8f0; }
        .course-dark .course-sidebar { background: #0b1224; border-color: #1e293b; }
        .course-dark .course-main { background: #0f172a; }
        .course-dark .course-topbar { background: #0b1224; border-color: #1e293b; }
        .course-dark .course-bottombar { background: #0b1224; border-color: #1e293b; }
        .course-dark .course-item:hover { background: #1e293b; }
        .course-dark .course-item-active { background: #1e3a8a; color: #fff; }
        .course-dark .course-input { background: #1e293b; border-color: #334155; color: #e2e8f0; }
        .course-dark .course-btn { background: #1e293b; border-color: #334155; color: #e2e8f0; }
        .course-dark .course-muted { color: #94a3b8; }
        .course-dark .material-content, .course-dark .material-content * { color: #e2e8f0; }
        .course-dark .material-content a { color: #93c5fd; }
        .course-dark .material-content code { background: #1e293b; color: #fbbf24; }
        .course-dark .material-content pre { background: #020617; }
      `}</style>

      <div className={`flex ${isFullscreen ? "h-screen" : "h-[78vh] min-h-[600px]"}`}>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="course-sidebar w-72 shrink-0 border-r border-border bg-muted/30 flex flex-col">
            <div className="border-b border-border p-3">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Daftar Materi</h3>
              </div>
              <div className="relative">
                <Search className="course-muted absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari materi..."
                  className="course-input h-8 w-full rounded-md border border-input bg-background pl-7 pr-2 text-xs"
                />
              </div>
              <div className="course-muted mt-2 text-[11px] text-muted-foreground">
                Progress: {completedCount}/{totalLessons}
              </div>
              <div className="mt-1 h-1 w-full rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(completedCount / totalLessons) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filtered.map((sec, sIdx) => {
                const realIdx = sections.indexOf(
                  sections.find((s) => s.startIndex === sec.startIndex)!,
                );
                return (
                  <div key={sec.startIndex} className="mb-3">
                    <div className="course-muted px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {sectionLabel(realIdx)} {sec.title}
                    </div>
                    <ul className="space-y-0.5">
                      {sec.lessons.map((l, lIdx) => {
                        const isActive = l.index === current;
                        const isDone = completed.has(l.index);
                        return (
                          <li key={l.index}>
                            <button
                              onClick={() => go(l.index)}
                              className={`course-item w-full flex items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                                isActive
                                  ? "course-item-active bg-primary/10 text-primary font-medium"
                                  : "hover:bg-accent text-foreground"
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                              ) : (
                                <Circle className="course-muted mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              )}
                              <span className="flex-1">
                                <span className="course-muted mr-1 text-muted-foreground">
                                  {labelFor(realIdx, lIdx + 1)}
                                </span>
                                {l.title}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className="course-muted px-2 py-4 text-center text-xs text-muted-foreground">
                  Tidak ada hasil
                </p>
              )}
            </div>
          </aside>
        )}

        {/* Main */}
        <div className="course-main flex-1 flex flex-col min-w-0 bg-background">
          {/* Top bar */}
          <div className="course-topbar flex items-center gap-2 border-b border-border bg-card/50 px-3 py-2">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="course-btn rounded-md p-1.5 hover:bg-accent"
              title={sidebarOpen ? "Tutup daftar" : "Buka daftar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>
            <div className="course-muted truncate text-xs font-medium text-muted-foreground">
              {sectionLabel(currentSection)} {sections[currentSection]?.title}
              <span className="mx-1.5">›</span>
              <span className="text-foreground">{slide.title}</span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setDark((v) => !v)}
                className="course-btn rounded-md p-1.5 hover:bg-accent"
                title="Mode gelap"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                onClick={toggleFullscreen}
                className="course-btn rounded-md p-1.5 hover:bg-accent"
                title="Layar penuh"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="relative flex-1 overflow-y-auto">
            <article
              key={current}
              className="material-content animate-in fade-in duration-200 mx-auto max-w-3xl px-6 py-8 sm:px-10 sm:py-12"
              dangerouslySetInnerHTML={{ __html: slide.html }}
            />
          </div>

          {/* Bottom bar */}
          <div className="course-bottombar flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-3">
            <button
              onClick={() => go(current - 1)}
              disabled={current === 0}
              className="course-btn flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" /> Sebelumnya
            </button>
            <div className="course-muted text-xs font-medium text-muted-foreground tabular-nums">
              {current + 1} / {chunks.length}
            </div>
            <button
              onClick={() => go(current + 1)}
              disabled={current === chunks.length - 1}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Berikutnya <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
