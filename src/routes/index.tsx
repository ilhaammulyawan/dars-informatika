import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { ClassCard } from "@/components/ClassCard";
import { getClasses, type ClassItem } from "@/lib/supabase-helpers";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";

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

  useEffect(() => {
    getClasses().then((data) => { setClasses(data); setLoading(false); }).catch(() => setLoading(false));
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
            Platform Materi Informatika
          </div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            Belajar Informatika<br />Jadi Lebih Mudah
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-primary-foreground/80">
            Pilih kelas kamu dan akses semua materi pembelajaran informatika secara gratis.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-primary-foreground/70">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Materi Lengkap</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>Semua Kelas</span>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-1 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Class List */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-8 text-2xl font-bold text-foreground">Pilih Kelas</h2>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : classes.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Belum ada kelas</h3>
            <p className="mt-2 text-sm text-muted-foreground">Admin belum menambahkan kelas. Silakan kembali lagi nanti.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grades.map((grade) => (
              <div key={grade}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Kelas {grade}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {grouped[grade].map((c) => (
                    <ClassCard key={c.id} classItem={c} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-8">
        <div className="mx-auto max-w-5xl text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Dars Informatika — Dibuat oleh Guru Informatika
        </div>
      </footer>
    </div>
  );
}
