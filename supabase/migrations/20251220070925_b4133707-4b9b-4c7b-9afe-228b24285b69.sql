-- Allow anyone to view published forms (for form preview)
CREATE POLICY "Anyone can view published forms"
ON public.forms
FOR SELECT
USING (is_published = true);

-- Allow anyone to view fields of published forms
CREATE POLICY "Anyone can view fields of published forms"
ON public.form_fields
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_fields.form_id
    AND forms.is_published = true
  )
);