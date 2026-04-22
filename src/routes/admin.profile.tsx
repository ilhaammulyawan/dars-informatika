import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getTeacherProfile,
  upsertTeacherProfile,
  uploadTeacherPhoto,
  type TeacherProfile,
} from "@/lib/supabase-helpers";
import { BookOpen, ArrowLeft, Save, Upload, LogOut, Eye, Globe } from "lucide-react";
import { InstagramIcon, FacebookIcon, YoutubeIcon, LinkedinIcon, TiktokIcon } from "@/components/SocialIcons";

export const Route = createFileRoute("/admin/profile")({
  component: AdminProfilePage,
  head: () => ({
    meta: [{ title: "Profil Pengajar — Admin" }, { name: "robots", content: "noindex" }],
  }),
});

function AdminProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);

  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [education, setEducation] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const load = useCallback(async () => {
    const p = await getTeacherProfile();
    if (p) {
      setProfile(p);
      setFullName(p.full_name);
      setPosition(p.position || "");
      setEducation(p.education || "");
      setBio(p.bio || "");
      setEmail(p.email || "");
      setPhone(p.phone || "");
      setPhotoUrl(p.photo_url || "");
      setInstagramUrl(p.instagram_url || "");
      setFacebookUrl(p.facebook_url || "");
      setYoutubeUrl(p.youtube_url || "");
      setTiktokUrl(p.tiktok_url || "");
      setLinkedinUrl(p.linkedin_url || "");
      setWebsiteUrl(p.website_url || "");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/admin" });
      else load();
    });
  }, [navigate, load]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin" });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadTeacherPhoto(file);
      setPhotoUrl(url);
    } catch {
      alert("Gagal mengupload foto");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await upsertTeacherProfile({
        id: profile?.id,
        full_name: fullName,
        position,
        education,
        bio,
        email,
        phone,
        photo_url: photoUrl,
        instagram_url: instagramUrl || null,
        facebook_url: facebookUrl || null,
        youtube_url: youtubeUrl || null,
        tiktok_url: tiktokUrl || null,
        linkedin_url: linkedinUrl || null,
        website_url: websiteUrl || null,
      });
      setProfile(saved as TeacherProfile);
      alert("Profil berhasil disimpan");
    } catch {
      alert("Gagal menyimpan profil");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold text-foreground">Dars Informatika</span>
            </Link>
            <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Eye className="h-4 w-4" /> Lihat Situs
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/admin/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>

        <h1 className="mb-6 text-2xl font-bold text-foreground">Profil Pengajar</h1>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          {/* Photo */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Foto</label>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-full bg-muted">
                {photoUrl ? (
                  <img src={photoUrl} alt="Foto pengajar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl">👨‍🏫</div>
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
                <Upload className="h-4 w-4" />
                {uploading ? "Mengupload..." : "Ganti Foto"}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Nama Lengkap *</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="Nama lengkap dengan gelar" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Jabatan</label>
            <input value={position} onChange={(e) => setPosition(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="Contoh: Wali Kelas 12B, Koordinator Labkom" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Pendidikan Terakhir</label>
            <input value={education} onChange={(e) => setEducation(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="Contoh: S1 Teknik Informatika" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Bio Singkat</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" rows={3} placeholder="Deskripsi singkat tentang pengajar..." />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="email@contoh.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Nomor Telepon</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="08xx-xxxx-xxxx" />
            </div>
          </div>

          <div className="pt-2">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Sosial Media</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground"><InstagramIcon className="h-3.5 w-3.5" /> Instagram</label>
                <input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="https://instagram.com/username" />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground"><FacebookIcon className="h-3.5 w-3.5" /> Facebook</label>
                <input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="https://facebook.com/username" />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground"><YoutubeIcon className="h-3.5 w-3.5" /> YouTube</label>
                <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="https://youtube.com/@channel" />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground"><TiktokIcon className="h-3.5 w-3.5" /> TikTok</label>
                <input value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="https://tiktok.com/@username" />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground"><LinkedinIcon className="h-3.5 w-3.5" /> LinkedIn</label>
                <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="https://linkedin.com/in/username" />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground"><Globe className="h-3.5 w-3.5" /> Website</label>
                <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="https://contoh.com" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={!fullName || saving}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
