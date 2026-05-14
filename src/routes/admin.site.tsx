import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getHomeContent, saveHomeContent, uploadLogo, getIcon,
  ICON_NAMES, DEFAULT_HOME_CONTENT, type HomeContent, type FeatureItem, type InfoItem,
} from "@/lib/site-content";
import { BookOpen, ArrowLeft, Save, Upload, LogOut, Eye, Plus, Trash2, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/admin/site")({
  component: AdminSitePage,
  head: () => ({
    meta: [{ title: "Konten Halaman Utama — Admin" }, { name: "robots", content: "noindex" }],
  }),
});

function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const Icon = getIcon(value);
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-input bg-background text-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
      >
        {ICON_NAMES.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
    </div>
  );
}

function AdminSitePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT);

  const load = useCallback(async () => {
    const c = await getHomeContent();
    setContent(c);
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadLogo(file);
      setContent({ ...content, logo_url: url });
    } catch {
      alert("Gagal mengunggah logo");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveHomeContent(content);
      alert("Konten halaman utama berhasil disimpan");
    } catch {
      alert("Gagal menyimpan konten");
    }
    setSaving(false);
  };

  const updateInfoItem = (idx: number, patch: Partial<InfoItem>) => {
    const items = [...content.hero.info_items];
    items[idx] = { ...items[idx], ...patch };
    setContent({ ...content, hero: { ...content.hero, info_items: items } });
  };

  const addInfoItem = () => {
    setContent({
      ...content,
      hero: { ...content.hero, info_items: [...content.hero.info_items, { icon: "Sparkles", label: "" }] },
    });
  };

  const removeInfoItem = (idx: number) => {
    setContent({
      ...content,
      hero: { ...content.hero, info_items: content.hero.info_items.filter((_, i) => i !== idx) },
    });
  };

  const updateFeature = (idx: number, patch: Partial<FeatureItem>) => {
    const features = [...content.why.features];
    features[idx] = { ...features[idx], ...patch };
    setContent({ ...content, why: { ...content.why, features } });
  };

  const addFeature = () => {
    setContent({
      ...content,
      why: { ...content.why, features: [...content.why.features, { icon: "Sparkles", title: "", description: "" }] },
    });
  };

  const removeFeature = (idx: number) => {
    setContent({
      ...content,
      why: { ...content.why, features: content.why.features.filter((_, i) => i !== idx) },
    });
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
            <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
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

        <h1 className="mb-6 text-2xl font-bold text-foreground">Konten Halaman Utama</h1>

        <Section title="Identitas Situs">
          <Field label="Nama Situs">
            <input
              value={content.site_name}
              onChange={(e) => setContent({ ...content, site_name: e.target.value })}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              placeholder="Dars Informatika"
            />
          </Field>
          <Field label="Logo">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                {content.logo_url ? (
                  <img src={content.logo_url} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <BookOpen className="h-7 w-7 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
                  <Upload className="h-4 w-4" />
                  {uploading ? "Mengunggah..." : "Unggah Logo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                </label>
                {content.logo_url && (
                  <button
                    onClick={() => setContent({ ...content, logo_url: null })}
                    className="flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:text-destructive"
                  >
                    <RotateCcw className="h-4 w-4" /> Pakai default
                  </button>
                )}
              </div>
            </div>
          </Field>
        </Section>

        <Section title="Hero (Bagian Atas)">
          <Field label="Badge">
            <input
              value={content.hero.badge}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, badge: e.target.value } })}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Judul Baris 1">
              <input
                value={content.hero.title_line1}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, title_line1: e.target.value } })}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              />
            </Field>
            <Field label="Judul Baris 2">
              <input
                value={content.hero.title_line2}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, title_line2: e.target.value } })}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              />
            </Field>
          </div>
          <Field label="Deskripsi">
            <textarea
              value={content.hero.description}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </Field>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Item Info (ikon + teks)</label>
              <button onClick={addInfoItem} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="h-3.5 w-3.5" /> Tambah item
              </button>
            </div>
            <div className="space-y-2">
              {content.hero.info_items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-48 shrink-0">
                    <IconSelect value={item.icon} onChange={(v) => updateInfoItem(idx, { icon: v })} />
                  </div>
                  <input
                    value={item.label}
                    onChange={(e) => updateInfoItem(idx, { label: e.target.value })}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                    placeholder="Teks info"
                  />
                  <button onClick={() => removeInfoItem(idx)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title='Section "Kenapa Belajar di Sini"'>
          <Field label="Judul">
            <input
              value={content.why.title}
              onChange={(e) => setContent({ ...content, why: { ...content.why, title: e.target.value } })}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            />
          </Field>
          <Field label="Deskripsi">
            <textarea
              value={content.why.description}
              onChange={(e) => setContent({ ...content, why: { ...content.why, description: e.target.value } })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              rows={2}
            />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Kartu Fitur</label>
              <button onClick={addFeature} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus className="h-3.5 w-3.5" /> Tambah fitur
              </button>
            </div>
            <div className="space-y-3">
              {content.why.features.map((f, idx) => (
                <div key={idx} className="rounded-lg border border-border bg-background p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fitur {idx + 1}</span>
                    <button onClick={() => removeFeature(idx)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <IconSelect value={f.icon} onChange={(v) => updateFeature(idx, { icon: v })} />
                  <input
                    value={f.title}
                    onChange={(e) => updateFeature(idx, { title: e.target.value })}
                    className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
                    placeholder="Judul fitur"
                  />
                  <textarea
                    value={f.description}
                    onChange={(e) => updateFeature(idx, { description: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Deskripsi fitur"
                  />
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Lainnya">
          <Field label='Judul Section "Pilih Kelas"'>
            <input
              value={content.classes_title}
              onChange={(e) => setContent({ ...content, classes_title: e.target.value })}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            />
          </Field>
          <Field label="Footer (gunakan {year} untuk tahun otomatis)">
            <input
              value={content.footer_text}
              onChange={(e) => setContent({ ...content, footer_text: e.target.value })}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            />
          </Field>
        </Section>

        <div className="sticky bottom-0 -mx-4 mt-6 border-t border-border bg-card/80 px-4 py-3 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
