import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface ClassItem {
  id: string;
  name: string;
  description: string | null;
  grade: string;
  icon: string | null;
  sort_order: number | null;
  created_at: string;
}

export interface AttachmentLink {
  label: string;
  url: string;
}

export interface MaterialItem {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  content: string | null;
  category: string | null;
  file_url: string | null;
  video_url: string | null;
  is_published: boolean | null;
  sort_order: number | null;
  attachments: AttachmentLink[] | null;
  created_at: string;
  updated_at: string;
}

// Public queries
export async function getClasses(): Promise<ClassItem[]> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("grade", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getClassById(id: string): Promise<ClassItem | null> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

function parseAttachments(value: unknown): AttachmentLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is { label?: unknown; url?: unknown } => typeof v === "object" && v !== null)
    .map((v) => ({
      label: typeof v.label === "string" ? v.label : "",
      url: typeof v.url === "string" ? v.url : "",
    }))
    .filter((a) => a.url);
}

function mapMaterial(row: Record<string, unknown>): MaterialItem {
  return { ...(row as unknown as MaterialItem), attachments: parseAttachments(row.attachments) };
}

export async function getMaterialsByClassId(classId: string): Promise<MaterialItem[]> {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("class_id", classId)
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapMaterial);
}

export async function getMaterialById(id: string): Promise<MaterialItem | null> {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data ? mapMaterial(data) : null;
}

// Admin queries
export async function getAllMaterials(): Promise<MaterialItem[]> {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapMaterial);
}

export async function createClass(classData: { name: string; description?: string; grade: string; icon?: string }) {
  const { data, error } = await supabase.from("classes").insert(classData).select().single();
  if (error) throw error;
  return data;
}

export async function updateClass(id: string, classData: Partial<ClassItem>) {
  const { data, error } = await supabase.from("classes").update(classData).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteClass(id: string) {
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) throw error;
}

export async function createMaterial(material: {
  class_id: string;
  title: string;
  description?: string;
  content?: string;
  category?: string;
  file_url?: string;
  video_url?: string;
  is_published?: boolean;
  attachments?: AttachmentLink[];
}) {
  const { attachments, ...rest } = material;
  const payload = { ...rest, attachments: (attachments ?? []) as unknown as Json };
  const { data, error } = await supabase.from("materials").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateMaterial(id: string, material: Partial<MaterialItem>) {
  const { attachments, ...rest } = material;
  const payload = {
    ...rest,
    ...(attachments !== undefined ? { attachments: attachments as unknown as Json } : {}),
  };
  const { data, error } = await supabase.from("materials").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMaterial(id: string) {
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) throw error;
}

// Teacher profile
export interface TeacherProfile {
  id: string;
  full_name: string;
  position: string | null;
  education: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  extras: unknown;
  created_at: string;
  updated_at: string;
}

export async function getTeacherProfile(): Promise<TeacherProfile | null> {
  const { data, error } = await supabase
    .from("teacher_profile")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data as TeacherProfile | null;
}

export async function upsertTeacherProfile(profile: Partial<TeacherProfile> & { id?: string }) {
  if (profile.id) {
    const updatePayload = {
      full_name: profile.full_name,
      position: profile.position,
      education: profile.education,
      bio: profile.bio,
      email: profile.email,
      phone: profile.phone,
      photo_url: profile.photo_url,
    };
    const { data, error } = await supabase
      .from("teacher_profile")
      .update(updatePayload)
      .eq("id", profile.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("teacher_profile")
    .insert({
      full_name: profile.full_name || "Pengajar",
      position: profile.position,
      education: profile.education,
      bio: profile.bio,
      email: profile.email,
      phone: profile.phone,
      photo_url: profile.photo_url,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadTeacherPhoto(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `teacher/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const { error } = await supabase.storage.from("materials").upload(fileName, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("materials").getPublicUrl(fileName);
  return urlData.publicUrl;
}

export async function uploadFile(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const { error } = await supabase.storage.from("materials").upload(fileName, file);
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("materials").getPublicUrl(fileName);
  return urlData.publicUrl;
}
