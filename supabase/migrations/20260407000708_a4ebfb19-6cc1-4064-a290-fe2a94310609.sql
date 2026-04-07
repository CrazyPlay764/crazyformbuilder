CREATE TABLE public.site_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site links"
ON public.site_links FOR SELECT
USING (true);

CREATE POLICY "Admin can insert site links"
ON public.site_links FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND get_current_user_email() = 'danieletigon@gmail.com'
);

CREATE POLICY "Admin can update site links"
ON public.site_links FOR UPDATE
TO authenticated
USING (get_current_user_email() = 'danieletigon@gmail.com');

CREATE POLICY "Admin can delete site links"
ON public.site_links FOR DELETE
TO authenticated
USING (get_current_user_email() = 'danieletigon@gmail.com');

CREATE TRIGGER update_site_links_updated_at
BEFORE UPDATE ON public.site_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();