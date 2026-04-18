import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { ClassCard } from "@/components/ClassCard";
import { TeacherProfile } from "@/components/TeacherProfile";
import { getClasses, type ClassItem } from "@/lib/supabase-helpers";
import { BookOpen, GraduationCap, Sparkles, Code2, Lightbulb, Rocket, Target } from "lucide-react";

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

      {/* Why Learn Informatics Here */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Kenapa Belajar Informatika di Sini?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Platform yang dirancang khusus untuk memudahkan siswa memahami dunia teknologi dengan pendekatan yang menyenangkan.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Code2, title: "Materi Terstruktur", desc: "Disusun rapi per kelas dan topik agar mudah diikuti dari dasar." },
            { icon: Lightbulb, title: "Konsep Mudah Dipahami", desc: "Penjelasan sederhana dilengkapi contoh dan video pembelajaran." },
            { icon: Rocket, title: "Akses Kapan Saja", desc: "Belajar fleksibel di mana saja dan kapan saja, gratis untuk semua siswa." },
            { icon: Target, title: "Siap Hadapi Era Digital", desc: "Membekali siswa dengan kompetensi informatika untuk masa depan." },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
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

      {/* Teacher profile */}
      <TeacherProfile />

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-8">
        <div className="mx-auto max-w-5xl text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Dars Informatika — Dibuat oleh Guru Informatika
        </div>
      </footer>
    </div>
  );
}
