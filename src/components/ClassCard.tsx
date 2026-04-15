import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ClassItem } from "@/lib/supabase-helpers";

export function ClassCard({ classItem }: { classItem: ClassItem }) {
  return (
    <Link
      to="/kelas/$kelasId"
      params={{ kelasId: classItem.id }}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent text-2xl">
        {classItem.icon || "📚"}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {classItem.name}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
          {classItem.description || `Kelas ${classItem.grade}`}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
