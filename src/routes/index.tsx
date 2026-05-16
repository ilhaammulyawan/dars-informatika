import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { ClassCard } from "@/components/ClassCard";
import { TeacherProfile } from "@/components/TeacherProfile";
import { getClasses, type ClassItem } from "@/lib/supabase-helpers";
import { getHomeContent, DEFAULT_HOME_CONTENT, getIcon, renderFooter, type HomeContent } from "@/lib/site-content";
import { BookOpen, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Dars Informatika — Platform Materi Informatika" },
      { name: "description", content: "Akses materi pelajaran informatika untuk semua kelas. Belajar lebih mudah dan terstruktur." },
      { property: "og:title", content: "Dars Informatika — Platform Materi Informatika" },
      { property: "og:description", content: "Akses materi pelajaran informatika untuk semua kelas." },
    ],
  }),
});

function Index() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);

  useEffect(() => {
    getClasses().then((data) => { setClasses(data); setLoading(false); }).catch(() => setLoading(false));
    getHomeContent().then(setContent).catch(() => {});
  }, []);

  const grouped = classes.reduce<Record<string, ClassItem[]>>((acc, c) => {
    const key = c.grade;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const grades = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-hero-gradient-from to-hero-gradient-to px-4 py-16 text-primary-foreground">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            {content.hero.badge}
          </div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            {content.hero.title_line1}<br />{content.hero.title_line2}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-primary-foreground/80">
            {content.hero.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/70">
            {content.hero.info_items.map((item, idx) => {
              const Icon = getIcon(item.icon, BookOpen);
              return (
                <div key={idx} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute -bottom-1 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Why Learn Informatics Here */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            {content.why.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {content.why.description}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.why.features.map((item, idx) => {
            const Icon = getIcon(item.icon);
            return (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Class List */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            Materi Pelajaran
          </span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">{content.classes_title}</h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Pilih kelas untuk mulai menjelajahi materi pembelajaran informatika.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : classes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Belum ada kelas</h3>
            <p className="mt-2 text-sm text-muted-foreground">Admin belum menambahkan kelas. Silakan kembali lagi nanti.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {grades.map((grade) => (
              <div key={grade}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                    Kelas {grade}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {grouped[grade].length} {grouped[grade].length > 1 ? "kelas" : "kelas"}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {grouped[grade].map((c) => (
                    <ClassCard key={c.id} classItem={c} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Teacher profile */}
      <TeacherProfile />

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-8">
        <div className="mx-auto max-w-5xl text-center text-sm text-muted-foreground">
          {renderFooter(content.footer_text)}
        </div>
      </footer>
    </div>
  );
}
