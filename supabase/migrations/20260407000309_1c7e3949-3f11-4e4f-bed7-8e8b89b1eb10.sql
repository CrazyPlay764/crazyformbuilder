-- Fix RLS policies to use get_current_user_email() instead of direct auth.users access

DROP POLICY "Admin can insert site updates" ON public.site_updates;
CREATE POLICY "Admin can insert site updates"
ON public.site_updates
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND get_current_user_email() = 'danieletigon@gmail.com'
);

DROP POLICY "Admin can update site updates" ON public.site_updates;
CREATE POLICY "Admin can update site updates"
ON public.site_updates
FOR UPDATE
TO authenticated
USING (get_current_user_email() = 'danieletigon@gmail.com');

DROP POLICY "Admin can delete site updates" ON public.site_updates;
CREATE POLICY "Admin can delete site updates"
ON public.site_updates
FOR DELETE
TO authenticated
USING (get_current_user_email() = 'danieletigon@gmail.com');

-- Add media column for images/videos
ALTER TABLE public.site_updates ADD COLUMN media jsonb DEFAULT '[]'::jsonb;