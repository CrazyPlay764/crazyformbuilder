
-- Update form_responses SELECT policy to include collaborators
DROP POLICY "Form owners can view responses" ON public.form_responses;
CREATE POLICY "Form owners and collaborators can view responses"
ON public.form_responses FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM forms
    WHERE forms.id = form_responses.form_id
    AND (
      forms.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM form_collaborators fc
        WHERE fc.form_id = forms.id
        AND fc.status = 'accepted'
        AND (fc.user_id = auth.uid() OR fc.email = get_current_user_email())
      )
    )
  )
);

-- Update form_response_values SELECT policy to include collaborators
DROP POLICY "Form owners can view response values" ON public.form_response_values;
CREATE POLICY "Form owners and collaborators can view response values"
ON public.form_response_values FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM form_responses
    JOIN forms ON forms.id = form_responses.form_id
    WHERE form_responses.id = form_response_values.response_id
    AND (
      forms.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM form_collaborators fc
        WHERE fc.form_id = forms.id
        AND fc.status = 'accepted'
        AND (fc.user_id = auth.uid() OR fc.email = get_current_user_email())
      )
    )
  )
);
