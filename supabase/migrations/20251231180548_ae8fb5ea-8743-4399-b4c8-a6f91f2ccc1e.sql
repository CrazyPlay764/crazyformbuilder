-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Anyone can insert response values" ON public.form_response_values;

-- Create a simpler policy that checks form publication status via response_id
-- The response is already created at this point, so we can check it
CREATE POLICY "Anyone can insert response values" 
ON public.form_response_values 
FOR INSERT 
WITH CHECK (
  length(COALESCE(value, ''::text)) <= 10000 
  AND length(field_label) <= 500
  AND EXISTS (
    SELECT 1 
    FROM form_responses fr
    JOIN forms f ON f.id = fr.form_id
    WHERE fr.id = response_id 
    AND f.is_published = true
  )
);