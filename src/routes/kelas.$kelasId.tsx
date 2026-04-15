import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { MaterialCard } from "@/components/MaterialCard";
import { getClassById, getMaterialsByClassId, type ClassItem, type MaterialItem } from "@/lib/supabase-helpers";
import { ArrowLeft, BookOpen } from "lucide-react";

export const Route = createFileRoute("/kelas/$kelasId")({
  component: KelasPage,
});

function KelasPage() {
  const { kelasId } = Route.useParams();
  const [classItem, setClassItem] = useState<ClassItem | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getClassById(kelasId),
      getMaterialsByClassId(kelasId),
    ]).then(([c, m]) => {
      setClassItem(c);
      setMaterials(m);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [kelasId]);

  const categories = [...new Set(materials.map((m) => m.category).filter(Boolean))] as string[];
  const filtered = activeCategory
    ? materials.filter((m) => m.category === activeCategory)
    : materials;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!classItem) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground">Kelas tidak ditemukan</h1>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Breadcrumb */}
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-3xl">
            {classItem.icon || "📚"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{classItem.name}</h1>
            {classItem.description && (
              <p className="mt-1 text-sm text-muted-foreground">{classItem.description}</p>
            )}
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !activeCategory ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground hover:bg-accent/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Materials */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Belum ada materi</h3>
            <p className="mt-2 text-sm text-muted-foreground">Materi untuk kelas ini belum tersedia.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((m) => (
              <MaterialCard key={m.id} material={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
