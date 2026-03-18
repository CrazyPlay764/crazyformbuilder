
-- Create site_updates table
CREATE TABLE public.site_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_updates ENABLE ROW LEVEL SECURITY;

-- Everyone can read updates
CREATE POLICY "Anyone can view site updates"
ON public.site_updates FOR SELECT
TO public
USING (true);

-- Only admin (by email) can insert
CREATE POLICY "Admin can insert site updates"
ON public.site_updates FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (SELECT email FROM auth.users WHERE id = auth.uid()) = 'danieletigon@gmail.com'
);

-- Only admin can update
CREATE POLICY "Admin can update site updates"
ON public.site_updates FOR UPDATE
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'danieletigon@gmail.com'
);

-- Only admin can delete
CREATE POLICY "Admin can delete site updates"
ON public.site_updates FOR DELETE
TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'danieletigon@gmail.com'
);

-- Add updated_at trigger
CREATE TRIGGER update_site_updates_updated_at
  BEFORE UPDATE ON public.site_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
