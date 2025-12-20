-- Drop the overly permissive policy that exposes all forms
DROP POLICY IF EXISTS "Anyone can view form info" ON public.forms;

-- Create a new policy that only allows viewing PUBLISHED forms publicly
CREATE POLICY "Anyone can view published forms"
ON public.forms
FOR SELECT
USING (is_published = true);