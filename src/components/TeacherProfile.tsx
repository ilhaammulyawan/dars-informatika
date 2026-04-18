import { useEffect, useState } from "react";
import { GraduationCap, Mail, Phone, BookOpenCheck } from "lucide-react";
import { getTeacherProfile, type TeacherProfile as TP } from "@/lib/supabase-helpers";

export function TeacherProfile() {
  const [profile, setProfile] = useState<TP | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherProfile()
      .then((p) => setProfile(p))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !profile) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="grid gap-0 sm:grid-cols-[200px_1fr]">
          {/* Photo */}
          <div className="relative bg-gradient-to-br from-hero-gradient-from to-hero-gradient-to p-6 sm:p-4">
            <div className="mx-auto h-32 w-32 overflow-hidden rounded-full ring-4 ring-card sm:h-40 sm:w-40">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={`Foto ${profile.full_name}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-4xl">
                  👨‍🏫
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              <BookOpenCheck className="h-3 w-3" />
              Pengajar
            </div>
            <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
              {profile.full_name}
            </h2>
            {profile.position && (
              <p className="mt-1 text-sm text-muted-foreground">{profile.position}</p>
            )}

            {profile.bio && (
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                {profile.bio}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {profile.education && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>{profile.education}</span>
                </div>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 hover:text-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{profile.email}</span>
                </a>
              )}
              {profile.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
