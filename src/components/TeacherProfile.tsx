import { useEffect, useState } from "react";
import { GraduationCap, Award, Users, BookOpen } from "lucide-react";
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

  // Parse position into list items (split by comma)
  const positionItems = profile.position
    ? profile.position.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Assign icons cyclically
  const icons = [Award, Users, BookOpen];

  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h2 className="mb-6 text-2xl font-bold text-foreground">Tentang Pengajar</h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="grid gap-6 sm:grid-cols-[200px_1fr] sm:gap-8">
          {/* Photo */}
          <div className="flex justify-center sm:block">
            <div className="h-48 w-48 overflow-hidden rounded-2xl border border-border shadow-sm sm:h-full sm:w-full">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={`Foto ${profile.full_name}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-6xl">
                  👨‍🏫
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
              {profile.full_name}
            </h3>
            <p className="mt-1 text-base font-medium text-primary">
              Guru Informatika
            </p>

            <ul className="mt-4 space-y-2.5">
              {profile.education && (
                <li className="flex items-center gap-2.5 text-sm text-foreground/85">
                  <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
                  <span>{profile.education}</span>
                </li>
              )}
              {positionItems.map((item, idx) => {
                const Icon = icons[idx % icons.length];
                return (
                  <li key={idx} className="flex items-center gap-2.5 text-sm text-foreground/85">
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="capitalize">{item}</span>
                  </li>
                );
              })}
            </ul>

            {profile.bio && (
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
