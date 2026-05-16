import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { ClassItem } from "@/lib/supabase-helpers";

export function ClassCard({ classItem }: { classItem: ClassItem }) {
  return (
    <Link
      to="/kelas/$kelasId"
      params={{ kelasId: classItem.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
    >
      {/* Decorative gradient blob */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/0 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/40 text-2xl shadow-inner ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          {classItem.icon || "📚"}
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>

      <div className="mt-4 min-w-0">
        <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
          {classItem.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {classItem.description || `Kelas ${classItem.grade}`}
        </p>
      </div>
    </Link>
  );
}
