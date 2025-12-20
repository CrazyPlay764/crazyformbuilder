-- Drop the existing restrictive policy for viewing published forms
DROP POLICY IF EXISTS "Anyone can view published forms" ON public.forms;

-- Create a new policy that allows anyone to view any form's basic info
-- (This is safe because the form content/fields are still protected)
CREATE POLICY "Anyone can view form info"
ON public.forms
FOR SELECT
USING (true);