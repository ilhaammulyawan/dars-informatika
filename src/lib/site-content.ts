import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  BookOpen, GraduationCap, Sparkles, Code2, Lightbulb, Rocket, Target,
  Brain, Cpu, Database, Cloud, Globe, Heart, Star, Zap, Trophy,
  Users, MessageCircle, ShieldCheck, Compass, Award, PenTool, Laptop,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen, GraduationCap, Sparkles, Code2, Lightbulb, Rocket, Target,
  Brain, Cpu, Database, Cloud, Globe, Heart, Star, Zap, Trophy,
  Users, MessageCircle, ShieldCheck, Compass, Award, PenTool, Laptop,
};
export const ICON_NAMES = Object.keys(ICON_MAP);

export function getIcon(name: string | undefined | null, fallback: LucideIcon = Sparkles): LucideIcon {
  if (!name) return fallback;
  return ICON_MAP[name] ?? fallback;
}

export interface InfoItem { icon: string; label: string }
export interface FeatureItem { icon: string; title: string; description: string }

export interface HomeContent {
  site_name: string;
  logo_url: string | null;
  hero: {
    badge: string;
    title_line1: string;
    title_line2: string;
    description: string;
    info_items: InfoItem[];
  };
  why: {
    title: string;
    description: string;
    features: FeatureItem[];
  };
  classes_title: string;
  footer_text: string;
  credits_prefix: string;
  credits_name: string;
  credits_url: string;
}

export const DEFAULT_HOME_CONTENT: HomeContent = {
  site_name: "Dars Informatika",
  logo_url: null,
  hero: {
    badge: "Platform Materi Informatika",
    title_line1: "Belajar Informatika",
    title_line2: "Jadi Lebih Mudah",
    description: "Pilih kelas kamu dan akses semua materi pembelajaran informatika secara gratis.",
    info_items: [
      { icon: "BookOpen", label: "Materi Lengkap" },
      { icon: "GraduationCap", label: "Semua Kelas" },
    ],
  },
  why: {
    title: "Kenapa Belajar Informatika di Sini?",
    description:
      "Platform yang dirancang khusus untuk memudahkan siswa memahami dunia teknologi dengan pendekatan yang menyenangkan.",
    features: [
      { icon: "Code2", title: "Materi Terstruktur", description: "Disusun rapi per kelas dan topik agar mudah diikuti dari dasar." },
      { icon: "Lightbulb", title: "Konsep Mudah Dipahami", description: "Penjelasan sederhana dilengkapi contoh dan video pembelajaran." },
      { icon: "Rocket", title: "Akses Kapan Saja", description: "Belajar fleksibel di mana saja dan kapan saja, gratis untuk semua siswa." },
      { icon: "Target", title: "Siap Hadapi Era Digital", description: "Membekali siswa dengan kompetensi informatika untuk masa depan." },
    ],
  },
  classes_title: "Pilih Kelas",
  footer_text: "© {year} Dars Informatika — Dibuat oleh Guru Informatika",
  credits_prefix: "Built by ",
  credits_name: "Mulyawan",
  credits_url: "https://mulyawan.biz.id",
};

const HOME_KEY = "home_page";

function mergeWithDefaults(value: unknown): HomeContent {
  const v = (value && typeof value === "object" ? value : {}) as Partial<HomeContent>;
  const d = DEFAULT_HOME_CONTENT;
  return {
    site_name: v.site_name || d.site_name,
    logo_url: v.logo_url ?? d.logo_url,
    hero: {
      badge: v.hero?.badge ?? d.hero.badge,
      title_line1: v.hero?.title_line1 ?? d.hero.title_line1,
      title_line2: v.hero?.title_line2 ?? d.hero.title_line2,
      description: v.hero?.description ?? d.hero.description,
      info_items: Array.isArray(v.hero?.info_items) && v.hero!.info_items.length > 0
        ? v.hero!.info_items.map((i) => ({ icon: i?.icon || "Sparkles", label: i?.label || "" }))
        : d.hero.info_items,
    },
    why: {
      title: v.why?.title ?? d.why.title,
      description: v.why?.description ?? d.why.description,
      features: Array.isArray(v.why?.features) && v.why!.features.length > 0
        ? v.why!.features.map((f) => ({
            icon: f?.icon || "Sparkles",
            title: f?.title || "",
            description: f?.description || "",
          }))
        : d.why.features,
    },
    classes_title: v.classes_title ?? d.classes_title,
    footer_text: v.footer_text ?? d.footer_text,
    credits_prefix: v.credits_prefix ?? d.credits_prefix,
    credits_name: v.credits_name ?? d.credits_name,
    credits_url: v.credits_url ?? d.credits_url,
  };
}

export async function getHomeContent(): Promise<HomeContent> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", HOME_KEY)
    .maybeSingle();
  if (error || !data) return DEFAULT_HOME_CONTENT;
  return mergeWithDefaults(data.value);
}

export async function saveHomeContent(content: HomeContent): Promise<void> {
  const { data: existing } = await supabase
    .from("site_settings")
    .select("id")
    .eq("key", HOME_KEY)
    .maybeSingle();
  const value = content as unknown as Json;
  if (existing?.id) {
    const { error } = await supabase
      .from("site_settings")
      .update({ value })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("site_settings")
      .insert({ key: HOME_KEY, value });
    if (error) throw error;
  }
}

export async function uploadLogo(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `branding/logo-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
  const { error } = await supabase.storage.from("materials").upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from("materials").getPublicUrl(fileName);
  return data.publicUrl;
}

export function renderFooter(text: string): string {
  return text.replace(/\{year\}/g, String(new Date().getFullYear()));
}
