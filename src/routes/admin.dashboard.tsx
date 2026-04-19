import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getClasses, getAllMaterials, createClass, updateClass, deleteClass,
  createMaterial, updateMaterial, deleteMaterial, uploadFile,
  type ClassItem, type MaterialItem, type AttachmentLink,
} from "@/lib/supabase-helpers";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  BookOpen, Plus, Pencil, Trash2, LogOut, Save, X, Upload, Eye, UserCog, Link2,
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
  head: () => ({
    meta: [{ title: "Dashboard Admin — Dars Informatika" }, { name: "robots", content: "noindex" }],
  }),
});

type Tab = "classes" | "materials";
type ModalMode = "create" | "edit" | null;

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("classes");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Class modal
  const [classModal, setClassModal] = useState<ModalMode>(null);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [className, setClassName] = useState("");
  const [classDesc, setClassDesc] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [classIcon, setClassIcon] = useState("📚");

  // Material modal
  const [matModal, setMatModal] = useState<ModalMode>(null);
  const [editingMat, setEditingMat] = useState<MaterialItem | null>(null);
  const [matTitle, setMatTitle] = useState("");
  const [matDesc, setMatDesc] = useState("");
  const [matContent, setMatContent] = useState("");
  const [matClassId, setMatClassId] = useState("");
  const [matCategory, setMatCategory] = useState("");
  const [matVideoUrl, setMatVideoUrl] = useState("");
  const [matFileUrl, setMatFileUrl] = useState("");
  const [matAttachments, setMatAttachments] = useState<AttachmentLink[]>([]);
  const [matPublished, setMatPublished] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [c, m] = await Promise.all([getClasses(), getAllMaterials()]);
    setClasses(c);
    setMaterials(m);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/admin" });
      else fetchData();
    });
  }, [navigate, fetchData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin" });
  };

  // Class CRUD
  const openCreateClass = () => {
    setClassName(""); setClassDesc(""); setClassGrade(""); setClassIcon("📚");
    setEditingClass(null); setClassModal("create");
  };

  const openEditClass = (c: ClassItem) => {
    setClassName(c.name); setClassDesc(c.description || ""); setClassGrade(c.grade); setClassIcon(c.icon || "📚");
    setEditingClass(c); setClassModal("edit");
  };

  const saveClass = async () => {
    setSaving(true);
    if (classModal === "create") {
      await createClass({ name: className, description: classDesc, grade: classGrade, icon: classIcon });
    } else if (editingClass) {
      await updateClass(editingClass.id, { name: className, description: classDesc, grade: classGrade, icon: classIcon });
    }
    setClassModal(null);
    setSaving(false);
    fetchData();
  };

  const handleDeleteClass = async (id: string) => {
    if (confirm("Hapus kelas ini? Semua materi di dalamnya juga akan terhapus.")) {
      await deleteClass(id);
      fetchData();
    }
  };

  // Material CRUD
  const openCreateMat = () => {
    setMatTitle(""); setMatDesc(""); setMatContent(""); setMatClassId(classes[0]?.id || "");
    setMatCategory(""); setMatVideoUrl(""); setMatFileUrl(""); setMatAttachments([]); setMatPublished(true);
    setEditingMat(null); setMatModal("create");
  };

  const openEditMat = (m: MaterialItem) => {
    setMatTitle(m.title); setMatDesc(m.description || ""); setMatContent(m.content || "");
    setMatClassId(m.class_id); setMatCategory(m.category || ""); setMatVideoUrl(m.video_url || "");
    setMatFileUrl(m.file_url || ""); setMatAttachments(m.attachments || []); setMatPublished(m.is_published ?? true);
    setEditingMat(m); setMatModal("edit");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setMatFileUrl(url);
    } catch (err) {
      alert("Gagal mengupload file");
    }
    setUploading(false);
  };

  const saveMaterial = async () => {
    setSaving(true);
    const cleanAttachments = matAttachments
      .map((a) => ({ label: a.label.trim(), url: a.url.trim() }))
      .filter((a) => a.url);
    const payload = {
      title: matTitle, description: matDesc, content: matContent,
      class_id: matClassId, category: matCategory || undefined,
      video_url: matVideoUrl || undefined, file_url: matFileUrl || undefined,
      attachments: cleanAttachments,
      is_published: matPublished,
    };
    if (matModal === "create") {
      await createMaterial(payload);
    } else if (editingMat) {
      await updateMaterial(editingMat.id, payload);
    }
    setMatModal(null);
    setSaving(false);
    fetchData();
  };

  const handleDeleteMat = async (id: string) => {
    if (confirm("Hapus materi ini?")) {
      await deleteMaterial(id);
      fetchData();
    }
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
      {/* Admin header */}
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
            <Link to="/admin/profile" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <UserCog className="h-4 w-4" /> Profil
            </Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Eye className="h-4 w-4" /> Lihat Situs
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" /> Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Tabs */}
        <div className="mb-6 flex items-center gap-4 border-b border-border">
          {(["classes", "materials"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "classes" ? "Kelas" : "Materi"}
            </button>
          ))}
        </div>

        {/* Classes Tab */}
        {tab === "classes" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Daftar Kelas</h2>
              <button onClick={openCreateClass} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" /> Tambah Kelas
              </button>
            </div>

            {classes.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Belum ada kelas. Klik "Tambah Kelas" untuk memulai.
              </div>
            ) : (
              <div className="space-y-2">
                {classes.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.icon || "📚"}</span>
                      <div>
                        <div className="font-medium text-foreground">{c.name}</div>
                        <div className="text-sm text-muted-foreground">Kelas {c.grade}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditClass(c)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteClass(c.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Materials Tab */}
        {tab === "materials" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Daftar Materi</h2>
              <button onClick={openCreateMat} disabled={classes.length === 0} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                <Plus className="h-4 w-4" /> Tambah Materi
              </button>
            </div>

            {classes.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Buat kelas terlebih dahulu sebelum menambahkan materi.
              </div>
            ) : materials.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Belum ada materi. Klik "Tambah Materi" untuk memulai.
              </div>
            ) : (
              <div className="space-y-2">
                {materials.map((m) => {
                  const cls = classes.find((c) => c.id === m.class_id);
                  return (
                    <div key={m.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground truncate">{m.title}</span>
                          {!m.is_published && (
                            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">Draft</span>
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {cls && <span>{cls.name}</span>}
                          {m.category && <span>• {m.category}</span>}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button onClick={() => openEditMat(m)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteMat(m.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Class Modal */}
      {classModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {classModal === "create" ? "Tambah Kelas" : "Edit Kelas"}
              </h3>
              <button onClick={() => setClassModal(null)} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Nama Kelas</label>
                <input value={className} onChange={(e) => setClassName(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="Contoh: Informatika Kelas 7" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Kelas / Grade</label>
                <input value={classGrade} onChange={(e) => setClassGrade(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="Contoh: 7, 8, 9, 10" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Deskripsi</label>
                <textarea value={classDesc} onChange={(e) => setClassDesc(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" rows={2} placeholder="Deskripsi singkat..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Icon (emoji)</label>
                <input value={classIcon} onChange={(e) => setClassIcon(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="📚" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setClassModal(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Batal</button>
              <button onClick={saveClass} disabled={!className || !classGrade || saving} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                <Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Modal */}
      {matModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 backdrop-blur-sm p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {matModal === "create" ? "Tambah Materi" : "Edit Materi"}
              </h3>
              <button onClick={() => setMatModal(null)} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Kelas</label>
                  <select value={matClassId} onChange={(e) => setMatClassId(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Kategori</label>
                  <input value={matCategory} onChange={(e) => setMatCategory(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="Contoh: BAB 1" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Judul</label>
                <input value={matTitle} onChange={(e) => setMatTitle(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="Judul materi..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Deskripsi Singkat</label>
                <textarea value={matDesc} onChange={(e) => setMatDesc(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" rows={2} placeholder="Deskripsi singkat materi..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Konten</label>
                <RichTextEditor content={matContent} onChange={setMatContent} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">URL Video YouTube</label>
                <input value={matVideoUrl} onChange={(e) => setMatVideoUrl(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">File Lampiran</label>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Mengupload..." : "Pilih File"}
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                  {matFileUrl && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="truncate max-w-[200px]">File terupload</span>
                      <button onClick={() => setMatFileUrl("")} className="text-destructive hover:underline">Hapus</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="published" checked={matPublished} onChange={(e) => setMatPublished(e.target.checked)} className="h-4 w-4 rounded border-input accent-primary" />
                <label htmlFor="published" className="text-sm text-foreground">Publikasikan</label>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setMatModal(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Batal</button>
              <button onClick={saveMaterial} disabled={!matTitle || !matClassId || saving} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                <Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
