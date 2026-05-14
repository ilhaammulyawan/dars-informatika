import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { getHomeContent, DEFAULT_HOME_CONTENT, type HomeContent } from "@/lib/site-content";

export function PublicHeader() {
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);

  useEffect(() => {
    getHomeContent().then(setContent).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          {content.logo_url ? (
            <img src={content.logo_url} alt={content.site_name} className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <span className="text-lg font-bold text-foreground">{content.site_name}</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-sm font-medium text-primary" }}
            activeOptions={{ exact: true }}
          >
            Beranda
          </Link>
          <Link
            to="/admin"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
