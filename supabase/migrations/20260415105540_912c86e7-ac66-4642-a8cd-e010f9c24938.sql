-- Create classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  grade TEXT NOT NULL,
  icon TEXT DEFAULT '📚',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create materials table
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category TEXT,
  file_url TEXT,
  video_url TEXT,
  is_published BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Public read access for classes
CREATE POLICY "Classes are viewable by everyone"
  ON public.classes FOR SELECT USING (true);

-- Admin full access for classes
CREATE POLICY "Authenticated users can insert classes"
  ON public.classes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update classes"
  ON public.classes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete classes"
  ON public.classes FOR DELETE TO authenticated USING (true);

-- Public read access for published materials
CREATE POLICY "Published materials are viewable by everyone"
  ON public.materials FOR SELECT USING (is_published = true);

-- Admin full access for materials
CREATE POLICY "Authenticated users can select all materials"
  ON public.materials FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert materials"
  ON public.materials FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update materials"
  ON public.materials FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete materials"
  ON public.materials FOR DELETE TO authenticated USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for material files
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true);

-- Public read access for material files
CREATE POLICY "Material files are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'materials');

-- Authenticated users can upload material files
CREATE POLICY "Authenticated users can upload material files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Authenticated users can update material files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'materials');

CREATE POLICY "Authenticated users can delete material files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'materials');

-- Indexes
CREATE INDEX idx_materials_class_id ON public.materials(class_id);
CREATE INDEX idx_materials_category ON public.materials(category);
CREATE INDEX idx_classes_grade ON public.classes(grade);