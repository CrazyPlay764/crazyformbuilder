-- Fix 1: Broken collaborator access policies (wrong column reference)
DROP POLICY IF EXISTS "Users can view collaborator forms" ON public.forms;
DROP POLICY IF EXISTS "Users can update collaborator forms" ON public.forms;

CREATE POLICY "Users can view collaborator forms"
ON public.forms
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM form_collaborators fc
    WHERE fc.form_id = forms.id  -- Fixed: explicit table reference
    AND fc.status = 'accepted'
    AND (fc.user_id = auth.uid() OR fc.email = public.get_current_user_email())
  )
);

CREATE POLICY "Users can update collaborator forms"
ON public.forms
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM form_collaborators fc
    WHERE fc.form_id = forms.id  -- Fixed: explicit table reference
    AND fc.role = 'editor'
    AND fc.status = 'accepted'
    AND (fc.user_id = auth.uid() OR fc.email = public.get_current_user_email())
  )
);

-- Fix 2: Add input validation constraints for form submissions
ALTER TABLE form_response_values
  ADD CONSTRAINT check_value_length CHECK (length(value) <= 10000);

ALTER TABLE form_response_values
  ADD CONSTRAINT check_field_label_length CHECK (length(field_label) <= 500);

ALTER TABLE form_response_values
  ADD CONSTRAINT check_field_type_length CHECK (length(field_type) <= 100);

-- Also add constraint on form_responses for respondent_email
ALTER TABLE form_responses
  ADD CONSTRAINT check_respondent_email_length CHECK (length(respondent_email) <= 255);

-- Update the RLS policy to validate response values on insert
DROP POLICY IF EXISTS "Anyone can insert response values" ON public.form_response_values;

CREATE POLICY "Anyone can insert response values"
  ON public.form_response_values
  FOR INSERT
  WITH CHECK (
    length(COALESCE(value, '')) <= 10000 AND
    length(field_label) <= 500 AND
    EXISTS (
      SELECT 1 FROM form_responses fr
      JOIN forms f ON f.id = fr.form_id
      WHERE fr.id = form_response_values.response_id
      AND f.is_published = true
    )
  );