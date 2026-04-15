import { Link } from "@tanstack/react-router";
import { FileText, Video, Download, ChevronRight } from "lucide-react";
import type { MaterialItem } from "@/lib/supabase-helpers";

export function MaterialCard({ material }: { material: MaterialItem }) {
  return (
    <Link
      to="/materi/$materiId"
      params={{ materiId: material.id }}
      className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
        {material.video_url ? (
          <Video className="h-5 w-5 text-primary" />
        ) : material.file_url ? (
          <Download className="h-5 w-5 text-primary" />
        ) : (
          <FileText className="h-5 w-5 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {material.title}
        </h3>
        {material.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {material.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {material.category && (
            <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              {material.category}
            </span>
          )}
          {material.video_url && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              Video
            </span>
          )}
          {material.file_url && (
            <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
              File
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
