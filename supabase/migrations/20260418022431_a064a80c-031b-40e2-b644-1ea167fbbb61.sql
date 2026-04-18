-- Tabel profil pengajar (single-row, dikelola admin)
CREATE TABLE public.teacher_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  position TEXT,
  education TEXT,
  bio TEXT,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  extras JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_profile ENABLE ROW LEVEL SECURITY;

-- Publik bisa lihat profil
CREATE POLICY "Teacher profile viewable by everyone"
ON public.teacher_profile FOR SELECT
USING (true);

-- Admin (authenticated) bisa kelola
CREATE POLICY "Authenticated can insert teacher profile"
ON public.teacher_profile FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update teacher profile"
ON public.teacher_profile FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated can delete teacher profile"
ON public.teacher_profile FOR DELETE
TO authenticated
USING (true);

-- Trigger updated_at
CREATE TRIGGER update_teacher_profile_updated_at
BEFORE UPDATE ON public.teacher_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();