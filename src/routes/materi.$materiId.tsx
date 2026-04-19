import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { getMaterialById, getClassById, type MaterialItem, type ClassItem } from "@/lib/supabase-helpers";
import { ArrowLeft, Download, Calendar, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/materi/$materiId")({
  component: MateriPage,
});

function MateriPage() {
  const { materiId } = Route.useParams();
  const [material, setMaterial] = useState<MaterialItem | null>(null);
  const [classItem, setClassItem] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMaterialById(materiId).then(async (m) => {
      setMaterial(m);
      if (m) {
        const c = await getClassById(m.class_id);
        setClassItem(c);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [materiId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="mt-6 h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground">Materi tidak ditemukan</h1>
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

      <article className="mx-auto max-w-3xl px-4 py-8">
        {/* Back link */}
        {classItem && (
          <Link
            to="/kelas/$kelasId"
            params={{ kelasId: classItem.id }}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {classItem.name}
          </Link>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{material.title}</h1>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {new Date(material.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </div>
          {material.category && (
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              {material.category}
            </span>
          )}
        </div>

        {material.description && (
          <p className="mt-4 text-muted-foreground leading-relaxed">{material.description}</p>
        )}

        {/* Video embed */}
        {material.video_url && (
          <div className="mt-6">
            <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={getYoutubeEmbedUrl(material.video_url)}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={material.title}
              />
            </div>
          </div>
        )}

        {/* File download */}
        {material.file_url && (
          <div className="mt-6">
            <a
              href={material.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Download File
            </a>
          </div>
        )}

        {/* Attachment links */}
        {material.attachments && material.attachments.length > 0 && (
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">Tautan & File Tambahan</h2>
            <ul className="mt-3 space-y-2">
              {material.attachments.map((att, idx) => (
                <li key={idx}>
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
                    <span className="flex-1 truncate">{att.label || att.url}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-primary">Buka</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content */}
        {material.content && (
          <div
            className="material-content mt-8 border-t border-border pt-8"
            dangerouslySetInnerHTML={{ __html: material.content }}
          />
        )}
      </article>
    </div>
  );
}

function getYoutubeEmbedUrl(url: string): string {
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = url.match(regExp);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return url;
}
